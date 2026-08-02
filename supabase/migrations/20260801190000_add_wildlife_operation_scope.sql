alter table public.wildlife_cameras
  add column if not exists operation_id uuid null references public.operations(id) on delete set null;

alter table public.wildlife_inference_jobs
  add column if not exists operation_id uuid null references public.operations(id) on delete set null;

alter table public.wildlife_pilot_batches
  add column if not exists operation_id uuid null references public.operations(id) on delete set null;

create index if not exists wildlife_cameras_operation_idx
  on public.wildlife_cameras(operation_id, active, code)
  where operation_id is not null;

create index if not exists wildlife_inference_jobs_operation_created_idx
  on public.wildlife_inference_jobs(operation_id, created_at desc)
  where operation_id is not null;

create index if not exists wildlife_pilot_batches_operation_created_idx
  on public.wildlife_pilot_batches(operation_id, created_at desc)
  where operation_id is not null;

drop index if exists public.wildlife_cameras_operation_code_uidx;

create unique index if not exists wildlife_cameras_operation_code_uidx
  on public.wildlife_cameras(operation_id, code)
  where operation_id is not null;

with single_operation as (
  select user_id, max(operation_id::text)::uuid as operation_id
  from public.user_operations
  group by user_id
  having count(*) = 1
)
update public.wildlife_cameras camera
set operation_id = scope.operation_id
from single_operation scope
where camera.operation_id is null
  and camera.created_by_user_id = scope.user_id;

with single_operation as (
  select user_id, max(operation_id::text)::uuid as operation_id
  from public.user_operations
  group by user_id
  having count(*) = 1
)
update public.wildlife_inference_jobs job
set operation_id = scope.operation_id
from single_operation scope
where job.operation_id is null
  and job.submitted_by_user_id = scope.user_id;

with single_operation as (
  select user_id, max(operation_id::text)::uuid as operation_id
  from public.user_operations
  group by user_id
  having count(*) = 1
)
update public.wildlife_pilot_batches batch
set operation_id = scope.operation_id
from single_operation scope
where batch.operation_id is null
  and batch.created_by_user_id = scope.user_id;

comment on column public.wildlife_cameras.operation_id is
  'Operacion SegurIA que controla acceso y visibilidad territorial.';

comment on column public.wildlife_inference_jobs.operation_id is
  'Operacion SegurIA propietaria del analisis y su evidencia.';

comment on column public.wildlife_pilot_batches.operation_id is
  'Operacion SegurIA propietaria del lote piloto.';
