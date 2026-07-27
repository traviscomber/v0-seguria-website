begin;

create or replace function public.submit_wildlife_human_review(
  p_observation_id uuid,
  p_organization_id uuid,
  p_reviewer_user_id uuid,
  p_decision text,
  p_corrected_common_name text default null,
  p_corrected_scientific_name text default null,
  p_notes text default null
)
returns table (
  review_id uuid,
  observation_id uuid,
  status text
)
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_review_id uuid;
  v_status text;
  v_observation public.wildlife_observations%rowtype;
begin
  if p_decision not in ('validated', 'corrected', 'rejected') then
    raise exception 'invalid review decision' using errcode = '22023';
  end if;

  if p_decision = 'corrected'
    and nullif(trim(coalesce(p_corrected_common_name, '')), '') is null
    and nullif(trim(coalesce(p_corrected_scientific_name, '')), '') is null
  then
    raise exception 'a corrected review requires a corrected name' using errcode = '22023';
  end if;

  select *
  into v_observation
  from public.wildlife_observations
  where id = p_observation_id
    and organization_id = p_organization_id
  for update;

  if not found then
    raise exception 'wildlife observation not found' using errcode = 'P0002';
  end if;

  insert into public.wildlife_human_reviews (
    observation_id,
    organization_id,
    reviewer_user_id,
    decision,
    corrected_common_name,
    corrected_scientific_name,
    notes
  ) values (
    p_observation_id,
    p_organization_id,
    p_reviewer_user_id,
    p_decision,
    nullif(trim(coalesce(p_corrected_common_name, '')), ''),
    nullif(trim(coalesce(p_corrected_scientific_name, '')), ''),
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_review_id;

  v_status := case p_decision
    when 'validated' then 'validated'
    when 'corrected' then 'corrected'
    else 'rejected'
  end;

  update public.wildlife_observations
  set status = v_status,
      updated_at = now()
  where id = p_observation_id
    and organization_id = p_organization_id;

  insert into public.wildlife_audit_events (
    observation_id,
    organization_id,
    actor_user_id,
    event_type,
    event_version,
    payload
  ) values (
    p_observation_id,
    p_organization_id,
    p_reviewer_user_id,
    'wildlife.human_review_submitted',
    '1.0',
    jsonb_build_object(
      'review_id', v_review_id,
      'decision', p_decision,
      'corrected_common_name', p_corrected_common_name,
      'corrected_scientific_name', p_corrected_scientific_name
    )
  );

  return query select v_review_id, p_observation_id, v_status;
end;
$$;

revoke all on function public.submit_wildlife_human_review(uuid, uuid, uuid, text, text, text, text) from public;
revoke all on function public.submit_wildlife_human_review(uuid, uuid, uuid, text, text, text, text) from anon;
revoke all on function public.submit_wildlife_human_review(uuid, uuid, uuid, text, text, text, text) from authenticated;
grant execute on function public.submit_wildlife_human_review(uuid, uuid, uuid, text, text, text, text) to service_role;

commit;
