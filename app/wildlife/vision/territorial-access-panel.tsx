'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, MapPin, RefreshCw, ScrollText, ShieldCheck, Users } from 'lucide-react'

type Role = 'owner' | 'admin' | 'operator' | 'technician' | 'reviewer' | 'viewer'
type Member = { userId: string; email: string | null; name: string | null; role: Role }
type AuditRow = {
  id: number
  actor_user_id: string
  action: string
  resource_type: string
  resource_id: string | null
  coordinate_precision: 'exact' | 'generalized' | 'hidden' | null
  payload: Record<string, unknown>
  created_at: string
}
type AccessPayload = {
  operationId: string | null
  operationName: string | null
  role: Role
  capabilities: {
    coordinatePrecision: 'exact' | 'generalized' | 'hidden'
    manageMembers: boolean
    viewAudit: boolean
    manageCameras: boolean
    processEvidence: boolean
    reviewEvidence: boolean
    viewEvidence: boolean
  }
  personalScope: boolean
  members: Member[]
  audit: AuditRow[]
}

const roleLabels: Record<Role, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  operator: 'Operador',
  technician: 'Tecnico',
  reviewer: 'Revisor cientifico',
  viewer: 'Observador',
}

const precisionLabels = {
  exact: 'Coordenadas exactas',
  generalized: 'Coordenadas generalizadas',
  hidden: 'Coordenadas ocultas',
}

const auditLabels: Record<string, string> = {
  'territorial.coordinates_read': 'Consulta de ubicaciones',
  'territorial.camera_created': 'Camara creada',
  'territorial.camera_updated': 'Camara actualizada',
  'evidence.viewed': 'Evidencia consultada',
  'evidence.reviewed': 'Evidencia revisada',
  'operation.role_updated': 'Rol actualizado',
}

export function TerritorialAccessPanel() {
  const [access, setAccess] = useState<AccessPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/vision/access', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cargar los permisos.')
      setAccess(payload.data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar los permisos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function updateRole(userId: string, role: Role) {
    setUpdating(userId)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/vision/access', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible actualizar el rol.')
      setMessage('Rol operacional actualizado.')
      await load()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'No fue posible actualizar el rol.')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b1d2c] p-5 shadow-2xl shadow-black/15 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]">
            <ShieldCheck className="h-4 w-4" /> Acceso territorial
          </div>
          <h2 className="mt-2 text-2xl font-medium text-white">Roles, privacidad y trazabilidad</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-white/50">
            Las ubicaciones de camaras se entregan segun el rol operacional y cada consulta sensible queda registrada.
          </p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      {loading && !access && <div className="flex min-h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#8fc8ea]" /></div>}
      {error && <p className="mt-4 rounded-xl border border-red-300/20 bg-red-300/[0.05] p-3 text-sm text-red-100">{error}</p>}
      {message && <p className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.05] p-3 text-sm text-emerald-100">{message}</p>}

      {access && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoCard icon={<Users className="h-5 w-5 text-[#9DD2F2]" />} label="Operacion" value={access.operationName || 'Alcance personal'} />
            <InfoCard icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />} label="Rol" value={roleLabels[access.role]} />
            <InfoCard icon={<MapPin className="h-5 w-5 text-amber-200" />} label="Privacidad" value={precisionLabels[access.capabilities.coordinatePrecision]} />
          </div>

          {access.capabilities.coordinatePrecision !== 'exact' && (
            <p className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-3 text-sm text-amber-100/75">
              Tu vista territorial reduce la precision de las coordenadas para proteger ubicaciones sensibles.
            </p>
          )}

          {access.capabilities.manageMembers && (
            <div className="mt-5 rounded-xl border border-white/8 bg-black/20 p-4">
              <h3 className="text-sm font-medium text-white">Miembros y roles</h3>
              <div className="mt-3 space-y-2">
                {access.members.map((member) => (
                  <div key={member.userId} className="flex flex-col gap-3 rounded-lg bg-white/[0.035] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-white">{member.name || member.email || 'Usuario'}</p>
                      {member.name && member.email && <p className="mt-0.5 text-xs text-white/35">{member.email}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        disabled={updating === member.userId}
                        onChange={(event) => void updateRole(member.userId, event.target.value as Role)}
                        className="min-w-44 rounded-lg border border-white/10 bg-[#071622] px-3 py-2 text-sm text-white disabled:opacity-50"
                        aria-label={`Rol de ${member.email || member.name || member.userId}`}
                      >
                        {Object.entries(roleLabels).map(([role, label]) => <option key={role} value={role}>{label}</option>)}
                      </select>
                      {updating === member.userId && <Loader2 className="h-4 w-4 animate-spin text-[#8fc8ea]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {access.capabilities.viewAudit && (
            <div className="mt-5 rounded-xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-2"><ScrollText className="h-4 w-4 text-[#8fc8ea]" /><h3 className="text-sm font-medium text-white">Actividad sensible reciente</h3></div>
              {!access.audit.length ? <p className="mt-3 text-sm text-white/40">Todavia no existen accesos territoriales registrados.</p> : (
                <div className="mt-3 divide-y divide-white/6">
                  {access.audit.slice(0, 12).map((row) => (
                    <div key={row.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <div><p className="text-white/75">{auditLabels[row.action] || row.action}</p><p className="mt-0.5 text-xs text-white/35">{row.resource_type}{row.coordinate_precision ? ` · ${precisionLabels[row.coordinate_precision]}` : ''}</p></div>
                      <time className="text-xs text-white/35">{new Date(row.created_at).toLocaleString('es-CL')}</time>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl bg-black/20 p-4"><div className="flex items-center gap-2">{icon}<p className="text-[11px] uppercase tracking-[0.12em] text-white/35">{label}</p></div><p className="mt-3 text-lg font-medium text-white">{value}</p></div>
}
