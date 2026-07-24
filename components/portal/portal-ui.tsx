import type { ElementType, ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type PortalTone = 'ok' | 'warning' | 'critical' | 'neutral'

const toneClasses: Record<PortalTone, string> = {
  ok: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100',
  warning: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
  critical: 'border-rose-400/30 bg-rose-400/10 text-rose-100',
  neutral: 'border-white/10 bg-white/5 text-white/70',
}

export function PortalStatusBadge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: PortalTone
  className?: string
}) {
  return <Badge className={cn(toneClasses[tone], className)}>{children}</Badge>
}

export function PortalStatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ElementType
  label: string
  value: string | number
  detail: string
}) {
  return (
    <Card className="border-white/10 bg-white/[0.045]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-3 text-3xl font-light text-white">{value}</p>
            <p className="mt-2 text-sm text-white/50">{detail}</p>
          </div>
          <span className="rounded-2xl bg-[#4DA3D9]/12 p-3 text-[#9DD2F2]">
            <Icon className="h-5 w-5" strokeWidth={1.7} />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function PortalEmptyState({
  title,
  detail,
  icon: Icon = CheckCircle2,
}: {
  title: string
  detail: string
  icon?: ElementType
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-5 py-8 text-center">
      <Icon className="mx-auto h-7 w-7 text-emerald-300" strokeWidth={1.6} />
      <p className="mt-3 text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-sm text-white/50">{detail}</p>
    </div>
  )
}

export function PortalSectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-light text-white">{title}</h2>
      {description ? <p className="mt-2 text-sm text-white/50">{description}</p> : null}
    </div>
  )
}
