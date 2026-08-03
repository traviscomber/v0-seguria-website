import { NextRequest, NextResponse } from 'next/server'
import { createHmac, randomUUID } from 'node:crypto'
import { z } from 'zod'
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
const EVIDENCE_BUCKET = 'support-evidence'
const MAX_FILES = 4
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'])

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

function safeFileName(name: string) {
  const extension = name.includes('.') ? `.${name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '')}` : ''
  return `${randomUUID()}${extension}`
}

async function parseLeadRequest(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return { payload: await request.json(), files: [] as File[] }
  }

  const formData = await request.formData()
  const payloadRaw = formData.get('payload')
  if (typeof payloadRaw !== 'string') throw new Error('Datos de solicitud ausentes.')
  const payload = JSON.parse(payloadRaw)
  const files = formData.getAll('evidence').filter((value): value is File => value instanceof File && value.size > 0)
  return { payload, files }
}

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin'])
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

    const auth = await getAuthorizedRequest(request, ['admin'])
    if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

    const parsed = leadUpdateSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ success: false, error: 'Datos invalidos.' }, { status: 400 })

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
    try { details = current.message ? JSON.parse(String(current.message)) : {} } catch { details = { mensaje: current.message || '' } }

    const { data, error } = await supabase
      .from('leads')
      .update({
        status: parsed.data.status,
        message: JSON.stringify({
          ...details,
          crmNotes: parsed.data.crmNotes.trim(),
          crmUpdatedAt: new Date().toISOString(),
          crmUpdatedBy: auth.user.email || auth.user.id,
          previousStatus: current.status || null,
        }),
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
  const uploadedPaths: string[] = []
  try {
    const guard = getOperationalGuardResponse({ operation: 'lead.create' })
    if (guard) return guard

    const { payload, files } = await parseLeadRequest(request)
    const parsed = leadSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Datos invalidos. Revisa los campos obligatorios e intenta nuevamente.' }, { status: 400 })
    }
    if (parsed.data.website) return NextResponse.json({ success: true, message: 'Solicitud recibida.' })
    if (files.length > MAX_FILES) return NextResponse.json({ success: false, error: `Puedes adjuntar hasta ${MAX_FILES} archivos.` }, { status: 400 })

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ success: false, error: `Formato no permitido: ${file.name}` }, { status: 400 })
      if (file.size > MAX_FILE_SIZE) return NextResponse.json({ success: false, error: `${file.name} supera el límite de 10 MB.` }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()
    if (!supabase) return NextResponse.json({ success: false, error: 'El formulario no esta disponible temporalmente.' }, { status: 503 })

    const ipHash = hashClientIp(getClientIp(request))
    if (ipHash) {
      const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString()
      const { count, error: countError } = await supabase.from('leads').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', cutoff)
      if (countError) throw countError
      if ((count || 0) >= RATE_LIMIT_MAX_REQUESTS) {
        return NextResponse.json({ success: false, error: 'Demasiados intentos. Espera unos minutos e intenta nuevamente.' }, { status: 429 })
      }
    }

    const evidence = [] as Array<{ name: string; type: string; size: number; bucket: string; path: string }>
    for (const file of files) {
      const path = `huilo-huilo/${new Date().toISOString().slice(0, 10)}/${safeFileName(file.name)}`
      const { error: uploadError } = await supabase.storage.from(EVIDENCE_BUCKET).upload(path, new Uint8Array(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      })
      if (uploadError) throw uploadError
      uploadedPaths.push(path)
      evidence.push({ name: file.name, type: file.type, size: file.size, bucket: EVIDENCE_BUCKET, path })
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
      evidence,
    }

    const { error: insertError } = await supabase.from('leads').insert({
      name: parsed.data.nombre,
      email: parsed.data.email,
      phone: parsed.data.telefono,
      property_type: parsed.data.tipoProyecto,
      message: JSON.stringify(details),
      source: 'support_huilo_huilo',
      status: 'new',
      ip_hash: ipHash,
      user_agent: request.headers.get('user-agent')?.slice(0, 500) || null,
      source_path: '/contacto/huilo-huilo',
      consent: parsed.data.consent,
    })
    if (insertError) throw insertError

    return NextResponse.json({ success: true, message: 'Solicitud enviada correctamente.', evidenceCount: evidence.length })
  } catch (error) {
    console.error('Error creating lead:', error)
    if (uploadedPaths.length > 0) {
      const supabase = createSupabaseAdminClient()
      await supabase?.storage.from(EVIDENCE_BUCKET).remove(uploadedPaths)
    }
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error interno del servidor.' }, { status: 500 })
  }
}
