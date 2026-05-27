import { NextRequest, NextResponse } from 'next/server'
import { createLead } from '@/lib/store'
import type { LeadStatus, LeadSource, ProjectType } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.nombre || !body.email || !body.telefono || !body.tipoProyecto) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Create lead
    const lead = createLead({
      nombre: body.nombre,
      email: body.email,
      telefono: body.telefono,
      tipoProyecto: body.tipoProyecto as ProjectType,
      ubicacion: body.ubicacion || '',
      tamanoAproximado: body.tamanoAproximado,
      necesidadPrincipal: body.necesidadPrincipal,
      tieneCamaras: body.tieneCamaras,
      tieneInternet: body.tieneInternet,
      tipoServicio: body.tipoServicio,
      mensaje: body.mensaje,
      estado: 'nuevo' as LeadStatus,
      origen: 'web' as LeadSource,
    })

    return NextResponse.json({
      success: true,
      data: lead,
      message: 'Lead creado exitosamente'
    })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // This would typically require authentication
  return NextResponse.json({
    success: false,
    error: 'Método no permitido'
  }, { status: 405 })
}
