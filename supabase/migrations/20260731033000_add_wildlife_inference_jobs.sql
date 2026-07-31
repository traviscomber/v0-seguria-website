begin;

create table if not exists public.wildlife_inference_jobs (
  id uuid primary key default gen_random_uuid(),
  submitted_by_user_id uuid not null references auth.users(id) on delete restrict,
  organization_id uuid null,
  original_filename text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 12582912),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  provider text not null default 'openai',
  model_name text not null,
  status text not null default 'completed' check (status in ('queued','processing','completed','failed')),
  review_status text not null default 'pending' check (review_status in ('pending','confirmed','corrected','rejected','unidentifiable')),
  result_json jsonb,
  error_code text,
  error_message text,
  reviewed_by_user_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (submitted_by_user_id, sha256, model_name)
);

create index if not exists wildlife_inference_jobs_created_idx
  on public.wildlife_inference_jobs (created_at desc);
create index if not exists wildlife_inference_jobs_review_idx
  on public.wildlife_inference_jobs (review_status, created_at desc);
create index if not exists wildlife_inference_jobs_submitter_idx
  on public.wildlife_inference_jobs (submitted_by_user_id, created_at desc);

alter table public.wildlife_inference_jobs enable row level security;

drop policy if exists wildlife_inference_jobs_select_own on public.wildlife_inference_jobs;
create policy wildlife_inference_jobs_select_own
  on public.wildlife_inference_jobs for select
  to authenticated
  using (submitted_by_user_id = auth.uid());

drop policy if exists wildlife_inference_jobs_insert_own on public.wildlife_inference_jobs;
create policy wildlife_inference_jobs_insert_own
  on public.wildlife_inference_jobs for insert
  to authenticated
  with check (submitted_by_user_id = auth.uid());

drop policy if exists wildlife_inference_jobs_update_own on public.wildlife_inference_jobs;
create policy wildlife_inference_jobs_update_own
  on public.wildlife_inference_jobs for update
  to authenticated
  using (submitted_by_user_id = auth.uid())
  with check (submitted_by_user_id = auth.uid());

comment on table public.wildlife_inference_jobs is
  'Operational queue and audit trail for wildlife image inference executions.';

commit;
