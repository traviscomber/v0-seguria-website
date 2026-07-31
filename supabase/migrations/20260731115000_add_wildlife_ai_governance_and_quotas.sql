alter table public.wildlife_inference_jobs
  add column if not exists prompt_version text not null default 'seguria-vision-v1',
  add column if not exists pipeline_version text not null default 'vision-pipeline-v1',
  add column if not exists retry_count integer not null default 0,
  add column if not exists latency_ms integer,
  add column if not exists estimated_cost_usd numeric(12,6),
  add column if not exists processing_started_at timestamptz,
  add column if not exists processing_completed_at timestamptz;

alter table public.wildlife_inference_jobs
  drop constraint if exists wildlife_inference_jobs_retry_count_nonnegative;
alter table public.wildlife_inference_jobs
  add constraint wildlife_inference_jobs_retry_count_nonnegative check (retry_count >= 0);

create table if not exists public.wildlife_ai_audit_log (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.wildlife_inference_jobs(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

create index if not exists wildlife_ai_audit_log_job_idx
  on public.wildlife_ai_audit_log (job_id, created_at desc);

alter table public.wildlife_ai_audit_log enable row level security;

drop policy if exists wildlife_ai_audit_log_select_own on public.wildlife_ai_audit_log;
create policy wildlife_ai_audit_log_select_own
  on public.wildlife_ai_audit_log for select
  to authenticated
  using (
    exists (
      select 1 from public.wildlife_inference_jobs j
      where j.id = wildlife_ai_audit_log.job_id
        and j.submitted_by_user_id = auth.uid()
    )
  );

create table if not exists public.wildlife_ai_quotas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  user_id uuid references auth.users(id) on delete cascade,
  monthly_image_limit integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (monthly_image_limit is null or monthly_image_limit >= 0),
  check (organization_id is not null or user_id is not null)
);

create unique index if not exists wildlife_ai_quotas_user_unique
  on public.wildlife_ai_quotas (user_id)
  where user_id is not null and organization_id is null;
create unique index if not exists wildlife_ai_quotas_org_unique
  on public.wildlife_ai_quotas (organization_id)
  where organization_id is not null and user_id is null;

alter table public.wildlife_ai_quotas enable row level security;

drop policy if exists wildlife_ai_quotas_select_own on public.wildlife_ai_quotas;
create policy wildlife_ai_quotas_select_own
  on public.wildlife_ai_quotas for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.log_wildlife_inference_review_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.review_status is distinct from new.review_status
     or old.corrected_common_name is distinct from new.corrected_common_name
     or old.corrected_scientific_name is distinct from new.corrected_scientific_name
     or old.review_notes is distinct from new.review_notes then
    insert into public.wildlife_ai_audit_log (
      job_id,
      actor_user_id,
      action,
      old_values,
      new_values
    ) values (
      new.id,
      new.reviewed_by_user_id,
      'human_review_updated',
      jsonb_build_object(
        'review_status', old.review_status,
        'corrected_common_name', old.corrected_common_name,
        'corrected_scientific_name', old.corrected_scientific_name,
        'review_notes', old.review_notes
      ),
      jsonb_build_object(
        'review_status', new.review_status,
        'corrected_common_name', new.corrected_common_name,
        'corrected_scientific_name', new.corrected_scientific_name,
        'review_notes', new.review_notes
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists wildlife_inference_review_audit on public.wildlife_inference_jobs;
create trigger wildlife_inference_review_audit
after update on public.wildlife_inference_jobs
for each row execute function public.log_wildlife_inference_review_change();
