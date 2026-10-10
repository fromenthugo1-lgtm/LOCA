-- Durcissements : admin suspendu sans pouvoirs, CGU non déduites des métadonnées,
-- notes internes invisibles des clients, admin protégé contre un autre admin.
begin;
select plan(9);

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'alice@alpha.test', '{"terms_version":"v9"}'),
  ('88888888-8888-8888-8888-888888888888', 'admin2@spendedge.test', '{}'),
  ('99999999-9999-9999-9999-999999999999', 'admin@spendedge.test', '{}');
insert into public.platform_admins (user_id) values
  ('88888888-8888-8888-8888-888888888888'), ('99999999-9999-9999-9999-999999999999');
insert into public.companies (id, name) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Alpha BTP');
insert into public.company_members (company_id, user_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111');
insert into public.company_internal_notes (company_id, notes) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Note interne');
update public.profiles set account_status = 'active' where id = '11111111-1111-1111-1111-111111111111';

select is((select terms_accepted_at from public.profiles where id = '11111111-1111-1111-1111-111111111111'), null,
  'Les métadonnées d''inscription ne valent pas acceptation des CGU');

set local role service_role;
select lives_ok($$select public.record_signup_terms_acceptance('11111111-1111-1111-1111-111111111111', 'v1')$$,
  'Le serveur enregistre l''acceptation cochée à l''inscription');
reset role;
select is((select terms_version from public.profiles where id = '11111111-1111-1111-1111-111111111111'), 'v1', 'Version enregistrée');

-- Alice, membre active : ne voit pas les notes internes.
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select is((select count(*)::int from public.company_internal_notes), 0, 'Un client ne lit pas les notes internes');
select throws_ok($$select public.record_signup_terms_acceptance(auth.uid(), 'v1')$$, '42501', null,
  'Un utilisateur ne peut pas appeler l''enregistrement serveur des CGU');

-- Un admin ne peut pas suspendre un autre admin.
set local request.jwt.claims to '{"sub":"99999999-9999-9999-9999-999999999999","role":"authenticated"}';
select throws_ok($$select public.admin_set_account_status('88888888-8888-8888-8888-888888888888', 'suspended')$$,
  '42501', 'target_is_admin', 'Un admin ne peut pas suspendre un autre admin');
select is((select count(*)::int from public.company_internal_notes where company_id = 'aaaaaaaa-0000-0000-0000-000000000001'), 1, 'L''admin lit les notes internes');

-- Admin suspendu (par accès privilégié) : plus aucun droit, même avec un jeton valide.
reset role;
update public.profiles set account_status = 'suspended' where id = '99999999-9999-9999-9999-999999999999';
set local role authenticated;
set local request.jwt.claims to '{"sub":"99999999-9999-9999-9999-999999999999","role":"authenticated"}';
select is(public.current_user_is_super_admin(), false, 'Un admin suspendu n''est plus reconnu');
select throws_ok($$select public.admin_export_personal_data('alice@alpha.test')$$, '42501', 'forbidden',
  'Un admin suspendu ne peut plus exporter de données');

select * from finish();
rollback;
