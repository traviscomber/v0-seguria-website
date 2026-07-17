import { NextRequest, NextResponse } from 'next/server'
import {
  getIntegrationConnections,
  getIntegrationEvents,
  getIntegrationSummary,
  getIntegrationActivitySummary,
} from '@/lib/integration-state'
import { getAuthorizedRequest } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  }

  const [summary, activity, connections, recentEvents] = await Promise.all([
    getIntegrationSummary(auth.user),
    getIntegrationActivitySummary(10, auth.user),
    getIntegrationConnections(auth.user),
    getIntegrationEvents(10, auth.user),
  ])

  return NextResponse.json({
    success: true,
    data: {
      summary,
      activity,
      connections,
      recentEvents,
    },
  })
}
