-- Preserve FK lookup performance after removing the legacy creator-scoped
-- uniqueness constraint from wildlife_cameras.

create index wildlife_cameras_created_by_user_id_idx
  on public.wildlife_cameras(created_by_user_id);
