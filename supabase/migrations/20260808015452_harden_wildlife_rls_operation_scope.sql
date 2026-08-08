drop policy if exists wildlife_evaluation_sets_owner_all on public.wildlife_evaluation_sets;
create policy wildlife_evaluation_sets_select_scope
on public.wildlife_evaluation_sets
for select
to authenticated
using (
  (
    operation_id is not null
    and exists (
      select 1 from public.user_operations uo
      where uo.user_id = (select auth.uid())
        and uo.operation_id = wildlife_evaluation_sets.operation_id
    )
  )
  or (
    operation_id is null
    and created_by_user_id = (select auth.uid())
  )
);

create policy wildlife_evaluation_sets_insert_scope
on public.wildlife_evaluation_sets
for insert
to authenticated
with check (
  created_by_user_id = (select auth.uid())
  and (
    (
      operation_id is not null
      and exists (
        select 1 from public.user_operations uo
        where uo.user_id = (select auth.uid())
          and uo.operation_id = wildlife_evaluation_sets.operation_id
          and lower(coalesce(uo.role, '')) in ('owner','admin','operator')
      )
    )
    or operation_id is null
  )
);

create policy wildlife_evaluation_sets_update_scope
on public.wildlife_evaluation_sets
for update
to authenticated
using (
  (
    operation_id is not null
    and exists (
      select 1 from public.user_operations uo
      where uo.user_id = (select auth.uid())
        and uo.operation_id = wildlife_evaluation_sets.operation_id
        and lower(coalesce(uo.role, '')) in ('owner','admin','operator')
    )
  )
  or (
    operation_id is null
    and created_by_user_id = (select auth.uid())
  )
)
with check (
  (
    operation_id is not null
    and exists (
      select 1 from public.user_operations uo
      where uo.user_id = (select auth.uid())
        and uo.operation_id = wildlife_evaluation_sets.operation_id
        and lower(coalesce(uo.role, '')) in ('owner','admin','operator')
    )
  )
  or (
    operation_id is null
    and created_by_user_id = (select auth.uid())
  )
);

create policy wildlife_evaluation_sets_delete_scope
on public.wildlife_evaluation_sets
for delete
to authenticated
using (
  (
    operation_id is not null
    and exists (
      select 1 from public.user_operations uo
      where uo.user_id = (select auth.uid())
        and uo.operation_id = wildlife_evaluation_sets.operation_id
        and lower(coalesce(uo.role, '')) in ('owner','admin')
    )
  )
  or (
    operation_id is null
    and created_by_user_id = (select auth.uid())
  )
);

drop policy if exists wildlife_evaluation_items_owner_all on public.wildlife_evaluation_items;
create policy wildlife_evaluation_items_select_scope
on public.wildlife_evaluation_items
for select
to authenticated
using (
  exists (
    select 1
    from public.wildlife_evaluation_sets s
    where s.id = wildlife_evaluation_items.evaluation_set_id
      and (
        (
          s.operation_id is not null
          and exists (
            select 1 from public.user_operations uo
            where uo.user_id = (select auth.uid())
              and uo.operation_id = s.operation_id
          )
        )
        or (
          s.operation_id is null
          and s.created_by_user_id = (select auth.uid())
        )
      )
  )
);

create policy wildlife_evaluation_items_insert_scope
on public.wildlife_evaluation_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.wildlife_evaluation_sets s
    where s.id = wildlife_evaluation_items.evaluation_set_id
      and (
        (
          s.operation_id is not null
          and exists (
            select 1 from public.user_operations uo
            where uo.user_id = (select auth.uid())
              and uo.operation_id = s.operation_id
              and lower(coalesce(uo.role, '')) in ('owner','admin','operator')
          )
        )
        or (
          s.operation_id is null
          and s.created_by_user_id = (select auth.uid())
        )
      )
  )
);

create policy wildlife_evaluation_items_update_scope
on public.wildlife_evaluation_items
for update
to authenticated
using (
  exists (
    select 1
    from public.wildlife_evaluation_sets s
    where s.id = wildlife_evaluation_items.evaluation_set_id
      and (
        (
          s.operation_id is not null
          and exists (
            select 1 from public.user_operations uo
            where uo.user_id = (select auth.uid())
              and uo.operation_id = s.operation_id
              and lower(coalesce(uo.role, '')) in ('owner','admin','operator')
          )
        )
        or (
          s.operation_id is null
          and s.created_by_user_id = (select auth.uid())
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.wildlife_evaluation_sets s
    where s.id = wildlife_evaluation_items.evaluation_set_id
      and (
        (
          s.operation_id is not null
          and exists (
            select 1 from public.user_operations uo
            where uo.user_id = (select auth.uid())
              and uo.operation_id = s.operation_id
              and lower(coalesce(uo.role, '')) in ('owner','admin','operator')
          )
        )
        or (
          s.operation_id is null
          and s.created_by_user_id = (select auth.uid())
        )
      )
  )
);

create policy wildlife_evaluation_items_delete_scope
on public.wildlife_evaluation_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.wildlife_evaluation_sets s
    where s.id = wildlife_evaluation_items.evaluation_set_id
      and (
        (
          s.operation_id is not null
          and exists (
            select 1 from public.user_operations uo
            where uo.user_id = (select auth.uid())
              and uo.operation_id = s.operation_id
              and lower(coalesce(uo.role, '')) in ('owner','admin')
          )
        )
        or (
          s.operation_id is null
          and s.created_by_user_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists wildlife_ai_audit_log_select_own on public.wildlife_ai_audit_log;
create policy wildlife_ai_audit_log_select_scope
on public.wildlife_ai_audit_log
for select
to authenticated
using (
  exists (
    select 1
    from public.wildlife_inference_jobs j
    where j.id = wildlife_ai_audit_log.job_id
      and (
        (
          j.operation_id is not null
          and exists (
            select 1 from public.user_operations uo
            where uo.user_id = (select auth.uid())
              and uo.operation_id = j.operation_id
          )
        )
        or (
          j.operation_id is null
          and j.submitted_by_user_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists wildlife_ai_quotas_select_own on public.wildlife_ai_quotas;
create policy wildlife_ai_quotas_select_own
on public.wildlife_ai_quotas
for select
to authenticated
using (user_id = (select auth.uid()));

comment on table public.wildlife_snapshot_candidates is
  'Internal service-role-only canonical queue of camera snapshots eligible for SegurIA Wildlife/Vision analysis. RLS is enabled and anon/authenticated access is intentionally not granted.';
comment on table public.wildlife_demo_profiles is
  'Internal service-role-only demo control state keyed by operation_id. RLS is enabled and anon/authenticated access is intentionally revoked.';