import { NextRequest, NextResponse } from 'next/server'

import { deriveVisionAlertCandidates, type VisionCameraInput, type VisionJobInput } from '@/lib/alerts/vision-alerts'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveWildlifeAccess, writeTerritorialAudit } from '@/lib/wildlife/server-access'

export const runtime = 'nodejs'

const ALERT_SYNC_ROLES = new Set(['owner', 'admin', 'operator'])

type ScopedSource = {
  id: string
  operation_id?: string | null
  is_demo?: boolean | null
}

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const access = await resolveWildlifeAccess(auth)
  if (!ALERT_SYNC_ROLES.has(access.role)) {
    return NextResponse.json({ success: false, error: 'Tu rol no permite sincronizar alertas.' }, { status: 403 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  let alertOwnerUserId = auth.user.id
  if (access.operationId) {
    const { data: ownerLink, error: ownerError } = await supabase
      .from('user_operations')
      .select('user_id')
      .eq('operation_id', access.operationId)
      .eq('role', 'owner')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (ownerError) {
      console.error('SegurIA alert owner lookup failed:', ownerError.message)
      return NextResponse.json({ success: false, error: 'No fue posible resolver el propietario operacional.' }, { status: 500 })
    }
    if (ownerLink?.user_id) alertOwnerUserId = ownerLink.user_id
  }

  const cutoff = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()

  let jobsQuery = supabase
    .from('wildlife_inference_jobs')
    .select('id, status, review_status, camera_id, zone_label, captured_at, created_at, error_code, error_message, result_json, operation_id, is_demo, wildlife_cameras(code, name, zone_label, latitude, longitude)')
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(250)

  let camerasQuery = supabase
    .from('wildlife_cameras')
    .select('id, code, name, zone_label, latitude, longitude, active, created_at, operation_id, is_demo')
    .order('code', { ascending: true })

  let alertsQuery = supabase
    .from('seguria_alerts')
    .select('id, fingerprint, alert_type, status, operation_id, is_demo')
    .eq('module', 'vision')
    .limit(1500)

  if (access.operationId) {
    jobsQuery = jobsQuery.eq('operation_id', access.operationId)
    camerasQuery = camerasQuery.eq('operation_id', access.operationId)
    alertsQuery = alertsQuery.eq('operation_id', access.operationId)
  } else {
    jobsQuery = jobsQuery.eq('submitted_by_user_id', auth.user.id)
    camerasQuery = camerasQuery.eq('created_by_user_id', auth.user.id)
    alertsQuery = alertsQuery.eq('owner_user_id', auth.user.id)
  }

  const [jobsResult, camerasResult, alertsResult] = await Promise.all([
    jobsQuery,
    camerasQuery,
    alertsQuery,
  ])

  if (jobsResult.error || camerasResult.error || alertsResult.error) {
    console.error('SegurIA alert synchronization load failed:', {
      jobs: jobsResult.error?.message,
      cameras: camerasResult.error?.message,
      alerts: alertsResult.error?.message,
    })
    return NextResponse.json({ success: false, error: 'No fue posible sincronizar las alertas.' }, { status: 500 })
  }

  const jobRows = (jobsResult.data || []) as unknown as Array<VisionJobInput & ScopedSource>
  const cameraRows = (camerasResult.data || []) as unknown as Array<VisionCameraInput & ScopedSource>
  const jobs = jobRows as VisionJobInput[]
  const cameras = cameraRows as VisionCameraInput[]
  const candidates = deriveVisionAlertCandidates(jobs, cameras)
  const existingAlerts = alertsResult.data || []
  const existingByFingerprint = new Map(existingAlerts.map((alert) => [alert.fingerprint, alert]))
  const jobsById = new Map(jobRows.map((job) => [job.id, job]))
  const camerasById = new Map(cameraRows.map((camera) => [camera.id, camera]))
  const now = new Date().toISOString()

  const newRows = candidates
    .filter((item) => !existingByFingerprint.has(item.fingerprint))
    .map((item) => {
      const sourceJob = item.sourceType === 'wildlife_inference_job' ? jobsById.get(item.sourceId) : undefined
      const sourceCamera = item.cameraId ? camerasById.get(item.cameraId) : item.sourceType === 'wildlife_camera' ? camerasById.get(item.sourceId) : undefined
      const operationId = sourceJob?.operation_id || sourceCamera?.operation_id || access.operationId || null
      const isDemo = Boolean(sourceJob?.is_demo || sourceCamera?.is_demo)

      return {
        operation_id: operationId,
        organization_id: null,
        owner_user_id: alertOwnerUserId,
        module: 'vision',
        alert_type: item.alertType,
        severity: item.severity,
        status: 'open',
        source_type: item.sourceType,
        source_id: item.sourceId,
        camera_id: item.cameraId,
        fingerprint: item.fingerprint,
        title: item.title,
        summary: item.summary,
        zone_label: item.zoneLabel,
        detected_at: item.detectedAt,
        payload: isDemo ? { ...item.payload, demo: true } : item.payload,
        is_demo: isDemo,
      }
    })

  let createdCount = 0
  if (newRows.length > 0) {
    const { data: inserted, error: insertError } = await supabase
      .from('seguria_alerts')
      .upsert(newRows, {
        onConflict: 'owner_user_id,fingerprint',
        ignoreDuplicates: true,
      })
      .select('id')

    if (insertError) {
      console.error('SegurIA alert creation failed:', insertError.message)
      return NextResponse.json({ success: false, error: 'No fue posible crear las alertas.' }, { status: 500 })
    }

    createdCount = inserted?.length || 0
    if (inserted?.length) {
      const { error: activityError } = await supabase.from('seguria_alert_activity').insert(inserted.map((alert) => ({
        alert_id: alert.id,
        actor_user_id: null,
        action: 'created',
        previous_status: null,
        new_status: 'open',
        metadata: { producer: 'vision-rule-engine-v2', operation_id: access.operationId },
      })))
      if (activityError) console.error('SegurIA alert creation activity failed:', activityError.message)
    }
  }

  const desiredInactive = new Map(
    candidates
      .filter((item) => item.alertType === 'camera_inactive')
      .map((item) => [item.fingerprint, item]),
  )
  const existingInactive = existingAlerts.filter((alert) => alert.alert_type === 'camera_inactive')
  let reopenedCount = 0
  let autoResolvedCount = 0

  for (const existing of existingInactive) {
    const desired = desiredInactive.get(existing.fingerprint)

    if (desired && ['resolved', 'dismissed'].includes(existing.status)) {
      let reopenQuery = supabase
        .from('seguria_alerts')
        .update({
          status: 'open',
          severity: desired.severity,
          title: desired.title,
          summary: desired.summary,
          zone_label: desired.zoneLabel,
          detected_at: desired.detectedAt,
          payload: existing.is_demo ? { ...desired.payload, demo: true } : desired.payload,
          resolved_by_user_id: null,
          resolved_at: null,
          updated_at: now,
        })
        .eq('id', existing.id)
      reopenQuery = access.operationId
        ? reopenQuery.eq('operation_id', access.operationId)
        : reopenQuery.eq('owner_user_id', auth.user.id)

      const { error: reopenError } = await reopenQuery
      if (!reopenError) {
        reopenedCount += 1
        await supabase.from('seguria_alert_activity').insert({
          alert_id: existing.id,
          actor_user_id: null,
          action: 'reopened',
          previous_status: existing.status,
          new_status: 'open',
          metadata: { producer: 'vision-rule-engine-v2', operation_id: access.operationId },
        })
      }
      continue
    }

    if (!desired && ['open', 'acknowledged'].includes(existing.status)) {
      let resolveQuery = supabase
        .from('seguria_alerts')
        .update({
          status: 'resolved',
          resolved_by_user_id: null,
          resolved_at: now,
          updated_at: now,
        })
        .eq('id', existing.id)
      resolveQuery = access.operationId
        ? resolveQuery.eq('operation_id', access.operationId)
        : resolveQuery.eq('owner_user_id', auth.user.id)

      const { error: resolveError } = await resolveQuery
      if (!resolveError) {
        autoResolvedCount += 1
        await supabase.from('seguria_alert_activity').insert({
          alert_id: existing.id,
          actor_user_id: null,
          action: 'auto_resolved',
          previous_status: existing.status,
          new_status: 'resolved',
          note: 'La camara volvio a registrar actividad dentro del umbral operativo.',
          metadata: { producer: 'vision-rule-engine-v2', operation_id: access.operationId },
        })
      }
    }
  }

  await writeTerritorialAudit({
    request,
    auth,
    access,
    action: 'alerts.synchronized',
    resourceType: 'seguria_alert_collection',
    payload: {
      evaluatedJobs: jobs.length,
      evaluatedCameras: cameras.length,
      candidates: candidates.length,
      created: createdCount,
      reopened: reopenedCount,
      autoResolved: autoResolvedCount,
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      evaluated_jobs: jobs.length,
      evaluated_cameras: cameras.length,
      candidate_alerts: candidates.length,
      created: createdCount,
      reopened: reopenedCount,
      auto_resolved: autoResolvedCount,
    },
  })
}
