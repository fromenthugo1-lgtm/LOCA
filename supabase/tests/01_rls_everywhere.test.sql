-- Toutes les tables du schéma public ont la RLS activée, et le rôle anon n'a aucun droit
-- d'écriture sur aucune table.
begin;
select plan(3);

select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'RLS activée sur toutes les tables du schéma public'
);

select is(
  (select count(*)::int
     from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'anon'
      and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
  0,
  'Le rôle anon n''a aucun droit d''écriture'
);

select is(
  (select count(*)::int
     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private') and p.prosecdef
      and not exists (
        select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%'
      )),
  0,
  'Toutes les fonctions SECURITY DEFINER fixent leur search_path'
);

select * from finish();
rollback;
