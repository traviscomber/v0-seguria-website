alter table public.wildlife_inference_jobs
  add column if not exists storage_bucket text,
  add column if not exists storage_path text;

alter table public.wildlife_inference_jobs
  drop constraint if exists wildlife_inference_jobs_storage_pair;

alter table public.wildlife_inference_jobs
  add constraint wildlife_inference_jobs_storage_pair
  check (
    (storage_bucket is null and storage_path is null)
    or (storage_bucket is not null and storage_path is not null)
  );

create index if not exists wildlife_inference_jobs_storage_path_idx
  on public.wildlife_inference_jobs (storage_bucket, storage_path)
  where storage_path is not null;
