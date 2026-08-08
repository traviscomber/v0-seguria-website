-- Contract phase for operation-aware inference idempotency.
-- Preserve historical rows with NULL operation_id while preventing new unscoped writes.

alter table public.wildlife_inference_jobs
  add constraint wildlife_inference_jobs_operation_id_required
  check (operation_id is not null) not valid;

alter table public.wildlife_inference_jobs
  drop constraint wildlife_inference_jobs_submitted_by_user_id_sha256_model_n_key;
