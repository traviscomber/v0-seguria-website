-- Expand phase: add operation-aware uniqueness without removing legacy constraints.
-- Existing legacy rows with NULL operation_id remain valid and are not backfilled without provenance.

alter table public.wildlife_cameras
  add constraint wildlife_cameras_operation_code_key unique (operation_id, code);

alter table public.wildlife_inference_jobs
  add constraint wildlife_inference_jobs_operation_sha256_model_key unique (operation_id, sha256, model_name);
