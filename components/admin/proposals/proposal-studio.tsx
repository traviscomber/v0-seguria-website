'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, ImagePlus, LayoutTemplate, Loader2, Save, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PROPOSAL_BRANDBOOK, getProposalBrandCompliance } from '@/lib/proposals/brandbook'
import { buildProposalDocument, resolveProposalDocument, validateProposalDocument } from '@/lib/proposals/document-engine'
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

function starterBlocks(context: string): ProposalBlock[] {
  return [
    { id: 'cover', type: 'cover', title: 'Propuesta de seguridad para {{client.name}}', body: 'Una solución diseñada para proteger la operación, mejorar la visibilidad y acelerar la respuesta.', layout: 'feature', imageIds: [] },
    { id: 'summary', type: 'executive-summary', title: 'Resumen ejecutivo', body: context || 'Describe la necesidad del cliente, el contexto de la operación y el resultado esperado.', layout: 'editorial', imageIds: [] },
    { id: 'solution', type: 'solution', title: 'Solución propuesta', body: 'Detalla cámaras, sensores, monitoreo, protocolos y capacidades incluidas.', layout: 'split', imageIds: [] },
    { id: 'scope', type: 'scope', title: 'Alcance del servicio', body: 'Define sitios, equipos, instalación, puesta en marcha, soporte y responsabilidades.', layout: 'editorial', imageIds: [] },
    { id: 'pricing', type: 'pricing', title: 'Inversión', body: 'Agrega valores, modalidad comercial, vigencia y condiciones de pago.', layout: 'feature', imageIds: [] },
    { id: 'closing', type: 'closing', title: 'Próximos pasos', body: 'Confirma validación técnica, aprobación comercial y fecha estimada de implementación.', layout: 'feature', imageIds: [] },
  ]
}

type ProposalStudioProps = { initialClientName?: string; initialContext?: string; leadId?: string }
type RemoteProposal = { id: string; title: string; client_name: string; blocks: ProposalBlock[]; updated_at: string }
type SaveStatus = 'loading' | 'idle' | 'saving' | 'saved' | 'error'

export function ProposalStudio({ initialClientName = '', initialContext = '', leadId }: ProposalStudioProps) {
  const localStorageKey = `proposal-draft:${leadId || 'new'}`
  const hydrated = useRef(false)
  const [proposalId, setProposalId] = useState<string>()
  const [title, setTitle] = useState('Propuesta comercial')
  const [clientName, setClientName] = useState(initialClientName)
  const [blocks, setBlocks] = useState<ProposalBlock[]>(() => starterBlocks(initialContext))
  const [assets, setAssets] = useState<ProposalAsset[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState('cover')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('loading')
  const [lastSavedAt, setLastSavedAt] = useState<string>()
  const [agentInstruction, setAgentInstruction] = useState('')
  const [agentMessage, setAgentMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    async function restoreDraft() {
      try {
        const query = leadId ? `?leadId=${encodeURIComponent(leadId)}` : ''
        const response = await fetch(`/api/admin/proposals${query}`, { cache: 'no-store' })
        const payload = await response.json()
        const remote = payload.proposal as RemoteProposal | null
        if (!cancelled && response.ok && remote) {
          setProposalId(remote.id)
          setTitle(remote.title)
          setClientName(remote.client_name)
          setBlocks(remote.blocks)
          setSelectedBlockId(remote.blocks[0]?.id || '')
          setLastSavedAt(remote.updated_at)
          setSaveStatus('saved')
          hydrated.current = true
          return
        }
      } catch {
        // Local recovery remains available if the backend is unavailable.
      }

      const local = window.localStorage.getItem(localStorageKey)
      if (!cancelled && local) {
        try {
          const draft = JSON.parse(local) as { title: string; clientName: string; blocks: ProposalBlock[]; updatedAt: string }
          setTitle(draft.title)
          setClientName(draft.clientName)
          setBlocks(draft.blocks)
          setSelectedBlockId(draft.blocks[0]?.id || '')
          setLastSavedAt(draft.updatedAt)
        } catch {
          window.localStorage.removeItem(localStorageKey)
        }
      }
      if (!cancelled) {
        hydrated.current = true
        setSaveStatus('idle')
      }
    }
    restoreDraft()
    return () => { cancelled = true }
  }, [leadId, localStorageKey])

  const selectedBlock = blocks.find((block) => block.id === selectedBlockId) || blocks[0]
  const compliance = useMemo(() => getProposalBrandCompliance(blocks.map((block) => block.type)), [blocks])
  const document = useMemo(() => buildProposalDocument({ title, clientName, sections: blocks, assets, leadId }), [title, clientName, blocks, assets, leadId])
  const resolvedDocument = useMemo(() => resolveProposalDocument(document), [document])
  const validation = useMemo(() => validateProposalDocument(document), [document])

  async function persist(source: 'manual' | 'autosave' | 'agent') {
    if (!hydrated.current) return
    setSaveStatus('saving')
    const updatedAt = new Date().toISOString()
    window.localStorage.setItem(localStorageKey, JSON.stringify({ title, clientName, blocks, updatedAt }))
    try {
      const response = await fetch('/api/admin/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: proposalId, leadId, title, clientName, blocks, source }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'No se pudo guardar')
      setProposalId(payload.proposal.id)
      setLastSavedAt(payload.proposal.updated_at)
      setSaveStatus('saved')
    } catch {
      setLastSavedAt(updatedAt)
      setSaveStatus('error')
    }
  }

  useEffect(() => {
    if (!hydrated.current) return
    setSaveStatus('idle')
    const timer = window.setTimeout(() => persist('autosave'), 1200)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, clientName, title])

  const updateBlock = (patch: Partial<ProposalBlock>) => {
    if (!selectedBlock) return
    setBlocks((current) => current.map((block) => block.id === selectedBlock.id ? { ...block, ...patch } : block))
  }

  const uploadImages = (event: ChangeEvent<HTMLInputElement>) => {
    const nextAssets = Array.from(event.target.files || []).map((file, index) => ({
      id: `asset-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
      altText: file.name.replace(/\.[^/.]+$/, ''),
    }))
    setAssets((current) => [...current, ...nextAssets])
    if (selectedBlock) updateBlock({ imageIds: [...selectedBlock.imageIds, ...nextAssets.map((asset) => asset.id)] })
  }

  const runAgent = () => {
    const instruction = agentInstruction.trim().toLowerCase()
    if (!instruction) return
    const additions: ProposalBlockType[] = []
    if (instruction.includes('cronograma') || instruction.includes('etapa')) additions.push('timeline')
    if (instruction.includes('riesgo') || instruction.includes('problema')) additions.push('challenge')
    if (instruction.includes('condiciones') || instruction.includes('legal')) additions.push('terms')
    if (instruction.includes('foto') || instruction.includes('galería')) additions.push('gallery')
    setBlocks((current) => {
      const existing = new Set(current.map((block) => block.type))
      const extra = additions.filter((type) => !existing.has(type)).map((type) => ({
        id: `${type}-${Date.now()}`,
        type,
        title: blockLabels[type],
        body: '',
        layout: type === 'gallery' ? 'gallery' as const : 'editorial' as const,
        imageIds: [],
      }))
      return current.concat(extra)
    })
    setAgentMessage(additions.length ? 'La estructura fue actualizada y será validada antes de publicar.' : 'No encontré una sección compatible en la instrucción.')
    setAgentInstruction('')
    window.setTimeout(() => persist('agent'), 0)
  }

  const statusText = saveStatus === 'loading' ? 'Buscando borradores' : saveStatus === 'saving' ? 'Guardando' : saveStatus === 'saved' ? `Guardado${lastSavedAt ? ` · ${new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' }).format(new Date(lastSavedAt))}` : ''}` : saveStatus === 'error' ? 'Guardado local; pendiente de sincronizar' : 'Cambios pendientes'

  return <div className="space-y-6">
    <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><Badge className="border-[#4DA3D9]/30 bg-[#4DA3D9]/10 text-[#9DD2F2]">Proposal Studio</Badge><h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Crear propuesta</h1><p className="mt-2 text-sm text-white/55">Editor estable con variables, validación, autoguardado y brandbook.</p></div>
      <div className="flex items-center gap-3"><span className="flex items-center gap-2 text-xs text-white/45">{saveStatus === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{statusText}</span><Button onClick={() => persist('manual')} disabled={saveStatus === 'saving'} variant="outline" className="border-white/15 bg-white/[0.04] text-white hover:bg-white/10"><Save className="mr-2 h-4 w-4" /> Guardar versión</Button></div>
    </section>

    <section className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)_330px]">
      <Card className="h-fit border-white/10 bg-white/[0.035]"><CardHeader><CardTitle className="flex items-center gap-2 text-base text-white"><LayoutTemplate className="h-4 w-4 text-[#9DD2F2]" /> Estructura</CardTitle></CardHeader><CardContent className="space-y-2">{blocks.map((block, index) => <button key={block.id} type="button" onClick={() => setSelectedBlockId(block.id)} className={`w-full rounded-xl border px-3 py-3 text-left ${selectedBlockId === block.id ? 'border-[#4DA3D9]/45 bg-[#4DA3D9]/10' : 'border-white/10 bg-white/[0.025]'}`}><span className="block text-[10px] uppercase tracking-[0.18em] text-white/35">Sección {index + 1}</span><span className="mt-1 block text-sm text-white">{block.title}</span></button>)}</CardContent></Card>

      <div className="space-y-5">
        <Card className="border-white/10 bg-white/[0.035]"><CardContent className="grid gap-4 p-5 md:grid-cols-2"><div className="space-y-2"><Label className="text-white/70">Nombre de la propuesta</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} className="border-white/10 bg-black/20 text-white" /></div><div className="space-y-2"><Label className="text-white/70">Cliente</Label><Input value={clientName} onChange={(event) => setClientName(event.target.value)} className="border-white/10 bg-black/20 text-white" /></div></CardContent></Card>
        {selectedBlock && <Card className="border-white/10 bg-white/[0.035]"><CardHeader><CardTitle className="text-lg text-white">Editar {blockLabels[selectedBlock.type]}</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label className="text-white/70">Título</Label><Input value={selectedBlock.title} onChange={(event) => updateBlock({ title: event.target.value })} className="border-white/10 bg-black/20 text-white" /></div><div className="space-y-2"><Label className="text-white/70">Contenido</Label><Textarea value={selectedBlock.body} onChange={(event) => updateBlock({ body: event.target.value })} rows={7} className="border-white/10 bg-black/20 text-white" /><p className="text-xs text-white/40">Variables disponibles: {'{{client.name}}'} y {'{{proposal.date}}'}.</p></div><div className="grid grid-cols-2 gap-2 md:grid-cols-4">{PROPOSAL_BRANDBOOK.proposalRules.allowedLayouts.map((layout) => <button key={layout} type="button" onClick={() => updateBlock({ layout })} className={`rounded-xl border px-3 py-2 text-xs capitalize ${selectedBlock.layout === layout ? 'border-[#4DA3D9]/45 bg-[#4DA3D9]/10 text-[#9DD2F2]' : 'border-white/10 text-white/55'}`}>{layout}</button>)}</div><label className="block cursor-pointer rounded-2xl border border-dashed border-white/15 bg-black/15 p-5 text-center"><ImagePlus className="mx-auto h-7 w-7 text-[#9DD2F2]" /><span className="mt-2 block text-sm text-white">Agregar fotografías</span><input type="file" accept="image/*" multiple className="hidden" onChange={uploadImages} /></label></CardContent></Card>}
        <Card className="overflow-hidden border-white/10 bg-[#F4F6F8] text-[#071524]"><CardHeader className="border-b border-black/10 bg-[#071524] text-white"><CardTitle>{resolvedDocument.metadata.title}</CardTitle><p className="text-sm text-white/55">{resolvedDocument.metadata.clientName || 'Cliente por definir'}</p></CardHeader><CardContent className="space-y-6 p-6 md:p-8">{resolvedDocument.sections.map((block) => { const blockAssets = assets.filter((asset) => block.imageIds.includes(asset.id)); return <article key={block.id} className={`rounded-2xl border border-black/10 bg-white p-5 ${block.layout === 'split' ? 'grid gap-5 md:grid-cols-2' : ''}`}><div><p className="text-[10px] uppercase tracking-[0.18em] text-[#4D708A]">{blockLabels[block.type]}</p><h2 className="mt-2 text-xl font-semibold">{block.title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#445565]">{block.body}</p></div>{blockAssets.length > 0 && <div className={`grid gap-3 ${block.layout === 'gallery' ? 'grid-cols-2' : ''}`}>{blockAssets.map((asset) => <img key={asset.id} src={asset.url} alt={asset.altText} className="h-44 w-full rounded-xl object-cover" />)}</div>}</article> })}<footer className="border-t border-black/10 pt-4 text-xs text-[#647484]">{PROPOSAL_BRANDBOOK.proposalRules.footerText}</footer></CardContent></Card>
      </div>

      <div className="space-y-5">
        <Card className="border-white/10 bg-white/[0.035]"><CardHeader><CardTitle className="flex items-center gap-2 text-base text-white"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Cumplimiento</CardTitle></CardHeader><CardContent><div className="flex items-end justify-between"><span className="text-4xl font-semibold text-white">{compliance.score}%</span><Badge className={validation.valid ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}>{validation.valid ? 'Listo' : 'Revisar'}</Badge></div><p className="mt-4 flex items-center gap-2 text-xs text-white/55">{validation.valid ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />}{validation.issues.length ? `${validation.issues.length} observaciones del motor documental` : 'Documento válido y variables resueltas'}</p>{validation.issues.slice(0, 4).map((issue) => <p key={`${issue.code}-${issue.sectionId || ''}`} className="mt-2 text-xs leading-5 text-white/45">• {issue.message}</p>)}</CardContent></Card>
        <Card className="border-[#4DA3D9]/25 bg-white/[0.035]"><CardHeader><CardTitle className="flex items-center gap-2 text-base text-white"><Sparkles className="h-4 w-4 text-[#9DD2F2]" /> Agente de propuestas</CardTitle></CardHeader><CardContent className="space-y-3"><Textarea value={agentInstruction} onChange={(event) => setAgentInstruction(event.target.value)} rows={6} placeholder="Ej.: agrega un cronograma y una sección de riesgos..." className="border-white/10 bg-black/20 text-white" /><Button onClick={runAgent} className="w-full bg-[#4DA3D9] text-[#071524] hover:bg-[#7BC0E8]"><Sparkles className="mr-2 h-4 w-4" /> Aplicar instrucción</Button>{agentMessage && <p className="rounded-xl border border-white/10 bg-black/15 p-3 text-xs leading-5 text-white/60">{agentMessage}</p>}</CardContent></Card>
      </div>
    </section>
  </div>
}
