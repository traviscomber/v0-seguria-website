create table if not exists public.wildlife_cameras (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid null,
  created_by_user_id uuid not null references auth.users(id) on delete restrict,
  code text not null,
  name text not null,
  zone_label text,
  latitude numeric,
  longitude numeric,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (created_by_user_id, code)
);

alter table public.wildlife_cameras enable row level security;

drop policy if exists wildlife_cameras_select_own on public.wildlife_cameras;
create policy wildlife_cameras_select_own
  on public.wildlife_cameras for select
  to authenticated
  using (created_by_user_id = auth.uid());

drop policy if exists wildlife_cameras_insert_own on public.wildlife_cameras;
create policy wildlife_cameras_insert_own
  on public.wildlife_cameras for insert
  to authenticated
  with check (created_by_user_id = auth.uid());

drop policy if exists wildlife_cameras_update_own on public.wildlife_cameras;
create policy wildlife_cameras_update_own
  on public.wildlife_cameras for update
  to authenticated
  using (created_by_user_id = auth.uid())
  with check (created_by_user_id = auth.uid());

alter table public.wildlife_inference_jobs
  add column if not exists camera_id uuid references public.wildlife_cameras(id) on delete set null,
  add column if not exists zone_label text,
  add column if not exists captured_at timestamptz;

create index if not exists wildlife_inference_jobs_camera_idx
  on public.wildlife_inference_jobs (camera_id, captured_at desc);
create index if not exists wildlife_inference_jobs_zone_idx
  on public.wildlife_inference_jobs (zone_label, captured_at desc);
