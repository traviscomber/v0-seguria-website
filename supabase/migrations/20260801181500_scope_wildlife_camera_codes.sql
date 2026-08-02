create unique index if not exists wildlife_cameras_operation_code_uidx
  on public.wildlife_cameras(organization_id, code)
  where organization_id is not null;
