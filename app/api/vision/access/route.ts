import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  WILDLIFE_OPERATION_ROLES,
  normalizeWildlifeRole,
} from '@/lib/wildlife/access-control'
import {
  resolveWildlifeAccess,
  writeTerritorialAudit,
} from '@/lib/wildlife/server-access'

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(WILDLIFE_OPERATION_ROLES),
})

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const requestedOperationId = request.nextUrl.searchParams.get('operation_id')
  const access = await resolveWildlifeAccess(auth, requestedOperationId)
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  let members: Array<{ userId: string; email: string | null; name: string | null; role: string }> = []
  let audit: Array<Record<string, unknown>> = []

  if (access.operationId && access.capabilities.manageMembers) {
    const [{ data: links, error: linksError }, usersResult] = await Promise.all([
      supabase
        .from('user_operations')
        .select('user_id, role, created_at')
        .eq('operation_id', access.operationId)
        .order('created_at', { ascending: true }),
      supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ])

    if (linksError) {
      console.error('Wildlife access member listing failed:', linksError.message)
      return NextResponse.json({ success: false, error: 'No fue posible cargar los miembros.' }, { status: 500 })
    }

    const users = new Map(usersResult.data.users.map((user) => [user.id, user]))
    members = (links || []).map((link) => {
      const user = users.get(link.user_id)
      const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name
      return {
        userId: link.user_id,
        email: user?.email || null,
        name: typeof displayName === 'string' ? displayName : null,
        role: normalizeWildlifeRole(link.role),
      }
    })
  }

  if (access.operationId && access.capabilities.viewAudit) {
    const { data, error } = await supabase
      .from('wildlife_territorial_access_log')
      .select('id, actor_user_id, action, resource_type, resource_id, coordinate_precision, payload, created_at')
      .eq('operation_id', access.operationId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Wildlife access audit listing failed:', error.message)
      return NextResponse.json({ success: false, error: 'No fue posible cargar la auditoria.' }, { status: 500 })
    }
    audit = data || []
  }

  return NextResponse.json({
    success: true,
    data: {
      operationId: access.operationId,
      operationName: access.operationName,
      role: access.role,
      capabilities: access.capabilities,
      personalScope: access.personalScope,
      members,
      audit,
    },
  })
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const parsed = updateRoleSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Rol invalido.' }, { status: 400 })
  }

  const access = await resolveWildlifeAccess(auth)
  if (!access.operationId || !access.capabilities.manageMembers) {
    return NextResponse.json({ success: false, error: 'No tienes permisos para administrar roles.' }, { status: 403 })
  }
  if (parsed.data.role === 'owner' && access.role !== 'owner') {
    return NextResponse.json({ success: false, error: 'Solo un propietario puede asignar otro propietario.' }, { status: 403 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const { data: target, error: targetError } = await supabase
    .from('user_operations')
    .select('user_id, role')
    .eq('operation_id', access.operationId)
    .eq('user_id', parsed.data.userId)
    .maybeSingle()

  if (targetError) return NextResponse.json({ success: false, error: 'No fue posible verificar el miembro.' }, { status: 500 })
  if (!target) return NextResponse.json({ success: false, error: 'Miembro no encontrado.' }, { status: 404 })
  if (target.role === 'owner' && access.role !== 'owner') {
    return NextResponse.json({ success: false, error: 'Solo un propietario puede modificar a otro propietario.' }, { status: 403 })
  }

  if (target.role === 'owner' && parsed.data.role !== 'owner') {
    const { count, error: ownerCountError } = await supabase
      .from('user_operations')
      .select('id', { count: 'exact', head: true })
      .eq('operation_id', access.operationId)
      .eq('role', 'owner')
    if (ownerCountError) return NextResponse.json({ success: false, error: 'No fue posible verificar los propietarios.' }, { status: 500 })
    if ((count || 0) <= 1) {
      return NextResponse.json({ success: false, error: 'La operacion debe conservar al menos un propietario.' }, { status: 409 })
    }
  }

  const { data, error } = await supabase
    .from('user_operations')
    .update({ role: parsed.data.role })
    .eq('operation_id', access.operationId)
    .eq('user_id', parsed.data.userId)
    .select('user_id, role')
    .single()

  if (error) {
    console.error('Wildlife operation role update failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible actualizar el rol.' }, { status: 500 })
  }

  await writeTerritorialAudit({
    request,
    auth,
    access,
    action: 'operation.role_updated',
    resourceType: 'user_operation',
    resourceId: parsed.data.userId,
    payload: { previousRole: target.role, nextRole: parsed.data.role },
  })

  return NextResponse.json({ success: true, data })
}
