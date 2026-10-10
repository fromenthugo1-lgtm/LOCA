-- Corrections après relecture de phase (docs/DECISIONS.md, D-015).

-- 1. Un admin ne peut ni suspendre ni supprimer un autre admin par la procédure de suppression,
--    et un compte anonymisé ne peut plus être réactivé.
create or replace function public.admin_schedule_account_deletion(p_user_id uuid, p_grace_days integer default 30)
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
  if exists (select 1 from public.platform_admins where user_id = p_user_id) then
    raise exception 'target_is_admin' using errcode = '42501';
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

create or replace function public.admin_anonymize_account(p_user_id uuid)
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
  if exists (select 1 from public.platform_admins where user_id = p_user_id) then
    raise exception 'target_is_admin' using errcode = '42501';
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

create or replace function public.admin_set_account_status(
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
  v_anonymized timestamptz;
begin
  if not private.is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'cannot_change_own_status' using errcode = '42501';
  end if;
  if exists (select 1 from public.platform_admins where user_id = p_user_id) then
    raise exception 'target_is_admin' using errcode = '42501';
  end if;

  select account_status, anonymized_at into v_old, v_anonymized from public.profiles where id = p_user_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if v_anonymized is not null then
    raise exception 'account_anonymized' using errcode = '42501';
  end if;

  update public.profiles set account_status = p_status where id = p_user_id;

  perform private.write_audit_log(
    'account_status_changed', 'profiles', p_user_id::text,
    jsonb_build_object('from', v_old, 'to', p_status, 'reason', left(coalesce(p_reason, ''), 300))
  );
end;
$$;

-- 2. Droit d'accès calculé en base à partir de l'état réel de l'abonnement, consultable par
--    les membres actifs de l'entreprise (préparation des paiements, aucune transaction en V1).
create function public.company_subscription_is_active(p_company_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (private.can_access_company(p_company_id) or private.is_super_admin()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return private.company_has_active_subscription(p_company_id);
end;
$$;
revoke all on function public.company_subscription_is_active(uuid) from public, anon;
grant execute on function public.company_subscription_is_active(uuid) to authenticated;
