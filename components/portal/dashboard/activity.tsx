import { Clock3, FileText, Trees, Wheat } from 'lucide-react'
import {
  PortalEmptyState,
  PortalSectionHeading,
} from '@/components/portal/portal-ui'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { ClientDashboardView } from '@/lib/client-portal/dashboard-view'
import { formatPortalDate } from '@/lib/client-portal/presentation'
import type { ClientTheme } from '@/lib/client-theme'

interface DashboardActivityProps {
  activity: ClientDashboardView['activity']
  theme: ClientTheme
}

export function DashboardActivity({ activity, theme }: DashboardActivityProps) {
  const isHuiloHuilo = theme.key === 'huilo-huilo'
  const ActivityIcon = isHuiloHuilo ? Trees : theme.key === 'santa-elena' ? Wheat : Clock3
  const title = isHuiloHuilo ? 'Bitácora' : theme.key === 'santa-elena' ? 'Novedades operacionales' : 'Últimos cambios'
  const description = isHuiloHuilo
    ? 'Últimos movimientos registrados por el sistema.'
    : theme.key === 'santa-elena'
      ? 'Movimientos recientes asociados a predios, equipos y tareas.'
      : `Eventos recientes asociados a tus ${theme.vocabulary.properties}.`

  return (
    <Card className={`border-white/10 ${theme.cardClass} shadow-lg shadow-black/10 backdrop-blur-xl`}>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <PortalSectionHeading eyebrow="Actividad" title={title} description={description} />
        <ActivityIcon className={`h-5 w-5 ${theme.accentTextClass}`} strokeWidth={1.6} />
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <PortalEmptyState title="Sin movimientos recientes" detail="Los nuevos registros aparecerán aquí." />
        ) : (
          <div className="divide-y divide-white/10">
            {activity.map((item, index) => (
              <div key={item.id || index} className="group flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                <span className={`mt-0.5 rounded-xl border border-white/10 bg-black/20 p-2 ${theme.accentTextClass} transition group-hover:bg-white/[0.08]`}>
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white">{item.title || item.label || item.description || 'Actividad registrada'}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {item.detail || item.siteLabel || formatPortalDate(item.createdAt || item.updatedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
