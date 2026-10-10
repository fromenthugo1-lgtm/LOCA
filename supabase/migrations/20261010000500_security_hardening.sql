-- Durcissement après relecture de sécurité (docs/DECISIONS.md, D-014).

-- ---------------------------------------------------------------------------
-- 1. Un super_admin suspendu ou anonymisé perd immédiatement ses droits en base,
--    même si son jeton de session est encore valide.
-- ---------------------------------------------------------------------------
create or replace function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.platform_admins a
      join public.profiles p on p.id = a.user_id
     where a.user_id = (select auth.uid())
       and p.account_status <> 'suspended'
       and p.anonymized_at is null
  );
$$;

-- Un admin ne peut pas suspendre ou rétrograder un autre admin depuis l'interface :
-- la gestion des administrateurs se fait par accès privilégié (README).
create or replace function public.admin_set_account_status(
  p_user_id uuid,
  p_status public.account_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old public.account_status;
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'cannot_change_own_status' using errcode = '42501';
  end if;
  if exists (select 1 from public.platform_admins where user_id = p_user_id) then
    raise exception 'target_is_admin' using errcode = '42501';
  end if;

  select account_status into v_old from public.profiles where id = p_user_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  update public.profiles set account_status = p_status where id = p_user_id;

  perform private.write_audit_log(
    'account_status_changed', 'profiles', p_user_id::text,
    jsonb_build_object('from', v_old, 'to', p_status, 'reason', left(coalesce(p_reason, ''), 300))
  );
end;
$$;

create or replace function public.admin_anonymize_account(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scheduled timestamptz;
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select deletion_scheduled_for into v_scheduled from public.profiles where id = p_user_id for update;
  if v_scheduled is null then
    raise exception 'deletion_not_scheduled' using errcode = '22023';
  end if;
  if v_scheduled > now() then
    raise exception 'grace_period_not_over' using errcode = '22023';
  end if;

  delete from public.company_members where user_id = p_user_id;
  delete from public.platform_admins where user_id = p_user_id;
  update public.profiles
     set full_name = null, account_status = 'suspended', anonymized_at = now()
   where id = p_user_id;
  update public.gdpr_requests
     set requester_email = 'anonymise-' || left(id::text, 8) || '@invalid'
   where user_id = p_user_id;

  perform private.write_audit_log('account_anonymized', 'profiles', p_user_id::text, '{}'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. L'acceptation des CGU n'est plus déduite des métadonnées d'inscription (modifiables
--    par un appel direct à l'API Auth). Elle est enregistrée par le serveur après la case
--    cochée, ou par l'utilisateur à sa première connexion (accept_terms).
-- ---------------------------------------------------------------------------
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

-- Appelée par l'action d'inscription du site (clé secrète) juste après la création du compte.
create function public.record_signup_terms_acceptance(p_user_id uuid, p_version text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_version is null or p_version !~ '^[A-Za-z0-9._-]{1,40}$' then
    raise exception 'invalid_version' using errcode = '22023';
  end if;
  -- Uniquement pour un compte qui vient d'être créé et qui n'a encore rien accepté.
  update public.profiles
     set terms_version = p_version, terms_accepted_at = now()
   where id = p_user_id
     and terms_accepted_at is null
     and created_at > now() - interval '10 minutes';
end;
$$;
revoke all on function public.record_signup_terms_acceptance(uuid, text) from public, anon, authenticated;
grant execute on function public.record_signup_terms_acceptance(uuid, text) to service_role;

-- ---------------------------------------------------------------------------
-- 3. E-mails jamais hachés en clair dans la base : l'empreinte (HMAC) est calculée par
--    le serveur avec un secret. Plus d'empreinte d'e-mail dans le journal d'audit.
-- ---------------------------------------------------------------------------
drop function public.submit_demo_request(text, text, text, text, text, text, text, text, text);

create function public.submit_demo_request(
  p_full_name text,
  p_email text,
  p_company_name text,
  p_job_title text,
  p_sector text,
  p_company_size text,
  p_phone text,
  p_message text,
  p_ip_hash text,
  p_email_hash text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_ip_hash is null or not public.check_rate_limit('demo_ip', p_ip_hash, 3, 3600) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if p_email_hash is null or not public.check_rate_limit('demo_email', p_email_hash, 3, 86400) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if not public.check_rate_limit('demo_global', 'global-demo-requests', 200, 3600) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.demo_requests (
    full_name, email, company_name, job_title, sector, company_size, phone, message, ip_hash
  ) values (
    trim(p_full_name), lower(trim(p_email)), trim(p_company_name), trim(p_job_title), trim(p_sector),
    nullif(trim(p_company_size), ''), nullif(trim(p_phone), ''), nullif(trim(p_message), ''), p_ip_hash
  )
  returning id into v_id;

  return v_id;
end;
$$;
revoke all on function public.submit_demo_request(text, text, text, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_demo_request(text, text, text, text, text, text, text, text, text, text) to service_role;

create or replace function public.admin_export_personal_data(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_uid uuid;
  v_result jsonb;
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select id into v_uid from auth.users where lower(email) = v_email limit 1;

  select jsonb_build_object(
    'generated_at', now(),
    'email', v_email,
    'account', (
      select jsonb_build_object(
        'id', u.id, 'email', u.email, 'created_at', u.created_at,
        'email_confirmed_at', u.email_confirmed_at, 'last_sign_in_at', u.last_sign_in_at,
        'full_name', p.full_name, 'account_status', p.account_status,
        'terms_version', p.terms_version, 'terms_accepted_at', p.terms_accepted_at,
        'deletion_requested_at', p.deletion_requested_at
      )
      from auth.users u join public.profiles p on p.id = u.id where u.id = v_uid
    ),
    'company_memberships', coalesce((
      select jsonb_agg(jsonb_build_object('company', c.name, 'role', m.role, 'since', m.created_at))
        from public.company_members m join public.companies c on c.id = m.company_id
       where m.user_id = v_uid
    ), '[]'::jsonb),
    'demo_requests', coalesce((
      select jsonb_agg(jsonb_build_object(
        'created_at', d.created_at, 'full_name', d.full_name, 'email', d.email,
        'company_name', d.company_name, 'job_title', d.job_title, 'sector', d.sector,
        'company_size', d.company_size, 'phone', d.phone, 'message', d.message, 'status', d.status))
        from public.demo_requests d where lower(d.email) = v_email
    ), '[]'::jsonb),
    'gdpr_requests', coalesce((
      select jsonb_agg(jsonb_build_object('type', g.request_type, 'status', g.status,
        'received_at', g.received_at, 'completed_at', g.completed_at))
        from public.gdpr_requests g where lower(g.requester_email) = v_email or g.user_id = v_uid
    ), '[]'::jsonb)
  ) into v_result;

  perform private.write_audit_log('personal_data_exported', 'auth.users', coalesce(v_uid::text, 'sans-compte'), '{}'::jsonb);
  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Notes internes de SpendEdge sur une entreprise : table séparée, lisible par le
--    super_admin seulement (les membres de l'entreprise lisent `companies`).
-- ---------------------------------------------------------------------------
create table public.company_internal_notes (
  company_id uuid primary key references public.companies (id) on delete cascade,
  notes text not null check (char_length(notes) <= 4000),
  updated_at timestamptz not null default now()
);
alter table public.company_internal_notes enable row level security;
revoke all on table public.company_internal_notes from anon, authenticated;
grant select, insert, update, delete on table public.company_internal_notes to authenticated;

create policy "company_internal_notes: super_admin gère"
  on public.company_internal_notes for all to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));

create trigger company_internal_notes_set_updated_at
  before update on public.company_internal_notes
  for each row execute function private.set_updated_at();

create trigger company_internal_notes_audit
  after insert or update or delete on public.company_internal_notes
  for each row execute function private.audit_row_change('company_id');

insert into public.company_internal_notes (company_id, notes)
  select id, notes from public.companies where notes is not null and notes <> '';
alter table public.companies drop column notes;

-- ---------------------------------------------------------------------------
-- 5. Conservation : empreinte IP des démos effacée après 30 jours, conservation des
--    demandes comptée à partir du dernier échange, purges planifiées chaque nuit.
-- ---------------------------------------------------------------------------
create function private.extend_demo_retention()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.retain_until := now() + interval '3 years';
  return new;
end;
$$;

create trigger demo_requests_extend_retention
  before update of status, internal_notes on public.demo_requests
  for each row execute function private.extend_demo_retention();

create function public.purge_expired_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ip integer;
  v_rate integer;
  v_demo integer;
begin
  update public.demo_requests set ip_hash = null
   where ip_hash is not null and created_at < now() - interval '30 days';
  get diagnostics v_ip = row_count;

  delete from public.rate_limit_events where created_at < now() - interval '2 days';
  get diagnostics v_rate = row_count;

  delete from public.demo_requests where retain_until < now();
  get diagnostics v_demo = row_count;

  perform private.write_audit_log('retention_purge', null, null,
    jsonb_build_object('ip_hashes_cleared', v_ip, 'rate_limit_events_deleted', v_rate, 'demo_requests_deleted', v_demo));
  return jsonb_build_object('ip_hashes_cleared', v_ip, 'rate_limit_events_deleted', v_rate, 'demo_requests_deleted', v_demo);
end;
$$;
revoke all on function public.purge_expired_data() from public, anon, authenticated;
grant execute on function public.purge_expired_data() to service_role;

-- Planification quotidienne (03 h 17 UTC) avec pg_cron, disponible sur Supabase.
create extension if not exists pg_cron;
select cron.schedule('spendedge-purge-expired-data', '17 3 * * *', $$select public.purge_expired_data()$$);

-- ---------------------------------------------------------------------------
-- 6. La demande de suppression ne journalise qu'une fois (pas d'inondation du journal).
-- ---------------------------------------------------------------------------
create or replace function public.request_account_deletion()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_email text;
  v_already timestamptz;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select deletion_requested_at into v_already from public.profiles where id = v_uid for update;
  if v_already is not null then
    return;
  end if;

  select email into v_email from auth.users where id = v_uid;
  update public.profiles set deletion_requested_at = now() where id = v_uid;

  insert into public.gdpr_requests (request_type, requester_email, user_id, channel, identity_verified_at, identity_method)
  values ('erasure', v_email, v_uid, 'account', now(), 'Demande faite depuis le compte connecté');

  perform private.write_audit_log('account_deletion_requested', 'profiles', v_uid::text, '{}'::jsonb);
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Journal d'audit : ignorer les écritures purement techniques (effacement de
--    l'empreinte IP, prolongation de conservation) pour ne pas noyer le journal.
-- ---------------------------------------------------------------------------
create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id text;
  v_changed text[];
begin
  if tg_op = 'DELETE' then
    v_id := (to_jsonb(old) ->> tg_argv[0]);
  else
    v_id := (to_jsonb(new) ->> tg_argv[0]);
  end if;

  if tg_op = 'UPDATE' then
    select coalesce(array_agg(n.key order by n.key), '{}')
      into v_changed
      from jsonb_each(to_jsonb(new)) n
      join jsonb_each(to_jsonb(old)) o using (key)
     where n.value is distinct from o.value
       and n.key not in ('updated_at', 'updated_by', 'ip_hash', 'retain_until');
    if cardinality(v_changed) = 0 then
      return new;
    end if;
  end if;

  perform private.write_audit_log(
    lower(tg_op),
    tg_table_name,
    v_id,
    case when tg_op = 'UPDATE' then jsonb_build_object('changed', to_jsonb(v_changed)) else '{}'::jsonb end
  );
  return coalesce(new, old);
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. Les clés de section suivent les noms du code (« home.finalCta ») : majuscules admises.
-- ---------------------------------------------------------------------------
alter table public.site_content drop constraint site_content_key_check;
alter table public.site_content add constraint site_content_key_check check (key ~ '^[A-Za-z0-9_.-]{1,64}$');
