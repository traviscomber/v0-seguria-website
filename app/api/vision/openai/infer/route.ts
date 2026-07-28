import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_IMAGE_BYTES = 12 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const detectionSchema = z.object({
  species: z.enum([
    'person',
    'vehicle',
    'cat',
    'dog',
    'puma',
    'huemul',
    'pudu',
    'guanaco',
    'vicuña',
    'ñandú',
    'fox',
    'culpeo',
    'zorro_chilla',
    'zorro_gris_chileno',
    'gato_montés',
    'coipu',
    'chinchilla',
    'vizcacha',
    'livestock',
    'unknown_animal',
  ]),
  confidence: z.number().min(0).max(1),
  box: z.object({
    x1: z.number().min(0).max(1),
    y1: z.number().min(0).max(1),
    x2: z.number().min(0).max(1),
    y2: z.number().min(0).max(1),
  }),
  description: z.string().max(300),
})

const analysisSchema = z.object({
  detections: z.array(detectionSchema).max(30),
  scene_summary: z.string().max(800),
  operational_risks: z.array(z.string().max(300)).max(10),
  limitations: z.array(z.string().max(300)).max(10),
})

type ResponsesPayload = {
  output?: Array<{
    content?: Array<{
      type?: string
      text?: string
    }>
  }>
  error?: { message?: string }
}

function extractOutputText(payload: ResponsesPayload) {
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && typeof content.text === 'string') {
        return content.text
      }
    }
  }
  return null
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'openai_not_configured', message: 'OPENAI_API_KEY is required.' },
      { status: 503 }
    )
  }

  const contentType = (request.headers.get('x-image-content-type') || '').toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'unsupported_image_type' }, { status: 422 })
  }

  const image = Buffer.from(await request.arrayBuffer())
  if (image.length === 0 || image.length > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'invalid_image_size' }, { status: 422 })
  }

  const model = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini'
  const imageUrl = `data:${contentType};base64,${image.toString('base64')}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are SegurIA Vision, an expert wildlife analysis system for Chilean fauna and operational security. You specialize in identifying Chilean native animals including:
- Large fauna: Puma (Cougar), Huemul (Andean deer), Guanaco, Vicuña, Ñandú (Rhea)
- Small fauna: Pudu (dwarf deer), Culpeo (native fox), Zorro Chilla, Zorro Gris Chileno, Gato Montés, Coipu, Chinchilla, Vizcacha
- Also detect: People, vehicles, livestock, dogs, cats, and common species

INSTRUCTIONS:
1. Identify ONLY visible animals/people/vehicles in the image
2. Use provided species names exactly as listed above
3. Normalize bounding boxes to 0..1 range (top-left and bottom-right coordinates)
4. Return confidence as 0-1 scale based on visual clarity
5. Describe each detection with behavior/context/security relevance
6. Return ONLY valid JSON with required keys: detections, scene_summary, operational_risks, limitations
7. Do NOT invent hidden or occluded objects
8. Use "unknown_animal" ONLY when completely uncertain about species`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image for Chilean fauna and security detections. Identify species precisely. Return JSON with detections array (each with species, confidence 0-1, normalized box coordinates, description), scene_summary, operational_risks list, and limitations.',
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'high' },
            },
          ],
        },
      ],
      max_tokens: 2000,
    }),
  })

  const payload = (await response.json()) as ResponsesPayload
  if (!response.ok) {
    return NextResponse.json(
      {
        error: 'openai_request_failed',
        message: payload.error?.message || `OpenAI returned ${response.status}`,
      },
      { status: 502 }
    )
  }

  const outputText = payload.output?.[0]?.content?.[0]?.text
    ?? (payload as unknown as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content
    ?? null
  if (!outputText) {
    return NextResponse.json({ error: 'openai_empty_output' }, { status: 502 })
  }

  const speciesAliases: Record<string, string> = {
    // Puma variations
    cougar: 'puma',
    'mountain lion': 'puma',
    'mountain puma': 'puma',
    leon: 'puma',
    lion: 'puma',
    // Huemul variations
    huemul: 'huemul',
    'andean deer': 'huemul',
    'south andean deer': 'huemul',
    // Pudu variations
    pudu: 'pudu',
    'dwarf deer': 'pudu',
    'northern pudu': 'pudu',
    // Guanaco variations
    guanaco: 'guanaco',
    guanaca: 'guanaco',
    // Vicuña variations
    vicuña: 'vicuña',
    vicuna: 'vicuña',
    // Ñandú variations
    ñandú: 'ñandú',
    nandu: 'ñandú',
    rhea: 'ñandú',
    // Fox variations - Culpeo
    culpeo: 'culpeo',
    'culpeo fox': 'culpeo',
    'andean fox': 'culpeo',
    // Fox variations - Chilla
    chilla: 'zorro_chilla',
    'zorro chilla': 'zorro_chilla',
    // Fox variations - Grey
    'zorro gris': 'zorro_gris_chileno',
    'grey fox chilean': 'zorro_gris_chileno',
    // General fox
    fox: 'fox',
    'wild dog': 'fox',
    // Gato Montés
    'gato montés': 'gato_montés',
    'gato montes': 'gato_montés',
    'wildcat': 'gato_montés',
    // Coipu
    coipu: 'coipu',
    nutria: 'coipu',
    // Chinchilla
    chinchilla: 'chinchilla',
    // Vizcacha
    vizcacha: 'vizcacha',
    // Livestock variations
    cow: 'livestock',
    cattle: 'livestock',
    horse: 'livestock',
    sheep: 'livestock',
    goat: 'livestock',
    pig: 'livestock',
    alpaca: 'livestock',
    llama: 'livestock',
    donkey: 'livestock',
    // Non-Chilean animals
    leopard: 'unknown_animal',
    jaguar: 'unknown_animal',
    bear: 'unknown_animal',
    wolf: 'unknown_animal',
    coyote: 'zorro_chilla',
    lion: 'puma',
  }

  let analysis: z.infer<typeof analysisSchema>
  try {
    const raw = JSON.parse(outputText)
    if (Array.isArray(raw.detections)) {
      raw.detections = raw.detections.map((d: Record<string, unknown>) => ({
        ...d,
        species: speciesAliases[(d.species as string)?.toLowerCase()] ?? d.species,
      }))
    }
    analysis = analysisSchema.parse(raw)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'openai_invalid_output',
        message: error instanceof Error ? error.message : 'Invalid structured output',
      },
      { status: 502 }
    )
  }

  const detections = analysis.detections.filter(
    (item) => item.box.x2 > item.box.x1 && item.box.y2 > item.box.y1
  )

  return NextResponse.json({
    ok: true,
    provider: 'openai',
    model_version: model,
    detections_count: detections.length,
    detections,
    scene_summary: analysis.scene_summary,
    operational_risks: analysis.operational_risks,
    limitations: [
      ...analysis.limitations,
      'OpenAI Vision is a temporary evaluation provider and is not a replacement for deterministic ONNX detection.',
    ],
    timestamp: new Date().toISOString(),
  })
}
