-- Contract phase: operation_id is the canonical identity scope for wildlife cameras.
-- The previous creator-scoped uniqueness constraint is removed after all live rows
-- and known write paths have been verified to carry an explicit operation_id.

alter table public.wildlife_cameras
  add constraint wildlife_cameras_operation_id_required
  check (operation_id is not null) not valid;

alter table public.wildlife_cameras
  validate constraint wildlife_cameras_operation_id_required;

alter table public.wildlife_cameras
  alter column operation_id set not null;

alter table public.wildlife_cameras
  drop constraint wildlife_cameras_operation_id_required;

alter table public.wildlife_cameras
  drop constraint wildlife_cameras_created_by_user_id_code_key;
