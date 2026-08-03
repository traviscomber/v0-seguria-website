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
  supportOrigin: z.string().trim().max(80).optional().default(''),
  supportSection: z.string().trim().max(80).optional().default(''),
  supportKind: z.enum(['camera', 'alert', 'incident', 'dashboard', '']).optional().default(''),
  supportPropertyId: z.string().trim().max(120).optional().default(''),
  supportItemId: z.string().trim().max(120).optional().default(''),
  supportItemLabel: z.string().trim().max(180).optional().default(''),
  supportReturnPath: z.string().trim().max(300).optional().default(''),
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
const MAX_TOTAL_SIZE = 25 * 1024 * 1024
const DEFAULT_DAILY_EVIDENCE_BUDGET = 500 * 1024 * 1024
const EVIDENCE_RETENTION_DAYS = 180
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'])

type VerifiedFile = {
  file: File
  bytes: Uint8Array
  mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf' | 'video/mp4'
  extension: 'jpg' | 'png' | 'webp' | 'pdf' | 'mp4'
}

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

function getDailyEvidenceBudget() {
  const configured = Number(process.env.SUPPORT_EVIDENCE_DAILY_BUDGET_BYTES)
  if (!Number.isFinite(configured) || configured < MAX_TOTAL_SIZE) return DEFAULT_DAILY_EVIDENCE_BUDGET
  return Math.floor(configured)
}

function safeFileName(extension: VerifiedFile['extension']) {
  return `${randomUUID()}.${extension}`
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value)
}

async function verifyFile(file: File): Promise<VerifiedFile | null> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let detected: Pick<VerifiedFile, 'mime' | 'extension'> | null = null

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    detected = { mime: 'image/jpeg', extension: 'jpg' }
  } else if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    detected = { mime: 'image/png', extension: 'png' }
  } else if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  ) {
    detected = { mime: 'image/webp', extension: 'webp' }
  } else if (bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-') {
    detected = { mime: 'application/pdf', extension: 'pdf' }
  } else if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp') {
    detected = { mime: 'video/mp4', extension: 'mp4' }
  }

  if (!detected || detected.mime !== file.type) return null
  return { file, bytes, ...detected }
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

async function getDailyEvidenceUsage(supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>) {
  const dayStart = new Date()
  dayStart.setUTCHours(0, 0, 0, 0)
  const { data, error } = await supabase
    .from('leads')
    .select('message')
    .eq('source', 'support_huilo_huilo')
    .gte('created_at', dayStart.toISOString())
    .limit(2000)

  if (error) throw error
  return (data || []).reduce((total, row) => {
    try {
      const details = row.message ? JSON.parse(String(row.message)) as Record<string, unknown> : {}
      const bytes = Number(details.evidenceTotalBytes || 0)
      return total + (Number.isFinite(bytes) && bytes > 0 ? bytes : 0)
    } catch {
      return total
    }
  }, 0)
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

    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json({ success: false, error: 'El total de adjuntos supera el límite de 25 MB.' }, { status: 400 })
    }

    const verifiedFiles: VerifiedFile[] = []
    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ success: false, error: `Formato no permitido: ${file.name}` }, { status: 400 })
      if (file.size > MAX_FILE_SIZE) return NextResponse.json({ success: false, error: `${file.name} supera el límite de 10 MB.` }, { status: 400 })
      const verified = await verifyFile(file)
      if (!verified) {
        return NextResponse.json({ success: false, error: `${file.name} no coincide con un formato de archivo válido.` }, { status: 400 })
      }
      verifiedFiles.push(verified)
    }

    const supabase = createSupabaseAdminClient()
    if (!supabase) return NextResponse.json({ success: false, error: 'El formulario no esta disponible temporalmente.' }, { status: 503 })

    const ipHash = hashClientIp(getClientIp(request))
    if (!ipHash && process.env.NODE_ENV === 'production') {
      console.error('Evidence rate limiting is disabled because no hashing secret is configured.')
    }
    if (ipHash) {
      const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString()
      const { count, error: countError } = await supabase.from('leads').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', cutoff)
      if (countError) throw countError
      if ((count || 0) >= RATE_LIMIT_MAX_REQUESTS) {
        return NextResponse.json({ success: false, error: 'Demasiados intentos. Espera unos minutos e intenta nuevamente.' }, { status: 429 })
      }
    }

    const dailyBudget = getDailyEvidenceBudget()
    const dailyUsed = totalSize > 0 ? await getDailyEvidenceUsage(supabase) : 0
    if (totalSize > 0 && dailyUsed + totalSize > dailyBudget) {
      console.warn('Daily support evidence budget reached.', { dailyUsed, requested: totalSize, dailyBudget })
      return NextResponse.json(
        { success: false, error: 'El canal de adjuntos alcanzó su capacidad diaria. Envía la solicitud sin archivos o inténtalo nuevamente mañana.' },
        { status: 429, headers: { 'Retry-After': '3600' } },
      )
    }

    const retentionUntil = new Date(Date.now() + EVIDENCE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const evidence = [] as Array<{ name: string; type: string; size: number; bucket: string; path: string; retentionUntil: string }>
    for (const verified of verifiedFiles) {
      const path = `huilo-huilo/${new Date().toISOString().slice(0, 10)}/${safeFileName(verified.extension)}`
      const { error: uploadError } = await supabase.storage.from(EVIDENCE_BUCKET).upload(path, verified.bytes, {
        contentType: verified.mime,
        upsert: false,
        cacheControl: 'private, max-age=0',
      })
      if (uploadError) throw uploadError
      uploadedPaths.push(path)
      evidence.push({ name: verified.file.name, type: verified.mime, size: verified.file.size, bucket: EVIDENCE_BUCKET, path, retentionUntil })
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
      supportContext: {
        origin: parsed.data.supportOrigin || '',
        section: parsed.data.supportSection || '',
        kind: parsed.data.supportKind || '',
        propertyId: parsed.data.supportPropertyId || '',
        itemId: parsed.data.supportItemId || '',
        itemLabel: parsed.data.supportItemLabel || '',
        returnPath: parsed.data.supportReturnPath || '',
      },
      evidence,
      evidenceTotalBytes: totalSize,
      evidenceRetentionDays: EVIDENCE_RETENTION_DAYS,
      evidenceDailyBudgetBytes: dailyBudget,
      evidenceDailyUsageBeforeBytes: dailyUsed,
    }

    const sourcePath = parsed.data.supportReturnPath
      ? `/contacto/huilo-huilo?origin=${encodeURIComponent(parsed.data.supportOrigin || 'portal')}`
      : '/contacto/huilo-huilo'

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
      source_path: sourcePath,
      consent: parsed.data.consent,
    })
    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      message: 'Solicitud enviada correctamente.',
      evidenceCount: evidence.length,
      evidenceUsage: { usedBytes: dailyUsed + totalSize, budgetBytes: dailyBudget },
    })
  } catch (error) {
    console.error('Error creating lead:', error)
    if (uploadedPaths.length > 0) {
      const supabase = createSupabaseAdminClient()
      await supabase?.storage.from(EVIDENCE_BUCKET).remove(uploadedPaths)
    }
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error interno del servidor.' }, { status: 500 })
  }
}
