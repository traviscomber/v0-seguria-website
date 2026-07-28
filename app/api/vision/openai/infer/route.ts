import { NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_IMAGE_BYTES = 12 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const detectionSchema = z.object({
  species: z.enum([
    // Personas y vehículos
    'person',
    'vehicle',
    // Mamíferos domésticos
    'cat',
    'dog',
    // Mamíferos silvestres - Carnívoros
    'puma',
    'culpeo',
    'zorro_chilla',
    'zorro_gris_chileno',
    'gato_montés',
    // Mamíferos silvestres - Ungulados
    'huemul',
    'pudu',
    'guanaco',
    'vicuña',
    // Mamíferos silvestres - Otros
    'coipu',
    'chinchilla',
    'vizcacha',
    'fox',
    'livestock',
    // Aves chilenas
    'condor',
    'aguila_harpia',
    'halcon_peregrino',
    'loro_tricahue',
    'loro_austral',
    'loro_cabeza_roja',
    'carpintero_magallanico',
    'loro_verde',
    'gavilan',
    'buho',
    'lechuza',
    'flamenco_andino',
    'flamenco_chileno',
    'gansa_colorada',
    'pato_silvestre',
    'cisne_cuello_negro',
    'cormorant',
    'gaviota',
    'gaviotín',
    'pelicano',
    'garza',
    'pinguino_de_magallanes',
    'pinguino_de_humboldt',
    'ave_desconocida',
    // Anfibios chilenos
    'rana_chilena',
    'rana_arboricola',
    'rana_de_darwin',
    'sapo_chileno',
    'sapo_espinoso',
    'rana_granuda',
    'anfibio_desconocido',
    // Insectos y artrópodos
    'mariposa',
    'escarabajo',
    'abeja',
    'avispa',
    'hormiga',
    'libélula',
    'saltamontes',
    'langosta',
    'cucaracha',
    'chinche',
    'mosca',
    'mosquito',
    'araña',
    'escorpion',
    'cienpies',
    'insecto_desconocido',
    // Categoría general
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
          content: `You are SegurIA Vision, an expert wildlife analysis system for comprehensive Chilean fauna and operational security. You specialize in identifying:

MAMÍFEROS:
- Carnívoros: Puma, Culpeo, Zorro Chilla, Zorro Gris Chileno, Gato Montés
- Ungulados: Huemul, Pudu, Guanaco, Vicuña
- Otros: Coipu, Chinchilla, Vizcacha, Ñandú, livestock

AVES CHILENAS (45+ especies):
- Raptores: Cóndor, Águila Arpía, Halcón Peregrino, Gavilán, Búho, Lechuza
- Loros: Loro Tricahue, Loro Austral, Loro Cabeza Roja, Loro Verde
- Acuáticas: Flamencos, Ganso Colorada, Pato, Cisne Cuello Negro, Cormorán, Gaviota, Gaviotín, Pelícano, Garza, Pingüinos

ANFIBIOS CHILENOS:
- Ranas: Rana Chilena, Rana Arbóricola, Rana de Darwin, Rana Granuda
- Sapos: Sapo Chileno, Sapo Espinoso

INSECTOS Y ARTRÓPODOS:
- Mariposas, Escarabajos, Abejas, Avispas, Hormigas, Libélulas, Saltamontes, Langostas, Cucarachas, Chinches, Moscas, Mosquitos, Arañas, Escorpiones, Ciempiés

INSTRUCCIONES:
1. Identificar SOLO animales/personas/vehículos visibles
2. Usar nombres de especies exactamente como se listan
3. Normalizar bounding boxes a rango 0..1 (esquina superior-izquierda e inferior-derecha)
4. Confianza como escala 0-1 basada en claridad visual
5. Describir cada detección con comportamiento/contexto/relevancia de seguridad
6. Retornar SOLO JSON válido con claves: detections, scene_summary, operational_risks, limitations
7. NO inventar objetos ocultos o fuera de vista
8. Usar "unknown_animal" SOLO cuando completamente incierto`,
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
    // Aves - Raptores
    condor: 'condor',
    cóndor: 'condor',
    condór: 'condor',
    'andean condor': 'condor',
    'águila arpía': 'aguila_harpia',
    'aguila harpia': 'aguila_harpia',
    'harpy eagle': 'aguila_harpia',
    'halcón peregrino': 'halcon_peregrino',
    'halcon peregrino': 'halcon_peregrino',
    'peregrine falcon': 'halcon_peregrino',
    gavilán: 'gavilan',
    gavilan: 'gavilan',
    hawk: 'gavilan',
    búho: 'buho',
    buho: 'buho',
    owl: 'buho',
    lechuza: 'lechuza',
    'barn owl': 'lechuza',
    // Aves - Loros
    'loro tricahue': 'loro_tricahue',
    'tricahue parrot': 'loro_tricahue',
    'loro austral': 'loro_austral',
    'austral parakeet': 'loro_austral',
    'loro cabeza roja': 'loro_cabeza_roja',
    'red-headed parrot': 'loro_cabeza_roja',
    'loro verde': 'loro_verde',
    'green parrot': 'loro_verde',
    parrot: 'loro_verde',
    // Aves - Acuáticas
    'flamenco andino': 'flamenco_andino',
    'andean flamingo': 'flamenco_andino',
    'flamenco chileno': 'flamenco_chileno',
    'chilean flamingo': 'flamenco_chileno',
    flamingo: 'flamenco_chileno',
    'ganso colorada': 'gansa_colorada',
    'upland goose': 'gansa_colorada',
    'pato silvestre': 'pato_silvestre',
    'wild duck': 'pato_silvestre',
    duck: 'pato_silvestre',
    'cisne cuello negro': 'cisne_cuello_negro',
    'black-necked swan': 'cisne_cuello_negro',
    swan: 'cisne_cuello_negro',
    cormorant: 'cormorant',
    cormorán: 'cormorant',
    gaviota: 'gaviota',
    gull: 'gaviota',
    seagull: 'gaviota',
    gaviotín: 'gaviotín',
    tern: 'gaviotín',
    pelicano: 'pelicano',
    pelican: 'pelicano',
    garza: 'garza',
    heron: 'garza',
    'pingüino de magallanes': 'pinguino_de_magallanes',
    'magellanic penguin': 'pinguino_de_magallanes',
    'pingüino de humboldt': 'pinguino_de_humboldt',
    'humboldt penguin': 'pinguino_de_humboldt',
    penguin: 'pinguino_de_magallanes',
    woodpecker: 'carpintero_magallanico',
    'carpintero magallánico': 'carpintero_magallanico',
    // Anfibios
    'rana chilena': 'rana_chilena',
    'chilean frog': 'rana_chilena',
    'rana arbóricola': 'rana_arboricola',
    'tree frog': 'rana_arboricola',
    'rana de darwin': 'rana_de_darwin',
    'darwin frog': 'rana_de_darwin',
    'rana granuda': 'rana_granuda',
    'bumpy toad': 'rana_granuda',
    'sapo chileno': 'sapo_chileno',
    'chilean toad': 'sapo_chileno',
    'sapo espinoso': 'sapo_espinoso',
    'spiny toad': 'sapo_espinoso',
    toad: 'sapo_chileno',
    frog: 'rana_chilena',
    // Insectos
    mariposa: 'mariposa',
    butterfly: 'mariposa',
    escarabajo: 'escarabajo',
    beetle: 'escarabajo',
    abeja: 'abeja',
    bee: 'abeja',
    avispa: 'avispa',
    wasp: 'avispa',
    hormiga: 'hormiga',
    ant: 'hormiga',
    libélula: 'libélula',
    dragonfly: 'libélula',
    saltamontes: 'saltamontes',
    grasshopper: 'saltamontes',
    langosta: 'langosta',
    locust: 'langosta',
    cucaracha: 'cucaracha',
    cockroach: 'cucaracha',
    chinche: 'chinche',
    'true bug': 'chinche',
    mosca: 'mosca',
    fly: 'mosca',
    mosquito: 'mosquito',
    araña: 'araña',
    spider: 'araña',
    escorpion: 'escorpion',
    scorpion: 'escorpion',
    ciempies: 'cienpies',
    centipede: 'cienpies',
    // Non-Chilean animals
    leopard: 'unknown_animal',
    jaguar: 'unknown_animal',
    bear: 'unknown_animal',
    wolf: 'unknown_animal',
    coyote: 'zorro_chilla',
  }

  let analysis: z.infer<typeof analysisSchema>
  try {
    const raw = JSON.parse(outputText)
    
    // Normalize detections
    if (Array.isArray(raw.detections)) {
      raw.detections = raw.detections
        .filter((d: Record<string, unknown>) => d && typeof d === 'object')
        .map((d: Record<string, unknown>) => ({
          species: speciesAliases[(d.species as string)?.toLowerCase().trim()] 
            ?? (d.species as string)?.toLowerCase().trim(),
          confidence: typeof d.confidence === 'number' ? Math.min(1, Math.max(0, d.confidence)) : 0.5,
          box: d.box && typeof d.box === 'object' 
            ? {
                x1: Math.min(1, Math.max(0, Number((d.box as Record<string, unknown>)?.x1) || 0)),
                y1: Math.min(1, Math.max(0, Number((d.box as Record<string, unknown>)?.y1) || 0)),
                x2: Math.min(1, Math.max(0, Number((d.box as Record<string, unknown>)?.x2) || 1)),
                y2: Math.min(1, Math.max(0, Number((d.box as Record<string, unknown>)?.y2) || 1)),
              }
            : { x1: 0, y1: 0, x2: 1, y2: 1 },
          description: String(d.description || '').substring(0, 300),
        }))
    }
    
    // Normalize string arrays
    if (!Array.isArray(raw.operational_risks)) {
      raw.operational_risks = typeof raw.operational_risks === 'string'
        ? [raw.operational_risks]
        : []
    }
    if (!Array.isArray(raw.limitations)) {
      raw.limitations = typeof raw.limitations === 'string'
        ? [raw.limitations]
        : []
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
