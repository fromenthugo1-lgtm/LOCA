-- Isolation entre deux entreprises fictives et effet des statuts de compte.
begin;
select plan(12);

-- Jeu de données (en tant que postgres)
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@alpha.test'),
  ('22222222-2222-2222-2222-222222222222', 'bruno@beta.test'),
  ('33333333-3333-3333-3333-333333333333', 'chloe@alpha.test');
update public.profiles set account_status = 'active'
 where id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
-- Chloé appartient à Alpha mais son compte n'est pas encore actif.
update public.profiles set account_status = 'onboarding_pending'
 where id = '33333333-3333-3333-3333-333333333333';

insert into public.companies (id, name) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Alpha BTP'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Beta Paysage');
insert into public.company_members (company_id, user_id, role) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'company_admin'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'member'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'member');
insert into public.plans (id, slug, name, is_published) values
  ('cccccccc-0000-0000-0000-000000000001', 'essentiel', 'Essentiel', true);
insert into public.subscriptions (company_id, plan_id, status) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'active'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000001', 'active');

-- Alice (Alpha, active)
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select results_eq(
  'select name from public.companies order by name',
  array['Alpha BTP'],
  'Alice ne voit que son entreprise'
);
select is((select count(*)::int from public.company_members where company_id = 'bbbbbbbb-0000-0000-0000-000000000002'), 0,
  'Alice ne voit aucun membre de Beta');
select is((select count(*)::int from public.subscriptions where company_id = 'bbbbbbbb-0000-0000-0000-000000000002'), 0,
  'Alice ne voit pas l''abonnement de Beta');
select is((select count(*)::int from public.profiles), 1, 'Alice ne voit que son propre profil');

-- Une modification visant l'autre entreprise n'affecte aucune ligne.
update public.companies set name = 'Piraté' where id = 'bbbbbbbb-0000-0000-0000-000000000002';
select throws_ok(
  $$insert into public.company_members (company_id, user_id, role)
    values ('bbbbbbbb-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'company_admin')$$,
  '42501', null, 'Alice ne peut pas s''ajouter à Beta'
);

-- Bruno (Beta, actif)
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select results_eq('select name from public.companies', array['Beta Paysage'], 'Bruno ne voit que Beta');
select is((select name from public.companies where id = 'bbbbbbbb-0000-0000-0000-000000000002'), 'Beta Paysage',
  'La tentative de renommage par Alice n''a rien changé');
select is((select count(*)::int from public.company_members where company_id = 'aaaaaaaa-0000-0000-0000-000000000001'), 0,
  'Bruno ne voit aucun membre d''Alpha');

-- Chloé : membre d'Alpha mais compte pas encore actif => aucun accès aux données de l'entreprise.
set local request.jwt.claims to '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}';
select is((select count(*)::int from public.companies), 0, 'Compte non actif : aucune entreprise visible');
select is((select count(*)::int from public.subscriptions), 0, 'Compte non actif : aucun abonnement visible');

-- Entreprise suspendue => plus d'accès pour Alice.
reset role;
update public.companies set status = 'suspended' where id = 'aaaaaaaa-0000-0000-0000-000000000001';
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select is((select count(*)::int from public.companies), 0, 'Entreprise suspendue : plus d''accès');

-- Visiteur anonyme : aucune donnée d'entreprise.
set local role anon;
set local request.jwt.claims to '{"role":"anon"}';
select throws_ok('select count(*) from public.companies', '42501', null, 'Anon : accès refusé aux entreprises');

select * from finish();
rollback;
