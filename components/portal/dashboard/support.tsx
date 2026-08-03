import Link from 'next/link'
import { ArrowRight, Headphones } from 'lucide-react'
import type { ClientTheme } from '@/lib/client-theme'

export function DashboardSupport({ theme }: { theme: ClientTheme }) {
  const isHuiloHuilo = theme.key === 'huilo-huilo'
  const href = isHuiloHuilo ? '/contacto/huilo-huilo' : '/es/contacto'

  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 border-t border-white/10 py-5 text-white/65 transition hover:text-white"
    >
      <span className="flex items-center gap-3">
        <Headphones className={`h-4 w-4 ${theme.accentTextClass}`} strokeWidth={1.8} />
        <span>
          <span className="block text-sm font-medium text-white/85">
            {isHuiloHuilo ? 'Soporte de la reserva' : 'Soporte'}
          </span>
          <span className="mt-0.5 block text-xs text-white/40">
            {isHuiloHuilo ? 'Reportar una falla o solicitar revisión.' : 'Reportar un problema o solicitar revisión.'}
          </span>
        </span>
      </span>
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
    </Link>
  )
}
