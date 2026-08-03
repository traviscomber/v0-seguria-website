import Link from 'next/link'
import { Trees, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PortalBrandLink({
  href,
  name,
  icon: Icon = Trees,
  accentClass = 'text-emerald-200',
  compact = false,
}: {
  href: string
  name: string
  icon?: LucideIcon
  accentClass?: string
  compact?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 shrink-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03130e]"
      aria-label={`Ir al resumen de ${name}`}
    >
      <span className={cn('flex shrink-0 items-center justify-center bg-white/[0.06]', compact ? 'h-9 w-9 rounded-lg' : 'h-10 w-10 rounded-xl', accentClass)}>
        <Icon className={compact ? 'h-4.5 w-4.5' : 'h-5 w-5'} strokeWidth={1.7} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-[9px] uppercase tracking-[0.22em] text-white/40">Portal SegurIA</span>
        <span className="block max-w-44 truncate text-sm font-medium text-white">{name}</span>
      </span>
    </Link>
  )
}
