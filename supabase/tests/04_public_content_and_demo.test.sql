-- Contenus publics : le visiteur ne lit que le publié. Démo : fonction contrôlée et limites.
begin;
select plan(10);

insert into public.plans (slug, name, is_published) values ('publiee', 'Publiée', true), ('brouillon', 'Brouillon', false);
insert into public.plans (slug, name, is_published, archived_at) values ('archivee', 'Archivée', false, now());
insert into public.faq_items (question, answer, is_published) values
  ('Question publiée ?', 'Réponse.', true), ('Question cachée ?', 'Réponse.', false);
insert into public.site_content (key, draft) values ('home.hero', '{"title":"brouillon"}');

set local role anon;
set local request.jwt.claims to '{"role":"anon"}';
select results_eq('select slug from public.plans', array['publiee'], 'Anon ne voit que les formules publiées');
select results_eq('select question from public.faq_items', array['Question publiée ?'], 'Anon ne voit que la FAQ publiée');
select is((select count(*)::int from public.site_content), 0, 'Anon ne voit pas un contenu non publié');
select throws_ok('select draft from public.site_content', '42501', null, 'Anon ne peut pas lire les brouillons');
select throws_ok('select provider_product_id from public.plans', '42501', null, 'Anon ne lit pas les identifiants du prestataire');

-- Enregistrement de démo par le serveur (rôle service_role)
reset role;
set local role service_role;
select isnt(
  public.submit_demo_request('Jean Test', 'Jean@Exemple.test', 'Exemple', 'Gérant', 'btp', null, null, null, 'iphash-0123456789abcdef'),
  null, 'Le serveur enregistre une demande'
);
select is((select email from public.demo_requests limit 1), 'jean@exemple.test', 'L''e-mail est normalisé');
select lives_ok($$select public.submit_demo_request('Jean Test', 'jean2@exemple.test', 'Exemple', 'Gérant', 'btp', null, null, null, 'iphash-0123456789abcdef')$$, '2e demande, même IP');
select lives_ok($$select public.submit_demo_request('Jean Test', 'jean3@exemple.test', 'Exemple', 'Gérant', 'btp', null, null, null, 'iphash-0123456789abcdef')$$, '3e demande, même IP');
select throws_ok(
  $$select public.submit_demo_request('Jean Test', 'jean4@exemple.test', 'Exemple', 'Gérant', 'btp', null, null, null, 'iphash-0123456789abcdef')$$,
  'P0001', 'rate_limited', 'La 4e demande depuis la même IP dans l''heure est refusée'
);

select * from finish();
rollback;
