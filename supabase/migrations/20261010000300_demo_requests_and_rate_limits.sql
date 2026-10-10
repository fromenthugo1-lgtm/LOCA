-- Demandes de démonstration et limitation des tentatives (formulaires, connexion).
-- L'insertion publique passe par une fonction contrôlée, appelée uniquement par le serveur
-- de l'application (clé secrète). Le rôle anon n'a aucun accès direct à ces tables.

create type public.demo_request_status as enum ('new', 'in_progress', 'done', 'refused');

-- ---------------------------------------------------------------------------
-- Limitation des tentatives
-- ---------------------------------------------------------------------------
create table public.rate_limit_events (
  id bigint generated always as identity primary key,
  action text not null check (char_length(action) <= 40),
  -- Empreinte HMAC calculée par le serveur (adresse IP ou e-mail), jamais la valeur en clair.
  key_hash text not null check (char_length(key_hash) between 16 and 128),
  created_at timestamptz not null default now()
);
create index rate_limit_events_lookup_idx on public.rate_limit_events (action, key_hash, created_at desc);
alter table public.rate_limit_events enable row level security;
revoke all on table public.rate_limit_events from anon, authenticated;

-- Retourne vrai et enregistre la tentative si la limite n'est pas atteinte, faux sinon.
create function public.check_rate_limit(
  p_action text,
  p_key_hash text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_max < 1 or p_window_seconds < 1 then
    raise exception 'invalid_limit' using errcode = '22023';
  end if;

  -- Sérialise les tentatives concurrentes pour une même clé.
  perform pg_advisory_xact_lock(hashtextextended(p_action || ':' || p_key_hash, 0));

  delete from public.rate_limit_events
   where action = p_action and key_hash = p_key_hash
     and created_at < now() - make_interval(secs => p_window_seconds);

  select count(*) into v_count
    from public.rate_limit_events
   where action = p_action and key_hash = p_key_hash;

  if v_count >= p_max then
    return false;
  end if;

  insert into public.rate_limit_events (action, key_hash) values (p_action, p_key_hash);
  return true;
end;
$$;
revoke all on function public.check_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, text, integer, integer) to service_role;

-- Purge des traces anciennes (à planifier ; voir docs/rgpd/conservation.md).
create function public.purge_rate_limit_events()
returns integer
language sql
security definer
set search_path = ''
as $$
  with d as (
    delete from public.rate_limit_events where created_at < now() - interval '2 days' returning 1
  )
  select count(*)::integer from d;
$$;
revoke all on function public.purge_rate_limit_events() from public, anon, authenticated;
grant execute on function public.purge_rate_limit_events() to service_role;

-- ---------------------------------------------------------------------------
-- Demandes de démonstration
-- ---------------------------------------------------------------------------
create table public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company_name text not null check (char_length(company_name) between 1 and 160),
  job_title text not null check (char_length(job_title) between 1 and 120),
  sector text not null check (char_length(sector) between 1 and 80),
  company_size text check (char_length(company_size) <= 40),
  phone text check (char_length(phone) <= 30),
  message text check (char_length(message) <= 2000),
  status public.demo_request_status not null default 'new',
  internal_notes text check (char_length(internal_notes) <= 4000),
  ip_hash text check (char_length(ip_hash) <= 128),
  -- Durée de conservation envisagée (prospect) : 3 ans, à valider (docs/rgpd/conservation.md).
  retain_until timestamptz not null default (now() + interval '3 years'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index demo_requests_created_at_idx on public.demo_requests (created_at desc);
create index demo_requests_status_idx on public.demo_requests (status);
create index demo_requests_email_idx on public.demo_requests (lower(email));
alter table public.demo_requests enable row level security;
revoke all on table public.demo_requests from anon, authenticated;
grant select on table public.demo_requests to authenticated;
grant update (status, internal_notes) on table public.demo_requests to authenticated;

create trigger demo_requests_set_updated_at
  before update on public.demo_requests
  for each row execute function private.set_updated_at();

create policy "demo_requests: super_admin lit"
  on public.demo_requests for select to authenticated
  using ((select private.is_super_admin()));

create policy "demo_requests: super_admin traite"
  on public.demo_requests for update to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));

create trigger demo_requests_audit
  after update or delete on public.demo_requests
  for each row execute function private.audit_row_change('id');

-- Enregistrement contrôlé : validation, limites par IP hachée et par e-mail, plafond global.
create function public.submit_demo_request(
  p_full_name text,
  p_email text,
  p_company_name text,
  p_job_title text,
  p_sector text,
  p_company_size text,
  p_phone text,
  p_message text,
  p_ip_hash text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_email text := lower(trim(p_email));
begin
  if p_ip_hash is null or not public.check_rate_limit('demo_ip', p_ip_hash, 3, 3600) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if not public.check_rate_limit('demo_email', encode(extensions.digest(v_email, 'sha256'), 'hex'), 3, 86400) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if not public.check_rate_limit('demo_global', 'global-demo-requests', 200, 3600) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.demo_requests (
    full_name, email, company_name, job_title, sector, company_size, phone, message, ip_hash
  ) values (
    trim(p_full_name), v_email, trim(p_company_name), trim(p_job_title), trim(p_sector),
    nullif(trim(p_company_size), ''), nullif(trim(p_phone), ''), nullif(trim(p_message), ''), p_ip_hash
  )
  returning id into v_id;

  return v_id;
end;
$$;
revoke all on function public.submit_demo_request(text, text, text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_demo_request(text, text, text, text, text, text, text, text, text) to service_role;

-- Consultation d'une demande : journalisée (accès aux données personnelles d'un prospect).
create function public.admin_view_demo_request(p_id uuid)
returns setof public.demo_requests
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  perform private.write_audit_log('demo_request_viewed', 'demo_requests', p_id::text, '{}'::jsonb);
  return query select * from public.demo_requests where id = p_id;
end;
$$;
revoke all on function public.admin_view_demo_request(uuid) from public, anon;
grant execute on function public.admin_view_demo_request(uuid) to authenticated;
