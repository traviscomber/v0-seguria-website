begin;

create or replace function public.persist_wildlife_vision_event(
  p_observation jsonb,
  p_evidence jsonb,
  p_analysis jsonb,
  p_audit_event jsonb
)
returns table (
  observation_id uuid,
  evidence_asset_id uuid,
  analysis_id uuid,
  status text
)
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_observation_id uuid;
  v_evidence_asset_id uuid;
  v_analysis_id uuid;
  v_organization_id uuid := (p_observation->>'organization_id')::uuid;
  v_existing public.wildlife_observations%rowtype;
begin
  select *
  into v_existing
  from public.wildlife_observations
  where external_reference = p_observation->>'external_reference';

  if found then
    if v_existing.organization_id <> v_organization_id then
      raise exception 'external reference belongs to another organization' using errcode = '42501';
    end if;

    return query
    select
      v_existing.id,
      v_existing.primary_evidence_asset_id,
      v_existing.latest_analysis_id,
      v_existing.status;
    return;
  end if;

  insert into public.wildlife_observations (
    external_reference,
    organization_id,
    site_id,
    submitted_by_user_id,
    status,
    source,
    title,
    user_description
  ) values (
    p_observation->>'external_reference',
    v_organization_id,
    (p_observation->>'site_id')::uuid,
    (p_observation->>'submitted_by_user_id')::uuid,
    p_observation->>'status',
    p_observation->>'source',
    nullif(p_observation->>'title', ''),
    nullif(p_observation->>'user_description', '')
  )
  returning id into v_observation_id;

  insert into public.wildlife_evidence_assets (
    observation_id,
    organization_id,
    asset_kind,
    source,
    original_filename,
    safe_filename,
    mime_type,
    byte_size,
    width_pixels,
    height_pixels,
    sha256,
    storage_bucket,
    storage_path,
    created_by_user_id
  ) values (
    v_observation_id,
    v_organization_id,
    coalesce(p_evidence->>'asset_kind', 'original'),
    p_evidence->>'source',
    p_evidence->>'original_filename',
    p_evidence->>'safe_filename',
    p_evidence->>'mime_type',
    (p_evidence->>'byte_size')::bigint,
    nullif(p_evidence->>'width_pixels', '')::integer,
    nullif(p_evidence->>'height_pixels', '')::integer,
    p_evidence->>'sha256',
    p_evidence->>'storage_bucket',
    p_evidence->>'storage_path',
    (p_observation->>'submitted_by_user_id')::uuid
  )
  returning id into v_evidence_asset_id;

  insert into public.wildlife_ai_analyses (
    observation_id,
    organization_id,
    evidence_asset_id,
    provider,
    model_name,
    prompt_version,
    schema_version,
    status,
    analysis_json,
    limitations,
    analyzed_at
  ) values (
    v_observation_id,
    v_organization_id,
    v_evidence_asset_id,
    p_analysis->>'provider',
    p_analysis->>'model_name',
    p_analysis->>'model_version',
    p_analysis->>'schema_version',
    'completed',
    p_analysis,
    coalesce(p_analysis->'limitations', '[]'::jsonb),
    coalesce((p_analysis->>'detected_at')::timestamptz, now())
  )
  returning id into v_analysis_id;

  update public.wildlife_observations
  set
    primary_evidence_asset_id = v_evidence_asset_id,
    latest_analysis_id = v_analysis_id,
    updated_at = now()
  where id = v_observation_id;

  insert into public.wildlife_audit_events (
    observation_id,
    organization_id,
    actor_user_id,
    event_type,
    event_version,
    payload
  ) values (
    v_observation_id,
    v_organization_id,
    nullif(p_audit_event->>'actor_user_id', '')::uuid,
    p_audit_event->>'event_type',
    coalesce(p_audit_event->>'event_version', '1.0'),
    coalesce(p_audit_event->'payload', '{}'::jsonb)
  );

  return query
  select v_observation_id, v_evidence_asset_id, v_analysis_id, p_observation->>'status';
end;
$$;

revoke all on function public.persist_wildlife_vision_event(jsonb, jsonb, jsonb, jsonb) from public;
revoke all on function public.persist_wildlife_vision_event(jsonb, jsonb, jsonb, jsonb) from anon;
revoke all on function public.persist_wildlife_vision_event(jsonb, jsonb, jsonb, jsonb) from authenticated;
grant execute on function public.persist_wildlife_vision_event(jsonb, jsonb, jsonb, jsonb) to service_role;

commit;
