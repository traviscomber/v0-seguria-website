'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ImagePlus,
  LayoutTemplate,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PROPOSAL_BRANDBOOK, getProposalBrandCompliance } from '@/lib/proposals/brandbook'
import type { ProposalAsset, ProposalBlock, ProposalBlockType } from '@/lib/proposals/types'

const blockLabels: Record<ProposalBlockType, string> = {
  cover: 'Portada',
  'executive-summary': 'Resumen ejecutivo',
  challenge: 'Desafío',
  solution: 'Solución propuesta',
  gallery: 'Galería',
  scope: 'Alcance',
  timeline: 'Plan de implementación',
  pricing: 'Inversión',
  terms: 'Condiciones',
  closing: 'Cierre',
}

const starterBlocks: ProposalBlock[] = [
  {
    id: 'cover',
    type: 'cover',
    title: 'Propuesta de seguridad inteligente',
    body: 'Una solución diseñada para proteger la operación, mejorar la visibilidad y acelerar la respuesta.',
    layout: 'feature',
    imageIds: [],
  },
  {
    id: 'summary',
    type: 'executive-summary',
    title: 'Resumen ejecutivo',
    body: 'Describe aquí la necesidad del cliente, el contexto de la operación y el resultado esperado.',
    layout: 'editorial',
    imageIds: [],
  },
  {
    id: 'solution',
    type: 'solution',
    title: 'Solución propuesta',
    body: 'Detalla cámaras, sensores, monitoreo, protocolos y capacidades incluidas.',
    layout: 'split',
    imageIds: [],
  },
  {
    id: 'scope',
    type: 'scope',
    title: 'Alcance del servicio',
    body: 'Define sitios, equipos, instalación, puesta en marcha, soporte y responsabilidades.',
    layout: 'editorial',
    imageIds: [],
  },
  {
    id: 'pricing',
    type: 'pricing',
    title: 'Inversión',
    body: 'Agrega valores, modalidad comercial, vigencia y condiciones de pago.',
    layout: 'feature',
    imageIds: [],
  },
  {
    id: 'closing',
    type: 'closing',
    title: 'Próximos pasos',
    body: 'Confirma validación técnica, aprobación comercial y fecha estimada de implementación.',
    layout: 'feature',
    imageIds: [],
  },
]

function createBlock(type: ProposalBlockType): ProposalBlock {
  return {
    id: `${type}-${Date.now()}`,
    type,
    title: blockLabels[type],
    body: '',
    layout: type === 'gallery' ? 'gallery' : 'editorial',
    imageIds: [],
  }
}

export function ProposalBuilder() {
  const [title, setTitle] = useState('Propuesta comercial')
  const [clientName, setClientName] = useState('')
  const [blocks, setBlocks] = useState<ProposalBlock[]>(starterBlocks)
  const [assets, setAssets] = useState<ProposalAsset[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState(starterBlocks[0].id)
  const [agentInstruction, setAgentInstruction] = useState('')
  const [agentMessage, setAgentMessage] = useState('')

  const selectedBlock = blocks.find((block) => block.id === selectedBlockId) || blocks[0]
  const compliance = useMemo(
    () => getProposalBrandCompliance(blocks.map((block) => block.type)),
    [blocks]
  )

  const updateBlock = (blockId: string, patch: Partial<ProposalBlock>) => {
    setBlocks((current) => current.map((block) => (block.id === blockId ? { ...block, ...patch } : block)))
  }

  const moveBlock = (blockId: string, direction: -1 | 1) => {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === blockId)
      const target = index + direction
      if (index < 0 || target < 0 || target >= current.length) return current
      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return next
    })
  }

  const removeBlock = (blockId: string) => {
    setBlocks((current) => current.filter((block) => block.id !== blockId))
    setSelectedBlockId((current) => {
      if (current !== blockId) return current
      return blocks.find((block) => block.id !== blockId)?.id || ''
    })
  }

  const addBlock = (type: ProposalBlockType) => {
    const block = createBlock(type)
    setBlocks((current) => [...current, block])
    setSelectedBlockId(block.id)
  }

  const uploadImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const nextAssets = files.map((file, index) => ({
      id: `asset-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
      altText: file.name.replace(/\.[^/.]+$/, ''),
    }))
    setAssets((current) => [...current, ...nextAssets])

    if (selectedBlock && nextAssets.length > 0) {
      updateBlock(selectedBlock.id, {
        imageIds: [...selectedBlock.imageIds, ...nextAssets.map((asset) => asset.id)],
      })
    }
  }

  const runAgent = () => {
    const instruction = agentInstruction.trim()
    if (!instruction) return

    const lower = instruction.toLowerCase()
    const additions: ProposalBlockType[] = []
    if (lower.includes('cronograma') || lower.includes('etapa') || lower.includes('implementación')) additions.push('timeline')
    if (lower.includes('desafío') || lower.includes('problema') || lower.includes('riesgo')) additions.push('challenge')
    if (lower.includes('condiciones') || lower.includes('legal')) additions.push('terms')
    if (lower.includes('galería') || lower.includes('fotos')) additions.push('gallery')

    setBlocks((current) => {
      const existingTypes = new Set(current.map((block) => block.type))
      const newBlocks = additions
        .filter((type) => !existingTypes.has(type))
        .map((type) => createBlock(type))

      return current.map((block) => {
        if (block.type !== 'cover') return block
        return {
          ...block,
          title: clientName ? `Propuesta de seguridad para ${clientName}` : block.title,
        }
      }).concat(newBlocks)
    })

    setAgentMessage(
      additions.length > 0
        ? 'Se actualizó la estructura respetando el brandbook. Revisa los nuevos bloques antes de publicar.'
        : 'La instrucción quedó registrada. La conexión con el agente generativo se incorporará en la siguiente etapa.'
    )
    setAgentInstruction('')
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          <Badge className="border-[#4DA3D9]/30 bg-[#4DA3D9]/10 text-[#9DD2F2]">Constructor profesional</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Crear propuesta</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
            Sube imágenes, completa el contenido y obtén una composición inmediata. Todos los diseños quedan restringidos al brandbook oficial.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Button variant="outline" className="border-white/15 bg-white/[0.04] text-white hover:bg-white/10">
            Guardar borrador
          </Button>
          <Button className="bg-[#4DA3D9] text-[#071524] hover:bg-[#7BC0E8]">Vista previa</Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
        <Card className="h-fit border-white/10 bg-white/[0.035]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-white">
              <LayoutTemplate className="h-4 w-4 text-[#9DD2F2]" />
              Estructura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blocks.map((block, index) => (
              <button
                key={block.id}
                type="button"
                onClick={() => setSelectedBlockId(block.id)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${selectedBlockId === block.id ? 'border-[#4DA3D9]/45 bg-[#4DA3D9]/10' : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.05]'}`}
              >
                <span className="block text-[10px] uppercase tracking-[0.18em] text-white/35">Sección {index + 1}</span>
                <span className="mt-1 block text-sm text-white">{block.title || blockLabels[block.type]}</span>
              </button>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-3">
              {(['challenge', 'gallery', 'timeline', 'terms'] as ProposalBlockType[]).map((type) => (
                <Button key={type} variant="outline" size="sm" onClick={() => addBlock(type)} className="h-auto min-h-9 border-white/10 bg-white/[0.03] px-2 text-[11px] text-white/65 hover:bg-white/10 hover:text-white">
                  <Plus className="mr-1 h-3 w-3" /> {blockLabels[type]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-white/10 bg-white/[0.035]">
            <CardContent className="grid gap-4 p-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="proposal-title" className="text-white/70">Nombre de la propuesta</Label>
                <Input id="proposal-title" value={title} onChange={(event) => setTitle(event.target.value)} className="border-white/10 bg-black/20 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-name" className="text-white/70">Cliente</Label>
                <Input id="client-name" value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Nombre de la empresa" className="border-white/10 bg-black/20 text-white" />
              </div>
            </CardContent>
          </Card>

          {selectedBlock && (
            <Card className="border-white/10 bg-white/[0.035]">
              <CardHeader className="flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#9DD2F2]">{blockLabels[selectedBlock.type]}</p>
                  <CardTitle className="mt-1 text-lg text-white">Editar contenido</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => moveBlock(selectedBlock.id, -1)} className="text-white/60 hover:bg-white/10 hover:text-white"><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => moveBlock(selectedBlock.id, 1)} className="text-white/60 hover:bg-white/10 hover:text-white"><ArrowDown className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => removeBlock(selectedBlock.id)} className="text-red-300/70 hover:bg-red-500/10 hover:text-red-200"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="block-title" className="text-white/70">Título</Label>
                  <Input id="block-title" value={selectedBlock.title} onChange={(event) => updateBlock(selectedBlock.id, { title: event.target.value })} className="border-white/10 bg-black/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="block-body" className="text-white/70">Contenido</Label>
                  <Textarea id="block-body" value={selectedBlock.body} onChange={(event) => updateBlock(selectedBlock.id, { body: event.target.value })} rows={7} className="border-white/10 bg-black/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Composición</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {PROPOSAL_BRANDBOOK.proposalRules.allowedLayouts.map((layout) => (
                      <button key={layout} type="button" onClick={() => updateBlock(selectedBlock.id, { layout })} className={`rounded-xl border px-3 py-2 text-xs capitalize ${selectedBlock.layout === layout ? 'border-[#4DA3D9]/45 bg-[#4DA3D9]/10 text-[#9DD2F2]' : 'border-white/10 bg-white/[0.025] text-white/55'}`}>
                        {layout}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-white/15 bg-black/15 p-5 text-center">
                  <ImagePlus className="mx-auto h-7 w-7 text-[#9DD2F2]" />
                  <p className="mt-2 text-sm text-white">Agregar fotografías</p>
                  <p className="mt-1 text-xs text-white/40">Las imágenes se asignan automáticamente a la sección activa.</p>
                  <label className="mt-4 inline-flex cursor-pointer items-center rounded-lg bg-white/10 px-4 py-2 text-xs text-white transition hover:bg-white/15">
                    Seleccionar archivos
                    <input type="file" accept="image/*" multiple className="hidden" onChange={uploadImages} />
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden border-white/10 bg-[#F4F6F8] text-[#071524]">
            <CardHeader className="border-b border-black/10 bg-[#071524] text-white">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#9DD2F2]">Vista de documento</p>
              <CardTitle>{title || 'Propuesta comercial'}</CardTitle>
              <p className="text-sm text-white/55">{clientName || 'Cliente por definir'}</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6 md:p-8">
              {blocks.map((block) => {
                const blockAssets = assets.filter((asset) => block.imageIds.includes(asset.id))
                return (
                  <article key={block.id} className={`rounded-2xl border border-black/10 bg-white p-5 ${block.layout === 'split' ? 'grid gap-5 md:grid-cols-2' : ''}`}>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#4D708A]">{blockLabels[block.type]}</p>
                      <h2 className="mt-2 text-xl font-semibold">{block.title}</h2>
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#445565]">{block.body || 'Agrega contenido para esta sección.'}</p>
                    </div>
                    {blockAssets.length > 0 && (
                      <div className={`grid gap-3 ${block.layout === 'gallery' ? 'grid-cols-2' : ''}`}>
                        {blockAssets.map((asset) => (
                          <img key={asset.id} src={asset.url} alt={asset.altText} className="h-44 w-full rounded-xl object-cover" />
                        ))}
                      </div>
                    )}
                  </article>
                )
              })}
              <footer className="border-t border-black/10 pt-4 text-xs text-[#647484]">{PROPOSAL_BRANDBOOK.proposalRules.footerText}</footer>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="border-white/10 bg-white/[0.035]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-white"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Cumplimiento de marca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-semibold text-white">{compliance.score}%</span>
                <Badge className={compliance.valid ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}>{compliance.valid ? 'Listo' : 'En progreso'}</Badge>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${compliance.score}%` }} /></div>
              <div className="mt-5 space-y-2 text-xs text-white/55">
                <p className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Paleta y tipografía bloqueadas</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Logos y pie institucional protegidos</p>
                {compliance.missing.length > 0 && <p>Faltan: {compliance.missing.map((type) => blockLabels[type as ProposalBlockType]).join(', ')}.</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#4DA3D9]/25 bg-[radial-gradient(circle_at_top_right,rgba(77,163,217,0.16),transparent_45%),rgba(255,255,255,0.035)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-white"><Sparkles className="h-4 w-4 text-[#9DD2F2]" /> Agente de propuestas</CardTitle>
              <p className="text-xs leading-5 text-white/45">Describe la propuesta o pide cambios en lenguaje natural. El agente solo podrá usar componentes autorizados por el brandbook.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={agentInstruction} onChange={(event) => setAgentInstruction(event.target.value)} rows={6} placeholder="Ej.: crea una propuesta para un hotel con 12 cámaras, monitoreo nocturno y una implementación en tres etapas..." className="border-white/10 bg-black/20 text-white" />
              <Button onClick={runAgent} className="w-full bg-[#4DA3D9] text-[#071524] hover:bg-[#7BC0E8]"><Sparkles className="mr-2 h-4 w-4" /> Aplicar instrucción</Button>
              {agentMessage && <p className="rounded-xl border border-white/10 bg-black/15 p-3 text-xs leading-5 text-white/60">{agentMessage}</p>}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
