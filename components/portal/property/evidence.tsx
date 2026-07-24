import { FileText } from 'lucide-react'
import { PortalEmptyState, PortalSectionHeading } from '@/components/portal/portal-ui'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatPortalDate } from '@/lib/client-portal/presentation'
import type { ClientPropertyView } from '@/lib/client-portal/property-view'

interface PropertyEvidenceProps {
  model: ClientPropertyView
}

export function PropertyEvidence({ model }: PropertyEvidenceProps) {
  return (
    <Card id="evidencia" className="border-white/10 bg-white/[0.04]">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <PortalSectionHeading eyebrow="Evidencia" title="Registros recientes" />
        <FileText className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.6} />
      </CardHeader>
      <CardContent>
        {model.evidence.length === 0 ? (
          <PortalEmptyState
            title="Sin evidencia reciente"
            detail="Las fotos, documentos y registros relacionados aparecerán aquí."
          />
        ) : (
          <div className="space-y-3">
            {model.evidence.map((item, index) => (
              <div
                key={item.id || index}
                className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4"
              >
                <p className="text-sm font-medium text-white">
                  {item.title || item.label || item.type || 'Registro'}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  {item.description || item.evidence || item.action || 'Evidencia disponible para revisión.'}
                </p>
                <p className="mt-2 text-xs text-white/35">
                  {formatPortalDate(item.createdAt || item.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
