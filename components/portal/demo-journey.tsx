import Link from 'next/link'
import { Activity, ArrowRight, Camera, Headphones, Home, Siren, Trees } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClientTheme } from '@/lib/client-theme'

const steps = [
  { href: '/app#resumen', label: 'Resumen', detail: 'Estado general', icon: Home },
  { href: '/app#propiedades', label: 'Espacios', detail: 'Hoteles y senderos', icon: Trees },
  { href: '/app#incidentes', label: 'Prioridades', detail: 'Qué requiere acción', icon: Siren },
  { href: '/app#camaras', label: 'Vigilancia', detail: 'Evidencia visual', icon: Camera },
  { href: '/app#actividad', label: 'Actividad', detail: 'Trazabilidad', icon: Activity },
  { href: '/contacto/huilo-huilo', label: 'Ayuda', detail: 'Soporte contextual', icon: Headphones },
] as const

export function DemoJourney({ theme, compact = false }: { theme: ClientTheme; compact?: boolean }) {
  if (theme.key !== 'huilo-huilo') return null

  return (
    <aside className="rounded-[22px] border border-white/10 bg-black/20 p-3 backdrop-blur-xl" aria-label="Recorrido sugerido de la demostración">
      <div className="flex items-center justify-between gap-4 px-2 pb-3">
        <div>
          <p className={cn('text-[10px] uppercase tracking-[0.22em]', theme.accentTextClass)}>Recorrido recomendado</p>
          {!compact ? <p className="mt-1 text-xs text-white/45">Una historia completa en seis pasos, sin pantallas vacías.</p> : null}
        </div>
        <ArrowRight className={cn('h-4 w-4 shrink-0', theme.accentTextClass)} />
      </div>
      <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {steps.map((step, index) => (
          <Link
            key={step.href}
            href={step.href}
            className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] px-3 py-3 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07]"
          >
            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]', theme.accentTextClass)}>
              <step.icon className="h-4 w-4" strokeWidth={1.7} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] text-white/30">0{index + 1}</span>
              <span className="block truncate text-xs font-medium text-white/85">{step.label}</span>
              {!compact ? <span className="mt-0.5 block truncate text-[10px] text-white/35">{step.detail}</span> : null}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  )
}
