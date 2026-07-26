type ConversationMessage = {
  role: 'user' | 'assistant'
  content: string
}

type AgentInput = {
  customerMessage: string
  customerName?: string
  history?: ConversationMessage[]
  inventoryContext?: string
}

const SEGURIA_KNOWLEDGE = `
SegurIA es una empresa de infraestructura inteligente para operaciones críticas en Chile.

Soluciones principales:
- Inteligencia artificial para cámaras existentes: detección de personas, vehículos, animales, objetos y eventos configurables.
- CCTV y videovigilancia: diseño, instalación, modernización e integración de cámaras compatibles.
- Protección perimetral y alarmas: reglas, alertas y reducción de falsas alarmas.
- Control de acceso: integración de accesos, evidencia visual y gestión operacional.
- Redes, LAN y WiFi: infraestructura de conectividad para cámaras, sensores y operación.
- Starlink y conectividad remota: conectividad para campos, predios, faenas y ubicaciones sin fibra.
- Campos inteligentes: videovigilancia, conectividad, detección de personas, vehículos y fauna.
- Hotelería y empresas: accesos, áreas críticas, bodegas, estacionamientos y redes.
- Integración de infraestructura crítica: cámaras, alarmas, redes, conectividad y automatización.

Datos comerciales:
- Cobertura: Chile, sujeto a evaluación técnica y logística.
- Contacto humano: +56 9 2800 3961 e info@seguria.tech.
- No prometas compatibilidad, stock, precios, plazos ni cobertura sin datos confirmados.
- Antes de recomendar, pregunta por ubicación, tipo de operación, cantidad y marca de cámaras, conectividad, zonas críticas, plazo y presupuesto aproximado.
- Cuando el cliente esté calificado, ofrece escalarlo a un especialista humano.
`

const SALES_INSTRUCTIONS = `
Eres el agente comercial de WhatsApp de SegurIA. Hablas como un ingeniero comercial senior: claro, cercano, consultivo y orientado a cerrar el siguiente paso.

Objetivos:
1. Entender el problema operacional antes de vender.
2. Recomendar una solución SegurIA coherente con los datos disponibles.
3. Calificar el lead sin hacer un interrogatorio.
4. Capturar progresivamente nombre, empresa, comuna o ubicación, correo, plazo y presupuesto.
5. Proponer una evaluación técnica, reunión o contacto humano cuando exista intención real.

Reglas:
- Responde en el idioma del cliente; por defecto, español de Chile.
- Mantén cada respuesta breve: normalmente 2 a 5 párrafos cortos.
- Haz como máximo dos preguntas por respuesta.
- No inventes stock, precio, descuentos, marcas compatibles ni fechas.
- Si no hay inventario confirmado, di exactamente que debes validarlo.
- No digas que eres humano. Puedes presentarte como el asistente comercial de SegurIA.
- No entregues instrucciones peligrosas ni detalles que faciliten vulnerar sistemas de seguridad.
- Cuando detectes una oportunidad seria, incluye al final una línea separada con: "ESCALAR_A_HUMANO: SI". En caso contrario: "ESCALAR_A_HUMANO: NO".
- La respuesta visible al cliente debe ir antes de esa línea de control.
`

type OpenAIResponse = {
  output_text?: string
  output?: Array<{
    content?: Array<{ type?: string; text?: string }>
  }>
}

function extractOutputText(data: OpenAIResponse) {
  if (data.output_text?.trim()) return data.output_text.trim()

  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === 'output_text' && typeof item.text === 'string')
      .map((item) => item.text)
      .join('\n')
      .trim() || ''
  )
}

export async function runSeguriaSalesAgent({
  customerMessage,
  customerName,
  history = [],
  inventoryContext,
}: AgentInput) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')

  const model = process.env.OPENAI_MODEL || 'gpt-5-mini'
  const priorMessages = history.slice(-12).map((message) => ({
    role: message.role,
    content: message.content,
  }))

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      instructions: `${SALES_INSTRUCTIONS}\n${SEGURIA_KNOWLEDGE}\nInventario disponible:\n${inventoryContext || 'No conectado todavía. Debes indicar que el stock requiere validación.'}`,
      input: [
        ...priorMessages,
        {
          role: 'user',
          content: customerName
            ? `Nombre visible del contacto: ${customerName}\nMensaje: ${customerMessage}`
            : customerMessage,
        },
      ],
      max_output_tokens: 500,
    }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(`OpenAI Responses API failed: ${response.status} ${details}`)
  }

  const raw = extractOutputText((await response.json()) as OpenAIResponse)
  if (!raw) throw new Error('OpenAI returned an empty sales response')

  const shouldEscalate = /ESCALAR_A_HUMANO:\s*SI/i.test(raw)
  const message = raw
    .replace(/\n?ESCALAR_A_HUMANO:\s*(SI|NO)\s*$/i, '')
    .trim()

  return { message, shouldEscalate }
}
