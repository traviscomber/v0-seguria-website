create table if not exists public.wildlife_pilot_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid null references public.organizations(id) on delete set null,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  camera_id uuid null references public.wildlife_cameras(id) on delete set null,
  name text not null check (char_length(name) between 1 and 160),
  description text null check (description is null or char_length(description) <= 1000),
  zone_label text null check (zone_label is null or char_length(zone_label) <= 160),
  target_image_count integer not null default 100 check (target_image_count between 1 and 100),
  status text not null default 'draft' check (status in ('draft', 'processing', 'completed', 'cancelled')),
  started_at timestamptz null,
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wildlife_inference_jobs
  add column if not exists pilot_batch_id uuid null references public.wildlife_pilot_batches(id) on delete set null;

create index if not exists wildlife_pilot_batches_owner_created_idx
  on public.wildlife_pilot_batches(created_by_user_id, created_at desc);

create index if not exists wildlife_pilot_batches_org_status_idx
  on public.wildlife_pilot_batches(organization_id, status, created_at desc)
  where organization_id is not null;

create index if not exists wildlife_inference_jobs_pilot_batch_idx
  on public.wildlife_inference_jobs(pilot_batch_id, created_at desc)
  where pilot_batch_id is not null;

alter table public.wildlife_pilot_batches enable row level security;

drop policy if exists wildlife_pilot_batches_select_own on public.wildlife_pilot_batches;
create policy wildlife_pilot_batches_select_own
  on public.wildlife_pilot_batches
  for select
  to authenticated
  using (created_by_user_id = (select auth.uid()));

drop policy if exists wildlife_pilot_batches_insert_own on public.wildlife_pilot_batches;
create policy wildlife_pilot_batches_insert_own
  on public.wildlife_pilot_batches
  for insert
  to authenticated
  with check (created_by_user_id = (select auth.uid()));

drop policy if exists wildlife_pilot_batches_update_own on public.wildlife_pilot_batches;
create policy wildlife_pilot_batches_update_own
  on public.wildlife_pilot_batches
  for update
  to authenticated
  using (created_by_user_id = (select auth.uid()))
  with check (created_by_user_id = (select auth.uid()));

revoke all on public.wildlife_pilot_batches from anon;
grant select, insert, update on public.wildlife_pilot_batches to authenticated;

update public.wildlife_inference_jobs
set pilot_batch_id = null
where pilot_batch_id is not null
  and not exists (
    select 1 from public.wildlife_pilot_batches batch where batch.id = wildlife_inference_jobs.pilot_batch_id
  );

drop trigger if exists wildlife_pilot_batches_set_updated_at on public.wildlife_pilot_batches;
create trigger wildlife_pilot_batches_set_updated_at
before update on public.wildlife_pilot_batches
for each row execute function public.update_updated_at_column();
