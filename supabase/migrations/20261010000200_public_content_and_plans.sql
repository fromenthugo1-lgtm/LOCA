-- Contenus publics modifiables depuis l'administration, et formules (plans).
-- Lecture publique : uniquement ce qui est publié, par le rôle anon (le site lit ses contenus
-- sans session). Écriture : super_admin, journalisée.

-- ---------------------------------------------------------------------------
-- Textes du site, par clé de section (JSON validé par schéma côté application)
-- ---------------------------------------------------------------------------
create table public.site_content (
  key text primary key check (key ~ '^[a-z0-9_.-]{1,64}$'),
  draft jsonb,
  published jsonb,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  constraint site_content_published_consistent check ((published is null) = (published_at is null))
);
alter table public.site_content enable row level security;
revoke all on table public.site_content from anon, authenticated;
grant select (key, published, published_at) on table public.site_content to anon;
grant select, insert, update, delete on table public.site_content to authenticated;

create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function private.set_updated_at();

create policy "site_content: public lit le publié"
  on public.site_content for select to anon
  using (published is not null);

create policy "site_content: super_admin gère"
  on public.site_content for all to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));

create trigger site_content_audit
  after insert or update or delete on public.site_content
  for each row execute function private.audit_row_change('key');

-- ---------------------------------------------------------------------------
-- FAQ
-- ---------------------------------------------------------------------------
create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 3 and 300),
  answer text not null check (char_length(answer) between 3 and 4000),
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.faq_items enable row level security;
revoke all on table public.faq_items from anon, authenticated;
grant select (id, question, answer, display_order) on table public.faq_items to anon;
grant select, insert, update, delete on table public.faq_items to authenticated;

create trigger faq_items_set_updated_at
  before update on public.faq_items
  for each row execute function private.set_updated_at();

create policy "faq_items: public lit le publié"
  on public.faq_items for select to anon
  using (is_published);

create policy "faq_items: super_admin gère"
  on public.faq_items for all to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));

create trigger faq_items_audit
  after insert or update or delete on public.faq_items
  for each row execute function private.audit_row_change('id');

-- ---------------------------------------------------------------------------
-- Pages juridiques + historique des versions publiées (preuve de la version acceptée)
-- ---------------------------------------------------------------------------
create table public.legal_pages (
  slug text primary key check (slug in ('mentions-legales', 'confidentialite', 'cgu', 'cgv')),
  title text not null check (char_length(title) between 3 and 160),
  body text not null check (char_length(body) between 1 and 100000),
  version text not null check (version ~ '^[A-Za-z0-9._-]{1,40}$'),
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);
alter table public.legal_pages enable row level security;
revoke all on table public.legal_pages from anon, authenticated;
grant select (slug, title, body, version, published_at) on table public.legal_pages to anon;
grant select, insert, update on table public.legal_pages to authenticated;

create trigger legal_pages_set_updated_at
  before update on public.legal_pages
  for each row execute function private.set_updated_at();

create policy "legal_pages: public lit"
  on public.legal_pages for select to anon
  using (true);

create policy "legal_pages: super_admin gère"
  on public.legal_pages for all to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));

create table public.legal_page_versions (
  id bigint generated always as identity primary key,
  slug text not null,
  version text not null,
  title text not null,
  body text not null,
  published_at timestamptz not null,
  published_by uuid,
  unique (slug, version)
);
alter table public.legal_page_versions enable row level security;
revoke all on table public.legal_page_versions from anon, authenticated;
grant select on table public.legal_page_versions to authenticated;

create policy "legal_page_versions: super_admin lit"
  on public.legal_page_versions for select to authenticated
  using ((select private.is_super_admin()));

-- Chaque publication archive le texte publié. Une version déjà publiée ne peut pas être
-- republiée avec un texte différent (l'historique doit rester fidèle).
create function private.archive_legal_page()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.legal_page_versions (slug, version, title, body, published_at, published_by)
  values (new.slug, new.version, new.title, new.body, new.published_at, auth.uid())
  on conflict (slug, version) do nothing;

  if exists (
    select 1 from public.legal_page_versions v
     where v.slug = new.slug and v.version = new.version
       and (v.body <> new.body or v.title <> new.title)
  ) then
    raise exception 'version_already_published' using errcode = '23505',
      hint = 'Changez le numéro de version pour publier un texte modifié.';
  end if;
  return new;
end;
$$;

create trigger legal_pages_archive
  after insert or update on public.legal_pages
  for each row execute function private.archive_legal_page();

create trigger legal_pages_audit
  after insert or update or delete on public.legal_pages
  for each row execute function private.audit_row_change('slug');

-- ---------------------------------------------------------------------------
-- Formules (préparation des abonnements, aucune transaction)
-- ---------------------------------------------------------------------------
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,48}$'),
  name text not null check (char_length(name) between 2 and 80),
  description text check (char_length(description) <= 600),
  -- Montants en centimes d'euro. Null = non communiqué (« sur devis »).
  setup_fee_cents integer check (setup_fee_cents >= 0),
  monthly_price_cents integer check (monthly_price_cents >= 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  max_users integer check (max_users > 0),
  max_requests_per_month integer check (max_requests_per_month > 0),
  ai_usage_limit integer check (ai_usage_limit > 0),
  ai_usage_unit text check (char_length(ai_usage_unit) <= 40),
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  display_order integer not null default 0,
  is_published boolean not null default false,
  archived_at timestamptz,
  -- Identifiants du futur prestataire de paiement (vides en V1).
  provider_product_id text,
  provider_setup_price_id text,
  provider_monthly_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plans_archived_not_published check (archived_at is null or not is_published)
);
alter table public.plans enable row level security;
revoke all on table public.plans from anon, authenticated;
grant select (id, slug, name, description, setup_fee_cents, monthly_price_cents, currency, max_users,
              max_requests_per_month, ai_usage_limit, ai_usage_unit, features, display_order)
  on table public.plans to anon;
grant select, insert, update on table public.plans to authenticated;

create trigger plans_set_updated_at
  before update on public.plans
  for each row execute function private.set_updated_at();

create policy "plans: public lit les formules publiées"
  on public.plans for select to anon
  using (is_published and archived_at is null);

create policy "plans: super_admin gère"
  on public.plans for all to authenticated
  using ((select private.is_super_admin()))
  with check ((select private.is_super_admin()));

create trigger plans_audit
  after insert or update or delete on public.plans
  for each row execute function private.audit_row_change('id');
