import Link from 'next/link'
import { Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ClientTheme } from '@/lib/client-theme'

export function DashboardSupport({ theme }: { theme: ClientTheme }) {
  const isHuiloHuilo = theme.key === 'huilo-huilo'
  const href = isHuiloHuilo ? '/contacto/huilo-huilo' : '/es/contacto'

  return (
    <Card className={`border-white/10 ${theme.cardClass} shadow-lg shadow-black/10 backdrop-blur-xl`}>
      <CardHeader>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] ${theme.accentTextClass}`}>
          <Headphones className="h-5 w-5" />
        </div>
        <CardTitle className="pt-3 text-2xl font-light text-white">
          {isHuiloHuilo ? 'Soporte de la reserva' : '¿Necesitas ayuda?'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-white/55">
          {isHuiloHuilo
            ? 'Reporta una falla, solicita una revisión o consulta por una zona específica.'
            : 'Reporta un problema, solicita una revisión o resuelve una duda sobre tu servicio.'}
        </p>
        <Button asChild className={`mt-5 w-full ${theme.accentButtonClass} ${theme.accentButtonTextClass}`}>
          <Link href={href}>{isHuiloHuilo ? 'Abrir soporte' : 'Contactar soporte'}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
