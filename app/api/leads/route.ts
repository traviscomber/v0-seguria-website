import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createHmac } from 'node:crypto'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

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
  cantidadSitios: z.enum(['uno', 'dos_a_cinco', 'mas_de_cinco']).optional(),
  urgencia: z.enum(['normal', 'pronto', 'critica']).optional(),
  tipoServicio: z.enum(['diagnostico', 'instalacion', 'monitoreo', 'propuesta']).optional(),
  mensaje: z.string().trim().max(1000).optional(),
  website: z.string().max(0).optional(),
  consent: z.literal(true),
})

const leadUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost']),
  crmNotes: z.string().trim().max(1200).optional().default(''),
})

const RATE_LIMIT_MAX_REQUESTS = 8

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  if (forwarded) return forwarded.split(',')[0].trim()
  return realIp?.trim() || 'unknown'
}

function hashClientIp(ip: string) {
  const secret = process.env.LEAD_IP_HASH_SECRET || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) return null
  return createHmac('sha256', secret).update(ip).digest('hex')
}

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const { data, error } = await supabase
    .from('leads')
    .select('id,name,email,phone,property_type,message,source,status,created_at,updated_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('Error reading leads:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar los contactos.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

export async function PATCH(request: NextRequest) {
  try {
    const guard = getOperationalGuardResponse({ operation: 'lead.update' })
    if (guard) return guard

    const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
    if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

    const parsed = leadUpdateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Datos invalidos.' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()
    if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

    const { data: current, error: currentError } = await supabase
      .from('leads')
      .select('id,message,status')
      .eq('id', parsed.data.id)
      .maybeSingle()

    if (currentError) throw currentError
    if (!current) return NextResponse.json({ success: false, error: 'Lead no encontrado.' }, { status: 404 })

    let details: Record<string, unknown> = {}
    try {
      details = current.message ? JSON.parse(String(current.message)) : {}
    } catch {
      details = { mensaje: current.message || '' }
    }

    const crmNotes = parsed.data.crmNotes.trim()
    const nextMessage = {
      ...details,
      crmNotes,
      crmUpdatedAt: new Date().toISOString(),
      crmUpdatedBy: auth.user.email || auth.user.id,
      previousStatus: current.status || null,
    }

    const { data, error } = await supabase
      .from('leads')
      .update({
        status: parsed.data.status,
        message: JSON.stringify(nextMessage),
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.data.id)
      .select('id,name,email,phone,property_type,message,source,status,created_at,updated_at')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data, message: 'Lead actualizado.' })
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = getOperationalGuardResponse({ operation: 'lead.create' })
    if (guard) return guard

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

    const supabase = createSupabaseAdminClient()
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'El formulario no esta disponible temporalmente.' }, { status: 503 })
    }

    const ipHash = hashClientIp(getClientIp(request))
    if (ipHash) {
      const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString()
      const { count, error: countError } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', cutoff)

      if (countError) throw countError
      if ((count || 0) >= RATE_LIMIT_MAX_REQUESTS) {
        return NextResponse.json(
          { success: false, error: 'Demasiados intentos. Espera unos minutos e intenta nuevamente.' },
          { status: 429 }
        )
      }
    }

    const details = {
      ubicacion: parsed.data.ubicacion || '',
      tamanoAproximado: parsed.data.tamanoAproximado || '',
      necesidadPrincipal: parsed.data.necesidadPrincipal || '',
      tieneCamaras: parsed.data.tieneCamaras || '',
      tieneInternet: parsed.data.tieneInternet || '',
      cantidadSitios: parsed.data.cantidadSitios || '',
      urgencia: parsed.data.urgencia || '',
      tipoServicio: parsed.data.tipoServicio || '',
      mensaje: parsed.data.mensaje || '',
    }
    const { error: insertError } = await supabase.from('leads').insert({
      name: parsed.data.nombre,
      email: parsed.data.email,
      phone: parsed.data.telefono,
      property_type: parsed.data.tipoProyecto,
      message: JSON.stringify(details),
      source: 'contact_page',
      status: 'new',
      ip_hash: ipHash,
      user_agent: request.headers.get('user-agent')?.slice(0, 500) || null,
      source_path: '/contacto',
      consent: parsed.data.consent,
    })
    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      message: 'Solicitud enviada correctamente.',
    })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}
