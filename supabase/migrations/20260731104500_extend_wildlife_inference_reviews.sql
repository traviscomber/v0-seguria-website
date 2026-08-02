alter table public.wildlife_inference_jobs
  add column if not exists corrected_common_name text,
  add column if not exists corrected_scientific_name text,
  add column if not exists review_notes text;

alter table public.wildlife_inference_jobs
  drop constraint if exists wildlife_inference_jobs_correction_required;

alter table public.wildlife_inference_jobs
  add constraint wildlife_inference_jobs_correction_required
  check (
    review_status <> 'corrected'
    or nullif(btrim(corrected_common_name), '') is not null
    or nullif(btrim(corrected_scientific_name), '') is not null
  );

create index if not exists wildlife_inference_jobs_corrected_species_idx
  on public.wildlife_inference_jobs (corrected_scientific_name)
  where corrected_scientific_name is not null;
