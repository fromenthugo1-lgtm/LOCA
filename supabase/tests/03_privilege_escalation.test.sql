-- Un utilisateur ne peut ni changer son rôle, ni son statut, ni se nommer administrateur,
-- ni utiliser les fonctions d'administration. Un super_admin le peut, et c'est journalisé.
begin;
select plan(22);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@alpha.test'),
  ('99999999-9999-9999-9999-999999999999', 'admin@spendedge.test');
insert into public.platform_admins (user_id) values ('99999999-9999-9999-9999-999999999999');
insert into public.companies (id, name) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Alpha BTP');
insert into public.company_members (company_id, user_id, role)
  values ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'member');
update public.profiles set account_status = 'active' where id = '11111111-1111-1111-1111-111111111111';
insert into public.demo_requests (full_name, email, company_name, job_title, sector)
  values ('Jean Test', 'jean@exemple.test', 'Exemple', 'Gérant', 'btp');

-- ---------------- Alice, utilisatrice standard ----------------
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select lives_ok($$update public.profiles set full_name = 'Alice Martin' where id = auth.uid()$$,
  'Alice peut modifier son nom');
select throws_ok($$update public.profiles set account_status = 'active' where id = auth.uid()$$,
  '42501', null, 'Alice ne peut pas modifier son statut (droit de colonne)');
select throws_ok($$update public.profiles set terms_version = 'x', terms_accepted_at = now() where id = auth.uid()$$,
  '42501', null, 'Alice ne peut pas écrire directement l''acceptation des CGU');
-- La RLS filtre la ligne : la requête passe mais ne modifie rien (vérifié plus bas).
update public.company_members set role = 'company_admin' where user_id = auth.uid();
select is((select role::text from public.company_members where user_id = auth.uid()), 'member',
  'Alice ne peut pas changer son rôle dans l''entreprise');
select throws_ok($$insert into public.platform_admins (user_id) values (auth.uid())$$,
  '42501', null, 'Alice ne peut pas se nommer super_admin');
select is(public.current_user_is_super_admin(), false, 'Alice n''est pas super_admin');
select throws_ok($$select public.admin_set_account_status('11111111-1111-1111-1111-111111111111', 'active')$$,
  '42501', 'forbidden', 'Fonction admin refusée : changer un statut');
select throws_ok($$select * from public.admin_list_accounts()$$, '42501', 'forbidden', 'Fonction admin refusée : lister les comptes');
select throws_ok($$select public.admin_export_personal_data('jean@exemple.test')$$, '42501', 'forbidden', 'Fonction admin refusée : export RGPD');
select is((select count(*)::int from public.demo_requests), 0, 'Alice ne voit aucune demande de démo');
select is((select count(*)::int from public.audit_logs), 0, 'Alice ne lit pas le journal d''audit');
select throws_ok($$insert into public.plans (slug, name) values ('pirate', 'Pirate')$$, '42501', null,
  'Alice ne peut pas créer de formule');
select throws_ok($$select public.check_rate_limit('x', 'aaaaaaaaaaaaaaaa', 1, 1)$$, '42501', null,
  'Alice ne peut pas manipuler la limitation des tentatives');
select lives_ok($$select public.accept_terms('cgu-v1')$$, 'Alice peut accepter les CGU via la fonction contrôlée');

-- ---------------- Visiteur anonyme ----------------
set local role anon;
set local request.jwt.claims to '{"role":"anon"}';
select throws_ok($$select public.submit_demo_request('a','b@c.de','c','d','e',null,null,null,'0123456789abcdef')$$,
  '42501', null, 'Anon ne peut pas appeler directement l''enregistrement de démo (réservé au serveur)');
select throws_ok($$select count(*) from public.demo_requests$$, '42501', null, 'Anon ne lit pas les demandes de démo');

-- ---------------- Super admin ----------------
set local role authenticated;
set local request.jwt.claims to '{"sub":"99999999-9999-9999-9999-999999999999","role":"authenticated"}';
select is(public.current_user_is_super_admin(), true, 'L''admin est reconnu');
select lives_ok($$select public.admin_set_account_status('11111111-1111-1111-1111-111111111111', 'suspended', 'test')$$,
  'L''admin peut suspendre un compte');
select throws_ok($$select public.admin_set_account_status('99999999-9999-9999-9999-999999999999', 'active')$$,
  '42501', 'cannot_change_own_status', 'L''admin ne peut pas changer son propre statut');
select is((select count(*)::int from public.demo_requests where email = 'jean@exemple.test'), 1, 'L''admin lit les demandes de démo');
select ok(exists(select 1 from public.audit_logs where action = 'account_status_changed'
  and target_id = '11111111-1111-1111-1111-111111111111'), 'Le changement de statut est journalisé');

reset role;
select is((select account_status::text from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'suspended', 'Le statut a bien changé');

select * from finish();
rollback;
