import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createLead } from '@/lib/store'
import type { LeadSource, LeadStatus, ProjectType } from '@/lib/types'

const leadSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  telefono: z.string().trim().min(8).max(32),
  email: z.string().trim().email().max(160),
  tipoProyecto: z.enum(['campo', 'propiedad']),
  ubicacion: z.string().trim().max(160).optional().default(''),
  tamanoAproximado: z.string().trim().max(120).optional(),
  necesidadPrincipal: z.string().trim().max(80).optional(),
  tieneCamaras: z.enum(['si', 'no', 'parcial']).optional(),
  tieneInternet: z.enum(['si', 'no', 'inestable']).optional(),
  tipoServicio: z.enum(['diagnostico', 'instalacion', 'monitoreo', 'propuesta']).optional(),
  mensaje: z.string().trim().max(1000).optional(),
  website: z.string().max(0).optional(),
})

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 8
const ipRequests = new Map<string, number[]>()

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  if (forwarded) return forwarded.split(',')[0].trim()
  return realIp?.trim() || 'unknown'
}

function isRateLimited(ip: string) {
  const now = Date.now()
  const attempts = ipRequests.get(ip) || []
  const recentAttempts = attempts.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)

  if (recentAttempts.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipRequests.set(ip, recentAttempts)
    return true
  }

  recentAttempts.push(now)
  ipRequests.set(ip, recentAttempts)
  return false
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: 'Demasiados intentos. Espera unos minutos e intenta nuevamente.' },
        { status: 429 }
      )
    }

    const payload = await request.json()
    const parsed = leadSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos invalidos. Revisa los campos obligatorios e intenta nuevamente.' },
        { status: 400 }
      )
    }

    if (parsed.data.website) {
      return NextResponse.json({ success: true, message: 'Solicitud recibida.' })
    }

    const lead = createLead({
      nombre: parsed.data.nombre,
      email: parsed.data.email,
      telefono: parsed.data.telefono,
      tipoProyecto: parsed.data.tipoProyecto as ProjectType,
      ubicacion: parsed.data.ubicacion || '',
      tamanoAproximado: parsed.data.tamanoAproximado,
      necesidadPrincipal: parsed.data.necesidadPrincipal,
      tieneCamaras: parsed.data.tieneCamaras,
      tieneInternet: parsed.data.tieneInternet,
      tipoServicio: parsed.data.tipoServicio,
      mensaje: parsed.data.mensaje,
      estado: 'nuevo' as LeadStatus,
      origen: 'web' as LeadSource,
    })

    return NextResponse.json({
      success: true,
      data: lead,
      message: 'Solicitud enviada correctamente.',
    })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}
