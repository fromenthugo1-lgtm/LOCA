-- SpendEdge : fondations (comptes, rôles plateforme, entreprises, adhésions, journal d'audit).
-- Principes : RLS sur toutes les tables, droits révoqués par défaut puis accordés au cas par cas,
-- fonctions d'aide SECURITY DEFINER avec search_path vide, aucune modification de rôle ou de
-- statut possible par l'utilisateur lui-même.

create extension if not exists pgcrypto with schema extensions;

-- Schéma privé : non exposé par l'API (PostgREST n'expose que "public").
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.account_status as enum ('created', 'onboarding_pending', 'active', 'suspended');
create type public.company_role as enum ('member', 'company_admin');
create type public.company_status as enum ('active', 'suspended', 'archived');

-- ---------------------------------------------------------------------------
-- Utilitaires
-- ---------------------------------------------------------------------------
create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Vrai quand la requête vient directement de l'API avec le jeton d'un visiteur ou d'un
-- utilisateur (rôles anon / authenticated). Faux à l'intérieur d'une fonction SECURITY DEFINER
-- (current_user = propriétaire) ou avec la clé secrète (service_role).
create function private.is_api_user_context()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user in ('anon', 'authenticated');
$$;

-- ---------------------------------------------------------------------------
-- Journal d'audit (append-only)
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null check (char_length(action) between 1 and 80),
  target_table text check (char_length(target_table) <= 80),
  target_id text check (char_length(target_id) <= 120),
  -- Jamais de contenu confidentiel ici : noms de colonnes modifiées, statuts, identifiants.
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_target_idx on public.audit_logs (target_table, target_id);
alter table public.audit_logs enable row level security;
revoke all on table public.audit_logs from anon, authenticated;

create function private.write_audit_log(
  p_action text,
  p_target_table text,
  p_target_id text,
  p_details jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.audit_logs (actor_id, action, target_table, target_id, details)
  values ((select auth.uid()), p_action, p_target_table, p_target_id, coalesce(p_details, '{}'::jsonb));
$$;
revoke all on function private.write_audit_log(text, text, text, jsonb) from public;

-- Déclencheur générique : journalise toute écriture sur une table d'administration.
-- Enregistre seulement les noms des colonnes modifiées, jamais leurs valeurs.
create function private.audit_row_change()
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
       and n.key not in ('updated_at', 'updated_by');
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
-- Administrateurs de la plateforme (super_admin)
-- ---------------------------------------------------------------------------
create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text check (char_length(note) <= 200),
  granted_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;
revoke all on table public.platform_admins from anon, authenticated;
grant select on table public.platform_admins to authenticated;

-- Un utilisateur ne voit que sa propre ligne. Aucune politique d'écriture : seul un accès
-- privilégié (SQL ou clé secrète, voir README « premier administrateur ») peut nommer un admin.
create policy "platform_admins: lire sa propre ligne"
  on public.platform_admins for select to authenticated
  using (user_id = (select auth.uid()));

create function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_admins where user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_super_admin() from public;
grant execute on function private.is_super_admin() to anon, authenticated;

create policy "audit_logs: lecture super_admin"
  on public.audit_logs for select to authenticated
  using ((select private.is_super_admin()));
grant select on table public.audit_logs to authenticated;

-- ---------------------------------------------------------------------------
-- Profils (un par compte Supabase Auth)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  account_status public.account_status not null default 'created',
  terms_version text check (char_length(terms_version) <= 40),
  terms_accepted_at timestamptz,
  deletion_requested_at timestamptz,
  deletion_scheduled_for timestamptz,
  anonymized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_terms_consistent check ((terms_version is null) = (terms_accepted_at is null))
);
alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
-- Seul le nom est modifiable par l'utilisateur. Statut, CGU et suppression passent par des
-- fonctions contrôlées.
grant update (full_name) on table public.profiles to authenticated;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create policy "profiles: lire son profil"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: super_admin lit tout"
  on public.profiles for select to authenticated
  using ((select private.is_super_admin()));

create policy "profiles: modifier son nom"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Défense en profondeur : même si un droit de colonne était accordé par erreur, un appel
-- direct de l'API ne peut pas changer les colonnes protégées.
create function private.guard_profile_protected_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_api_user_context() and (
       new.account_status is distinct from old.account_status
    or new.terms_version is distinct from old.terms_version
    or new.terms_accepted_at is distinct from old.terms_accepted_at
    or new.deletion_requested_at is distinct from old.deletion_requested_at
    or new.deletion_scheduled_for is distinct from old.deletion_scheduled_for
    or new.anonymized_at is distinct from old.anonymized_at
    or new.id is distinct from old.id
  ) then
    raise exception 'protected_column' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_protected_columns
  before update on public.profiles
  for each row execute function private.guard_profile_protected_columns();

-- Création automatique du profil à l'inscription. La version des CGU acceptée vient des
-- métadonnées envoyées par l'action d'inscription ; l'application revérifie qu'elle
-- correspond à la version en vigueur (sinon elle redemande l'acceptation).
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_terms text := new.raw_user_meta_data ->> 'terms_version';
begin
  if v_terms is not null and v_terms !~ '^[A-Za-z0-9._-]{1,40}$' then
    v_terms := null;
  end if;

  insert into public.profiles (id, terms_version, terms_accepted_at)
  values (new.id, v_terms, case when v_terms is null then null else now() end);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Entreprises et adhésions
-- ---------------------------------------------------------------------------
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  legal_identifier text check (char_length(legal_identifier) <= 40),
  sector text check (char_length(sector) <= 80),
  size text check (char_length(size) <= 40),
  status public.company_status not null default 'active',
  notes text check (char_length(notes) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.companies enable row level security;
revoke all on table public.companies from anon, authenticated;
grant select, insert, update on table public.companies to authenticated;

create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function private.set_updated_at();

create table public.company_members (
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.company_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);
create index company_members_user_idx on public.company_members (user_id);
alter table public.company_members enable row level security;
revoke all on table public.company_members from anon, authenticated;
grant select, insert, update, delete on table public.company_members to authenticated;

-- Accès aux données d'une entreprise : membre, compte actif, entreprise active.
-- C'est la fonction à utiliser dans les politiques des futurs modules (fournisseurs,
-- produits, demandes d'achat, journaux de l'agent), tous porteurs d'un company_id.
create function private.can_access_company(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.company_members m
      join public.profiles p on p.id = m.user_id
      join public.companies c on c.id = m.company_id
     where m.company_id = p_company_id
       and m.user_id = (select auth.uid())
       and p.account_status = 'active'
       and c.status = 'active'
  );
$$;
revoke all on function private.can_access_company(uuid) from public;
grant execute on function private.can_access_company(uuid) to authenticated;

create function private.has_company_role(p_company_id uuid, p_role public.company_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.can_access_company(p_company_id)
     and exists (
       select 1 from public.company_members
        where company_id = p_company_id
          and user_id = (select auth.uid())
          and role = p_role
     );
$$;
revoke all on function private.has_company_role(uuid, public.company_role) from public;
grant execute on function private.has_company_role(uuid, public.company_role) to authenticated;

create policy "companies: membres actifs lisent leur entreprise"
  on public.companies for select to authenticated
  using ((select private.can_access_company(id)));

create policy "companies: super_admin lit tout"
  on public.companies for select to authenticated
  using ((select private.is_super_admin()));

create policy "companies: super_admin crée"
  on public.companies for insert to authenticated
  with check ((select private.is_super_admin()));

create policy "companies: super_admin modifie"
  on public.companies for update to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));

create policy "company_members: membres actifs voient leur équipe"
  on public.company_members for select to authenticated
  using ((select private.can_access_company(company_id)));

create policy "company_members: super_admin lit tout"
  on public.company_members for select to authenticated
  using ((select private.is_super_admin()));

create policy "company_members: super_admin ajoute"
  on public.company_members for insert to authenticated
  with check ((select private.is_super_admin()));

create policy "company_members: super_admin modifie"
  on public.company_members for update to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));

create policy "company_members: super_admin retire"
  on public.company_members for delete to authenticated
  using ((select private.is_super_admin()));

create trigger companies_audit
  after insert or update or delete on public.companies
  for each row execute function private.audit_row_change('id');

create trigger company_members_audit
  after insert or update or delete on public.company_members
  for each row execute function private.audit_row_change('user_id');

-- ---------------------------------------------------------------------------
-- Fonctions appelables depuis l'application (schéma public = exposé en RPC)
-- ---------------------------------------------------------------------------

-- Indique au navigateur/serveur si l'utilisateur connecté est super_admin.
create function public.current_user_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_super_admin();
$$;
revoke all on function public.current_user_is_super_admin() from public, anon;
grant execute on function public.current_user_is_super_admin() to authenticated;

-- Enregistre l'acceptation des CGU par l'utilisateur connecté (horodatage serveur).
create function public.accept_terms(p_version text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if p_version is null or p_version !~ '^[A-Za-z0-9._-]{1,40}$' then
    raise exception 'invalid_version' using errcode = '22023';
  end if;
  update public.profiles
     set terms_version = p_version, terms_accepted_at = now()
   where id = (select auth.uid());
end;
$$;
revoke all on function public.accept_terms(text) from public, anon;
grant execute on function public.accept_terms(text) to authenticated;

-- Changement de statut d'un compte : super_admin seulement, journalisé.
create function public.admin_set_account_status(
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
revoke all on function public.admin_set_account_status(uuid, public.account_status, text) from public, anon;
grant execute on function public.admin_set_account_status(uuid, public.account_status, text) to authenticated;

-- Liste des comptes pour l'administration (lit auth.users sans dupliquer l'e-mail).
create function public.admin_list_accounts(
  p_search text default null,
  p_status public.account_status default null,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  id uuid,
  email text,
  full_name text,
  account_status public.account_status,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  company_count bigint,
  deletion_scheduled_for timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
    select p.id, u.email::text, p.full_name, p.account_status, u.email_confirmed_at,
           u.last_sign_in_at, p.created_at,
           (select count(*) from public.company_members m where m.user_id = p.id),
           p.deletion_scheduled_for
      from public.profiles p
      join auth.users u on u.id = p.id
     where (p_status is null or p.account_status = p_status)
       and (p_search is null or p_search = ''
            or u.email ilike '%' || p_search || '%'
            or p.full_name ilike '%' || p_search || '%')
     order by p.created_at desc
     limit least(greatest(p_limit, 1), 200)
    offset greatest(p_offset, 0);
end;
$$;
revoke all on function public.admin_list_accounts(text, public.account_status, integer, integer) from public, anon;
grant execute on function public.admin_list_accounts(text, public.account_status, integer, integer) to authenticated;

-- Détail d'un compte pour l'administration. La consultation est journalisée.
create function public.admin_get_account(p_user_id uuid)
returns table (
  id uuid,
  email text,
  full_name text,
  account_status public.account_status,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  terms_version text,
  terms_accepted_at timestamptz,
  deletion_requested_at timestamptz,
  deletion_scheduled_for timestamptz,
  anonymized_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  perform private.write_audit_log('account_viewed', 'profiles', p_user_id::text, '{}'::jsonb);

  return query
    select p.id, u.email::text, p.full_name, p.account_status, u.email_confirmed_at,
           u.last_sign_in_at, p.created_at, p.terms_version, p.terms_accepted_at,
           p.deletion_requested_at, p.deletion_scheduled_for, p.anonymized_at
      from public.profiles p
      join auth.users u on u.id = p.id
     where p.id = p_user_id;
end;
$$;
revoke all on function public.admin_get_account(uuid) from public, anon;
grant execute on function public.admin_get_account(uuid) to authenticated;

-- Recherche d'un compte par e-mail exact (rattachement à une entreprise).
create function public.admin_find_account_by_email(p_email text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return (select u.id from auth.users u where lower(u.email) = lower(trim(p_email)) limit 1);
end;
$$;
revoke all on function public.admin_find_account_by_email(text) from public, anon;
grant execute on function public.admin_find_account_by_email(text) to authenticated;

-- Membres d'une entreprise avec leur e-mail (administration).
create function public.admin_list_company_members(p_company_id uuid)
returns table (user_id uuid, email text, full_name text, role public.company_role, account_status public.account_status, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
    select m.user_id, u.email::text, p.full_name, m.role, p.account_status, m.created_at
      from public.company_members m
      join auth.users u on u.id = m.user_id
      join public.profiles p on p.id = m.user_id
     where m.company_id = p_company_id
     order by m.created_at;
end;
$$;
revoke all on function public.admin_list_company_members(uuid) from public, anon;
grant execute on function public.admin_list_company_members(uuid) to authenticated;

-- Écriture dans le journal depuis l'application (consultations sensibles, exports).
create function public.admin_log_action(p_action text, p_target_table text, p_target_id text, p_details jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  perform private.write_audit_log(p_action, p_target_table, p_target_id, p_details);
end;
$$;
revoke all on function public.admin_log_action(text, text, text, jsonb) from public, anon;
grant execute on function public.admin_log_action(text, text, text, jsonb) to authenticated;
