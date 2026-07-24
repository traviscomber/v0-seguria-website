import { notFound, redirect } from 'next/navigation'
import {
  PropertyActivity,
  PropertyCameras,
  PropertyDevices,
  PropertyEvidence,
  PropertyHeader,
  PropertyIncidents,
  PropertyStats,
  PropertySupport,
} from '@/components/portal/property'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { buildClientPropertyView } from '@/lib/client-portal/property-view'

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params
  const session = await getCurrentAuthSession()

  if (!session || session.user.role !== 'client') {
    redirect(`/login?next=/app/properties/${propertyId}`)
  }

  const model = await buildClientPropertyView(session.user, propertyId)

  if (!model) {
    notFound()
  }

  return (
    <div className="space-y-8 pb-12">
      <PropertyHeader model={model} />
      <PropertyStats model={model} />
      <PropertyIncidents model={model} />
      <PropertyCameras model={model} />
      <PropertyDevices model={model} />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <PropertyEvidence model={model} />
        <PropertyActivity model={model} />
      </div>
      <PropertySupport />
    </div>
  )
}
