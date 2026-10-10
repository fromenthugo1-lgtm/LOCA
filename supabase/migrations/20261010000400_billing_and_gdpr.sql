-- Abonnements et événements de paiement (structure seulement, aucun prestataire branché),
-- demandes RGPD et processus de suppression de compte.

-- ---------------------------------------------------------------------------
-- Abonnements
-- ---------------------------------------------------------------------------
create type public.subscription_status as enum (
  'trialing', 'active', 'past_due', 'unpaid', 'canceled', 'expired', 'incomplete'
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete restrict,
  plan_id uuid not null references public.plans (id) on delete restrict,
  status public.subscription_status not null default 'incomplete',
  started_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  ended_at timestamptz,
  setup_fee_billed boolean not null default false,
  -- Renseignés uniquement par les webhooks signés du prestataire (futur).
  provider text check (provider in ('stripe')),
  provider_customer_id text,
  provider_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_company_idx on public.subscriptions (company_id);
-- Une seule souscription en cours par entreprise.
create unique index subscriptions_one_current_per_company
  on public.subscriptions (company_id)
  where status in ('trialing', 'active', 'past_due', 'unpaid', 'incomplete');
alter table public.subscriptions enable row level security;
revoke all on table public.subscriptions from anon, authenticated;
grant select on table public.subscriptions to authenticated;

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function private.set_updated_at();

create policy "subscriptions: membres actifs lisent celle de leur entreprise"
  on public.subscriptions for select to authenticated
  using ((select private.can_access_company(company_id)));

create policy "subscriptions: super_admin lit tout"
  on public.subscriptions for select to authenticated
  using ((select private.is_super_admin()));

-- Aucune politique d'écriture : en V1 il n'existe aucune transaction. Les écritures futures
-- viendront du traitement des webhooks côté serveur (clé secrète), après vérification de la
-- signature et de l'idempotence (docs/paiements.md).

create trigger subscriptions_audit
  after insert or update or delete on public.subscriptions
  for each row execute function private.audit_row_change('id');

-- Droit d'accès calculé côté base à partir de l'état réel de l'abonnement.
create function private.company_has_active_subscription(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions s
     where s.company_id = p_company_id
       and (
         (s.status = 'active' and (s.current_period_end is null or s.current_period_end > now()))
         or (s.status = 'trialing' and s.trial_ends_at > now())
       )
  );
$$;
revoke all on function private.company_has_active_subscription(uuid) from public;
grant execute on function private.company_has_active_subscription(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Événements de paiement (webhooks), idempotents
-- ---------------------------------------------------------------------------
create table public.billing_events (
  id bigint generated always as identity primary key,
  provider text not null check (provider in ('stripe')),
  provider_event_id text not null,
  event_type text not null check (char_length(event_type) <= 120),
  company_id uuid references public.companies (id) on delete set null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  unique (provider, provider_event_id)
);
alter table public.billing_events enable row level security;
revoke all on table public.billing_events from anon, authenticated;
grant select on table public.billing_events to authenticated;

create policy "billing_events: super_admin lit"
  on public.billing_events for select to authenticated
  using ((select private.is_super_admin()));

-- ---------------------------------------------------------------------------
-- Demandes RGPD (droits des personnes)
-- ---------------------------------------------------------------------------
create type public.gdpr_request_type as enum (
  'access', 'rectification', 'erasure', 'restriction', 'portability', 'objection', 'consent_withdrawal'
);
create type public.gdpr_request_status as enum (
  'received', 'identity_check', 'in_progress', 'completed', 'rejected'
);

create table public.gdpr_requests (
  id uuid primary key default gen_random_uuid(),
  request_type public.gdpr_request_type not null,
  status public.gdpr_request_status not null default 'received',
  requester_email text not null check (char_length(requester_email) between 5 and 254),
  user_id uuid references auth.users (id) on delete set null,
  channel text not null default 'email' check (channel in ('email', 'account', 'post', 'other')),
  received_at timestamptz not null default now(),
  -- Délai légal d'un mois (prolongeable de deux mois si la demande est complexe, à justifier).
  due_at timestamptz not null default (now() + interval '1 month'),
  identity_verified_at timestamptz,
  identity_method text check (char_length(identity_method) <= 200),
  completed_at timestamptz,
  -- Trace minimale : ce qui a été fait, sans recopier les données de la personne.
  resolution_note text check (char_length(resolution_note) <= 2000),
  handled_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index gdpr_requests_status_idx on public.gdpr_requests (status, due_at);
alter table public.gdpr_requests enable row level security;
revoke all on table public.gdpr_requests from anon, authenticated;
grant select, insert, update on table public.gdpr_requests to authenticated;

create trigger gdpr_requests_set_updated_at
  before update on public.gdpr_requests
  for each row execute function private.set_updated_at();

create policy "gdpr_requests: super_admin gère"
  on public.gdpr_requests for all to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));

create trigger gdpr_requests_audit
  after insert or update or delete on public.gdpr_requests
  for each row execute function private.audit_row_change('id');

-- ---------------------------------------------------------------------------
-- Suppression de compte : demande par l'utilisateur, délai de grâce, anonymisation
-- ---------------------------------------------------------------------------
create function public.request_account_deletion()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_email text;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  select email into v_email from auth.users where id = v_uid;

  update public.profiles
     set deletion_requested_at = coalesce(deletion_requested_at, now())
   where id = v_uid;

  if not exists (
    select 1 from public.gdpr_requests
     where user_id = v_uid and request_type = 'erasure' and status not in ('completed', 'rejected')
  ) then
    insert into public.gdpr_requests (request_type, requester_email, user_id, channel, identity_verified_at, identity_method)
    values ('erasure', v_email, v_uid, 'account', now(), 'Demande faite depuis le compte connecté');
  end if;

  perform private.write_audit_log('account_deletion_requested', 'profiles', v_uid::text, '{}'::jsonb);
end;
$$;
revoke all on function public.request_account_deletion() from public, anon;
grant execute on function public.request_account_deletion() to authenticated;

-- Étape 1 (admin) : désactive le compte et programme l'anonymisation après le délai de grâce.
create function public.admin_schedule_account_deletion(p_user_id uuid, p_grace_days integer default 30)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_when timestamptz;
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'cannot_delete_self' using errcode = '42501';
  end if;
  if p_grace_days < 7 or p_grace_days > 90 then
    raise exception 'invalid_grace_period' using errcode = '22023';
  end if;

  v_when := now() + make_interval(days => p_grace_days);
  update public.profiles
     set account_status = 'suspended',
         deletion_requested_at = coalesce(deletion_requested_at, now()),
         deletion_scheduled_for = v_when
   where id = p_user_id and anonymized_at is null;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  perform private.write_audit_log('account_deletion_scheduled', 'profiles', p_user_id::text,
    jsonb_build_object('scheduled_for', v_when));
  return v_when;
end;
$$;
revoke all on function public.admin_schedule_account_deletion(uuid, integer) from public, anon;
grant execute on function public.admin_schedule_account_deletion(uuid, integer) to authenticated;

create function public.admin_cancel_account_deletion(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.profiles
     set deletion_requested_at = null, deletion_scheduled_for = null
   where id = p_user_id and anonymized_at is null;
  perform private.write_audit_log('account_deletion_canceled', 'profiles', p_user_id::text, '{}'::jsonb);
end;
$$;
revoke all on function public.admin_cancel_account_deletion(uuid) from public, anon;
grant execute on function public.admin_cancel_account_deletion(uuid) to authenticated;

-- Étape 2 (admin, après le délai) : anonymise le profil et retire les adhésions.
-- La suppression du compte d'authentification est ensuite faite par le serveur
-- (API d'administration Auth, suppression « douce »). Les données soumises à une obligation
-- légale (facturation future) ne sont pas concernées : voir docs/rgpd/conservation.md.
create function public.admin_anonymize_account(p_user_id uuid)
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
  update public.profiles
     set full_name = null, account_status = 'suspended', anonymized_at = now()
   where id = p_user_id;
  update public.gdpr_requests
     set requester_email = 'anonymise-' || left(id::text, 8) || '@invalid'
   where user_id = p_user_id;

  perform private.write_audit_log('account_anonymized', 'profiles', p_user_id::text, '{}'::jsonb);
end;
$$;
revoke all on function public.admin_anonymize_account(uuid) from public, anon;
grant execute on function public.admin_anonymize_account(uuid) to authenticated;

-- Retrouver les données d'une personne (droit d'accès / portabilité). Journalisé.
create function public.admin_export_personal_data(p_email text)
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

  perform private.write_audit_log('personal_data_exported', 'auth.users', coalesce(v_uid::text, 'sans-compte'),
    jsonb_build_object('email_sha256', encode(extensions.digest(v_email, 'sha256'), 'hex')));
  return v_result;
end;
$$;
revoke all on function public.admin_export_personal_data(text) from public, anon;
grant execute on function public.admin_export_personal_data(text) to authenticated;

-- Purge des demandes de démonstration arrivées en fin de conservation.
create function public.admin_purge_expired_demo_requests()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  with d as (delete from public.demo_requests where retain_until < now() returning 1)
  select count(*) into v_count from d;
  perform private.write_audit_log('demo_requests_purged', 'demo_requests', null, jsonb_build_object('count', v_count));
  return v_count;
end;
$$;
revoke all on function public.admin_purge_expired_demo_requests() from public, anon;
grant execute on function public.admin_purge_expired_demo_requests() to authenticated;
