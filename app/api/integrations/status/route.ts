import { NextResponse } from 'next/server'
import { getIntegrationConnections, getIntegrationEvents, getIntegrationSummary } from '@/lib/integration-state'

export async function GET() {
  const summary = getIntegrationSummary()

  return NextResponse.json({
    success: true,
    data: {
      summary,
      connections: getIntegrationConnections(),
      recentEvents: getIntegrationEvents(10),
    },
  })
}
