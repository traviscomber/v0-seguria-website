import 'server-only'

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
    'fox',
    'puma',
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

  const model = process.env.OPENAI_VISION_MODEL || 'gpt-5-mini'
  const imageUrl = `data:${contentType};base64,${image.toString('base64')}`

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'developer',
          content: [
            {
              type: 'input_text',
              text:
                'You are the temporary visual analysis provider for SegurIA Vision. Identify only visible people, vehicles and animals relevant to operational security in facilities that work with animals. Bounding boxes must be normalized to 0..1 using the full image. Do not invent hidden objects. Use unknown_animal when species is uncertain. Confidence is visual confidence, not safety severity.',
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Analyze this image for operational animal-security detections and return the required structured result.',
            },
            {
              type: 'input_image',
              image_url: imageUrl,
              detail: 'high',
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'seguria_vision_analysis',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['detections', 'scene_summary', 'operational_risks', 'limitations'],
            properties: {
              detections: {
                type: 'array',
                maxItems: 30,
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['species', 'confidence', 'box', 'description'],
                  properties: {
                    species: {
                      type: 'string',
                      enum: [
                        'person',
                        'vehicle',
                        'cat',
                        'dog',
                        'fox',
                        'puma',
                        'livestock',
                        'unknown_animal',
                      ],
                    },
                    confidence: { type: 'number', minimum: 0, maximum: 1 },
                    box: {
                      type: 'object',
                      additionalProperties: false,
                      required: ['x1', 'y1', 'x2', 'y2'],
                      properties: {
                        x1: { type: 'number', minimum: 0, maximum: 1 },
                        y1: { type: 'number', minimum: 0, maximum: 1 },
                        x2: { type: 'number', minimum: 0, maximum: 1 },
                        y2: { type: 'number', minimum: 0, maximum: 1 },
                      },
                    },
                    description: { type: 'string', maxLength: 300 },
                  },
                },
              },
              scene_summary: { type: 'string', maxLength: 800 },
              operational_risks: {
                type: 'array',
                maxItems: 10,
                items: { type: 'string', maxLength: 300 },
              },
              limitations: {
                type: 'array',
                maxItems: 10,
                items: { type: 'string', maxLength: 300 },
              },
            },
          },
        },
      },
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

  const outputText = extractOutputText(payload)
  if (!outputText) {
    return NextResponse.json({ error: 'openai_empty_output' }, { status: 502 })
  }

  let analysis: z.infer<typeof analysisSchema>
  try {
    analysis = analysisSchema.parse(JSON.parse(outputText))
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
