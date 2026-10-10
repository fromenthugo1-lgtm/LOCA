-- Suppression de compte en deux temps et droit d'accès lié à l'abonnement.
begin;
select plan(17);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@alpha.test'),
  ('22222222-2222-2222-2222-222222222222', 'bruno@beta.test'),
  ('88888888-8888-8888-8888-888888888888', 'admin2@spendedge.test'),
  ('99999999-9999-9999-9999-999999999999', 'admin@spendedge.test');
insert into public.platform_admins (user_id) values
  ('88888888-8888-8888-8888-888888888888'), ('99999999-9999-9999-9999-999999999999');
update public.profiles set account_status = 'active'
 where id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
insert into public.companies (id, name) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Alpha BTP'), ('bbbbbbbb-0000-0000-0000-000000000002', 'Beta Paysage');
insert into public.company_members (company_id, user_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222');
insert into public.plans (id, slug, name) values ('cccccccc-0000-0000-0000-000000000001', 'essentiel', 'Essentiel');
insert into public.subscriptions (company_id, plan_id, status, current_period_end) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'active', now() + interval '20 days');

-- ---------------- Alice demande la suppression de son compte ----------------
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select lives_ok('select public.request_account_deletion()', 'Alice demande la suppression');
select lives_ok('select public.request_account_deletion()', 'Une seconde demande ne provoque pas d''erreur');
select is(public.company_subscription_is_active('aaaaaaaa-0000-0000-0000-000000000001'), true, 'Abonnement actif lu depuis l''état réel');
select throws_ok($$select public.company_subscription_is_active('bbbbbbbb-0000-0000-0000-000000000002')$$, '42501', 'forbidden',
  'Alice ne peut pas interroger l''abonnement d''une autre entreprise');
reset role;
select is((select count(*)::int from public.gdpr_requests where user_id = '11111111-1111-1111-1111-111111111111'), 1,
  'Une seule demande RGPD ouverte');
select is((select count(*)::int from public.audit_logs where action = 'account_deletion_requested'
  and target_id = '11111111-1111-1111-1111-111111111111'), 1, 'Une seule entrée au journal');
select isnt((select account_status::text from public.profiles where id = '11111111-1111-1111-1111-111111111111'), 'suspended',
  'La demande seule ne supprime ni ne suspend rien');

-- ---------------- Traitement par l'admin ----------------
set local role authenticated;
set local request.jwt.claims to '{"sub":"99999999-9999-9999-9999-999999999999","role":"authenticated"}';
select throws_ok($$select public.admin_anonymize_account('11111111-1111-1111-1111-111111111111')$$, '22023', 'deletion_not_scheduled',
  'Anonymisation refusée sans suppression programmée');
select throws_ok($$select public.admin_schedule_account_deletion('11111111-1111-1111-1111-111111111111', 3)$$, '22023', 'invalid_grace_period',
  'Délai de grâce de moins de 7 jours refusé');
select throws_ok($$select public.admin_schedule_account_deletion('99999999-9999-9999-9999-999999999999')$$, '42501', 'cannot_delete_self',
  'Un admin ne peut pas programmer sa propre suppression');
select throws_ok($$select public.admin_schedule_account_deletion('88888888-8888-8888-8888-888888888888')$$, '42501', 'target_is_admin',
  'Un admin ne peut pas supprimer un autre admin');
select lives_ok($$select public.admin_schedule_account_deletion('11111111-1111-1111-1111-111111111111', 30)$$,
  'Suppression programmée à 30 jours');
select throws_ok($$select public.admin_anonymize_account('11111111-1111-1111-1111-111111111111')$$, '22023', 'grace_period_not_over',
  'Anonymisation refusée pendant le délai de grâce');

-- Le délai est écoulé (simulé par un accès privilégié).
reset role;
update public.profiles set deletion_scheduled_for = now() - interval '1 minute' where id = '11111111-1111-1111-1111-111111111111';
set local role authenticated;
set local request.jwt.claims to '{"sub":"99999999-9999-9999-9999-999999999999","role":"authenticated"}';
select lives_ok($$select public.admin_anonymize_account('11111111-1111-1111-1111-111111111111')$$, 'Anonymisation après le délai');
select throws_ok($$select public.admin_set_account_status('11111111-1111-1111-1111-111111111111', 'active')$$, '42501', 'account_anonymized',
  'Un compte anonymisé ne peut pas être réactivé');

reset role;
select is((select count(*)::int from public.company_members where user_id = '11111111-1111-1111-1111-111111111111'), 0,
  'Les rattachements aux entreprises sont retirés');
select ok((select full_name is null and anonymized_at is not null from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'Le profil est anonymisé');

select * from finish();
rollback;
