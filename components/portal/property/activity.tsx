import { Clock3, FileText } from 'lucide-react'
import { PortalEmptyState, PortalSectionHeading } from '@/components/portal/portal-ui'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatPortalDate } from '@/lib/client-portal/presentation'
import type { ClientPropertyView } from '@/lib/client-portal/property-view'

interface PropertyActivityProps {
  model: ClientPropertyView
}

export function PropertyActivity({ model }: PropertyActivityProps) {
  return (
    <Card id="actividad" className="border-white/10 bg-white/[0.04]">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <PortalSectionHeading eyebrow="Actividad" title="Últimos cambios" />
        <Clock3 className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.6} />
      </CardHeader>
      <CardContent>
        {model.activity.length === 0 ? (
          <PortalEmptyState title="Sin actividad reciente" detail="Los nuevos eventos aparecerán aquí." />
        ) : (
          <div className="divide-y divide-white/10">
            {model.activity.map((item, index) => (
              <div key={item.id || index} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                <span className="mt-0.5 rounded-xl bg-white/5 p-2 text-[#9DD2F2]">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white">
                    {item.title || item.label || item.description || 'Actividad registrada'}
                  </p>
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
