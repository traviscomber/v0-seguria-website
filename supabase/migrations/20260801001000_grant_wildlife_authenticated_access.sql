revoke all on public.wildlife_cameras from anon;
revoke all on public.wildlife_inference_jobs from anon;

grant select, insert, update on public.wildlife_cameras to authenticated;
grant select, insert, update on public.wildlife_inference_jobs to authenticated;
