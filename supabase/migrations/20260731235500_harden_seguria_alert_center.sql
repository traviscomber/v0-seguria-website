create index if not exists seguria_alert_activity_actor_user_idx
  on public.seguria_alert_activity(actor_user_id)
  where actor_user_id is not null;
create index if not exists seguria_alerts_acknowledged_by_user_idx
  on public.seguria_alerts(acknowledged_by_user_id)
  where acknowledged_by_user_id is not null;
create index if not exists seguria_alerts_resolved_by_user_idx
  on public.seguria_alerts(resolved_by_user_id)
  where resolved_by_user_id is not null;

drop policy if exists seguria_alerts_select_authorized on public.seguria_alerts;
create policy seguria_alerts_select_authorized
  on public.seguria_alerts
  for select
  to authenticated
  using (
    owner_user_id = (select auth.uid())
    or (
      organization_id is not null
      and exists (
        select 1
        from public.memberships m
        where m.organization_id = seguria_alerts.organization_id
          and m.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists seguria_alerts_insert_authorized on public.seguria_alerts;
create policy seguria_alerts_insert_authorized
  on public.seguria_alerts
  for insert
  to authenticated
  with check (
    owner_user_id = (select auth.uid())
    and (
      organization_id is null
      or exists (
        select 1
        from public.memberships m
        where m.organization_id = seguria_alerts.organization_id
          and m.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists seguria_alerts_update_authorized on public.seguria_alerts;
create policy seguria_alerts_update_authorized
  on public.seguria_alerts
  for update
  to authenticated
  using (
    owner_user_id = (select auth.uid())
    or (
      organization_id is not null
      and exists (
        select 1
        from public.memberships m
        where m.organization_id = seguria_alerts.organization_id
          and m.user_id = (select auth.uid())
          and m.role in ('owner', 'admin', 'manager')
      )
    )
  )
  with check (
    owner_user_id = (select auth.uid())
    or (
      organization_id is not null
      and exists (
        select 1
        from public.memberships m
        where m.organization_id = seguria_alerts.organization_id
          and m.user_id = (select auth.uid())
          and m.role in ('owner', 'admin', 'manager')
      )
    )
  );

drop policy if exists seguria_alert_activity_select_authorized on public.seguria_alert_activity;
create policy seguria_alert_activity_select_authorized
  on public.seguria_alert_activity
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.seguria_alerts a
      where a.id = seguria_alert_activity.alert_id
        and (
          a.owner_user_id = (select auth.uid())
          or (
            a.organization_id is not null
            and exists (
              select 1
              from public.memberships m
              where m.organization_id = a.organization_id
                and m.user_id = (select auth.uid())
            )
          )
        )
    )
  );

drop policy if exists seguria_alert_activity_insert_authorized on public.seguria_alert_activity;
create policy seguria_alert_activity_insert_authorized
  on public.seguria_alert_activity
  for insert
  to authenticated
  with check (
    (actor_user_id is null or actor_user_id = (select auth.uid()))
    and exists (
      select 1
      from public.seguria_alerts a
      where a.id = seguria_alert_activity.alert_id
        and (
          a.owner_user_id = (select auth.uid())
          or (
            a.organization_id is not null
            and exists (
              select 1
              from public.memberships m
              where m.organization_id = a.organization_id
                and m.user_id = (select auth.uid())
                and m.role in ('owner', 'admin', 'manager')
            )
          )
        )
    )
  );

revoke execute on function public.log_wildlife_inference_review_change() from public, anon, authenticated;
