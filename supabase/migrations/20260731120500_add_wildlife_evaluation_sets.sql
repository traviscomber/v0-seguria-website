create table if not exists public.wildlife_evaluation_sets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  created_by_user_id uuid not null references auth.users(id) on delete restrict,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','active','completed','archived')),
  target_image_count integer check (target_image_count is null or target_image_count >= 0),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wildlife_evaluation_items (
  id uuid primary key default gen_random_uuid(),
  evaluation_set_id uuid not null references public.wildlife_evaluation_sets(id) on delete cascade,
  job_id uuid not null references public.wildlife_inference_jobs(id) on delete cascade,
  expected_common_name text,
  expected_scientific_name text,
  observed_outcome text check (observed_outcome in ('true_positive','false_positive','false_negative','true_negative','unidentifiable')),
  image_quality text check (image_quality in ('good','blurred','dark','infrared','rain','snow','occluded','empty','other')),
  reviewer_notes text,
  reviewed_by_user_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (evaluation_set_id, job_id)
);

create index if not exists wildlife_evaluation_sets_owner_idx on public.wildlife_evaluation_sets (created_by_user_id, created_at desc);
create index if not exists wildlife_evaluation_items_set_idx on public.wildlife_evaluation_items (evaluation_set_id, observed_outcome, image_quality);

alter table public.wildlife_evaluation_sets enable row level security;
alter table public.wildlife_evaluation_items enable row level security;

drop policy if exists wildlife_evaluation_sets_owner_all on public.wildlife_evaluation_sets;
create policy wildlife_evaluation_sets_owner_all on public.wildlife_evaluation_sets
for all to authenticated
using (created_by_user_id = auth.uid())
with check (created_by_user_id = auth.uid());

drop policy if exists wildlife_evaluation_items_owner_all on public.wildlife_evaluation_items;
create policy wildlife_evaluation_items_owner_all on public.wildlife_evaluation_items
for all to authenticated
using (
  exists (
    select 1 from public.wildlife_evaluation_sets s
    where s.id = wildlife_evaluation_items.evaluation_set_id
      and s.created_by_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.wildlife_evaluation_sets s
    where s.id = wildlife_evaluation_items.evaluation_set_id
      and s.created_by_user_id = auth.uid()
  )
);
