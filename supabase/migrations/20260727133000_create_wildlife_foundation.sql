begin;

create table public.wildlife_observations (
  id uuid primary key default gen_random_uuid(),
  external_reference text not null unique,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  site_id uuid not null,
  submitted_by_user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'draft' check (status in (
    'draft',
    'uploaded',
    'metadata_extracted',
    'analysis_pending',
    'analyzed',
    'review_required',
    'validated',
    'corrected',
    'rejected'
  )),
  source text not null check (source in (
    'mobile_upload',
    'desktop_upload',
    'camera_trap',
    'rtsp_event',
    'drone',
    'external_api',
    'field_import'
  )),
  title text,
  user_description text,
  primary_evidence_asset_id uuid,
  latest_analysis_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (site_id, organization_id)
    references public.properties(id, organization_id)
    on delete restrict
);

create index wildlife_observations_org_created_idx
  on public.wildlife_observations (organization_id, created_at desc);
create index wildlife_observations_site_created_idx
  on public.wildlife_observations (site_id, created_at desc);
create index wildlife_observations_status_idx
  on public.wildlife_observations (organization_id, status, created_at desc);

create table public.wildlife_evidence_assets (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null,
  organization_id uuid not null,
  asset_kind text not null default 'original' check (asset_kind in ('original', 'derivative')),
  source text not null check (source in (
    'mobile_upload',
    'desktop_upload',
    'camera_trap',
    'rtsp_event',
    'drone',
    'external_api',
    'field_import'
  )),
  original_filename text not null,
  safe_filename text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size > 0),
  width_pixels integer check (width_pixels is null or width_pixels > 0),
  height_pixels integer check (height_pixels is null or height_pixels > 0),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  storage_bucket text not null,
  storage_path text not null,
  created_by_user_id uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  unique (storage_bucket, storage_path),
  unique (organization_id, sha256, asset_kind),
  foreign key (observation_id, organization_id)
    references public.wildlife_observations(id, organization_id)
    on delete restrict
);

create index wildlife_evidence_assets_observation_idx
  on public.wildlife_evidence_assets (observation_id, created_at);
create index wildlife_evidence_assets_org_sha_idx
  on public.wildlife_evidence_assets (organization_id, sha256);

alter table public.wildlife_observations
  add constraint wildlife_observations_primary_asset_fkey
  foreign key (primary_evidence_asset_id, organization_id)
  references public.wildlife_evidence_assets(id, organization_id)
  deferrable initially deferred;

create table public.wildlife_metadata_snapshots (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null,
  organization_id uuid not null,
  evidence_asset_id uuid not null,
  extractor_name text not null,
  extractor_version text not null,
  raw_metadata jsonb not null default '{}'::jsonb,
  normalized_metadata jsonb not null default '{}'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (observation_id, organization_id)
    references public.wildlife_observations(id, organization_id)
    on delete restrict,
  foreign key (evidence_asset_id, organization_id)
    references public.wildlife_evidence_assets(id, organization_id)
    on delete restrict
);

create index wildlife_metadata_snapshots_observation_idx
  on public.wildlife_metadata_snapshots (observation_id, created_at desc);

create table public.wildlife_ai_analyses (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null,
  organization_id uuid not null,
  evidence_asset_id uuid not null,
  provider text not null,
  model_name text not null,
  prompt_version text not null,
  schema_version text not null,
  status text not null default 'completed' check (status in ('completed', 'failed')),
  analysis_json jsonb,
  limitations jsonb not null default '[]'::jsonb,
  error_code text,
  error_message text,
  analyzed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  check (
    (status = 'completed' and analysis_json is not null and error_code is null)
    or
    (status = 'failed' and error_code is not null)
  ),
  foreign key (observation_id, organization_id)
    references public.wildlife_observations(id, organization_id)
    on delete restrict,
  foreign key (evidence_asset_id, organization_id)
    references public.wildlife_evidence_assets(id, organization_id)
    on delete restrict
);

create index wildlife_ai_analyses_observation_idx
  on public.wildlife_ai_analyses (observation_id, created_at desc);

alter table public.wildlife_observations
  add constraint wildlife_observations_latest_analysis_fkey
  foreign key (latest_analysis_id, organization_id)
  references public.wildlife_ai_analyses(id, organization_id)
  deferrable initially deferred;

create table public.wildlife_evidence_scores (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null,
  organization_id uuid not null,
  version text not null,
  total integer not null check (total between 0 and 100),
  maximum integer not null default 100 check (maximum = 100),
  components jsonb not null,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (observation_id, organization_id)
    references public.wildlife_observations(id, organization_id)
    on delete restrict
);

create index wildlife_evidence_scores_observation_idx
  on public.wildlife_evidence_scores (observation_id, created_at desc);

create table public.wildlife_human_reviews (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null,
  organization_id uuid not null,
  reviewer_user_id uuid not null references auth.users(id) on delete restrict,
  decision text not null check (decision in ('validated', 'corrected', 'rejected')),
  corrected_common_name text,
  corrected_scientific_name text,
  notes text,
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (observation_id, organization_id)
    references public.wildlife_observations(id, organization_id)
    on delete restrict
);

create index wildlife_human_reviews_observation_idx
  on public.wildlife_human_reviews (observation_id, created_at desc);

create table public.wildlife_audit_events (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete restrict,
  event_type text not null,
  event_version text not null default '1.0',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (observation_id, organization_id)
    references public.wildlife_observations(id, organization_id)
    on delete restrict
);

create index wildlife_audit_events_observation_idx
  on public.wildlife_audit_events (observation_id, created_at);
create index wildlife_audit_events_org_created_idx
  on public.wildlife_audit_events (organization_id, created_at desc);

create or replace function private.prevent_wildlife_history_mutation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  raise exception '% is append-only', tg_table_name using errcode = '55000';
end;
$$;

revoke all on function private.prevent_wildlife_history_mutation() from public;

create trigger wildlife_evidence_assets_append_only
before update or delete on public.wildlife_evidence_assets
for each row execute function private.prevent_wildlife_history_mutation();

create trigger wildlife_metadata_snapshots_append_only
before update or delete on public.wildlife_metadata_snapshots
for each row execute function private.prevent_wildlife_history_mutation();

create trigger wildlife_ai_analyses_append_only
before update or delete on public.wildlife_ai_analyses
for each row execute function private.prevent_wildlife_history_mutation();

create trigger wildlife_evidence_scores_append_only
before update or delete on public.wildlife_evidence_scores
for each row execute function private.prevent_wildlife_history_mutation();

create trigger wildlife_human_reviews_append_only
before update or delete on public.wildlife_human_reviews
for each row execute function private.prevent_wildlife_history_mutation();

create trigger wildlife_audit_events_append_only
before update or delete on public.wildlife_audit_events
for each row execute function private.prevent_wildlife_history_mutation();

alter table public.wildlife_observations enable row level security;
alter table public.wildlife_evidence_assets enable row level security;
alter table public.wildlife_metadata_snapshots enable row level security;
alter table public.wildlife_ai_analyses enable row level security;
alter table public.wildlife_evidence_scores enable row level security;
alter table public.wildlife_human_reviews enable row level security;
alter table public.wildlife_audit_events enable row level security;

create policy wildlife_observations_select_member
on public.wildlife_observations
for select
using ((select private.is_org_member(organization_id)));

create policy wildlife_observations_insert_staff
on public.wildlife_observations
for insert
with check (
  submitted_by_user_id = auth.uid()
  and (select private.has_org_role(organization_id, array['owner','admin','operator','technician']))
);

create policy wildlife_observations_update_staff
on public.wildlife_observations
for update
using ((select private.has_org_role(organization_id, array['owner','admin','operator','technician'])))
with check ((select private.has_org_role(organization_id, array['owner','admin','operator','technician'])));

create policy wildlife_evidence_assets_select_member
on public.wildlife_evidence_assets
for select
using ((select private.is_org_member(organization_id)));

create policy wildlife_evidence_assets_insert_staff
on public.wildlife_evidence_assets
for insert
with check ((select private.has_org_role(organization_id, array['owner','admin','operator','technician'])));

create policy wildlife_metadata_snapshots_select_member
on public.wildlife_metadata_snapshots
for select
using ((select private.is_org_member(organization_id)));

create policy wildlife_metadata_snapshots_insert_staff
on public.wildlife_metadata_snapshots
for insert
with check ((select private.has_org_role(organization_id, array['owner','admin','operator','technician'])));

create policy wildlife_ai_analyses_select_member
on public.wildlife_ai_analyses
for select
using ((select private.is_org_member(organization_id)));

create policy wildlife_ai_analyses_insert_staff
on public.wildlife_ai_analyses
for insert
with check ((select private.has_org_role(organization_id, array['owner','admin','operator','technician'])));

create policy wildlife_evidence_scores_select_member
on public.wildlife_evidence_scores
for select
using ((select private.is_org_member(organization_id)));

create policy wildlife_evidence_scores_insert_staff
on public.wildlife_evidence_scores
for insert
with check ((select private.has_org_role(organization_id, array['owner','admin','operator','technician'])));

create policy wildlife_human_reviews_select_member
on public.wildlife_human_reviews
for select
using ((select private.is_org_member(organization_id)));

create policy wildlife_human_reviews_insert_reviewer
on public.wildlife_human_reviews
for insert
with check (
  reviewer_user_id = auth.uid()
  and (select private.has_org_role(organization_id, array['owner','admin','operator']))
);

create policy wildlife_audit_events_select_member
on public.wildlife_audit_events
for select
using ((select private.is_org_member(organization_id)));

create policy wildlife_audit_events_insert_staff
on public.wildlife_audit_events
for insert
with check (
  (actor_user_id is null or actor_user_id = auth.uid())
  and (select private.has_org_role(organization_id, array['owner','admin','operator','technician']))
);

commit;
