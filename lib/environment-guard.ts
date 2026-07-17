import 'server-only'

import { NextResponse } from 'next/server'

type GuardOptions = {
  operation: string
  requireProductionDeployment?: boolean
}

function normalize(value?: string) {
  return value?.trim().toLowerCase() || ''
}

export function getDeploymentEnvironment() {
  const explicit = normalize(process.env.SEGURIA_ENVIRONMENT)
  if (['production', 'staging', 'development', 'test'].includes(explicit)) return explicit

  const vercel = normalize(process.env.VERCEL_ENV)
  if (vercel === 'production') return 'production'
  if (vercel === 'preview') return 'staging'
  if (vercel === 'development') return 'development'
  if (normalize(process.env.NODE_ENV) === 'test') return 'test'
  return 'development'
}

export function getDataScope() {
  const scope = normalize(process.env.SEGURIA_DATA_SCOPE)
  if (['production', 'staging', 'development', 'test'].includes(scope)) return scope
  return 'unspecified'
}

function nonProductionOverrideEnabled() {
  return normalize(process.env.SEGURIA_ALLOW_NON_PRODUCTION_OPERATIONS) === 'true'
}

export function getOperationalGuardResponse({ operation, requireProductionDeployment = false }: GuardOptions) {
  const deploymentEnvironment = getDeploymentEnvironment()
  const dataScope = getDataScope()
  const overrideEnabled = nonProductionOverrideEnabled()

  if (requireProductionDeployment && deploymentEnvironment !== 'production' && !overrideEnabled) {
    return NextResponse.json(
      {
        success: false,
        error: 'Operacion disponible solo en produccion.',
        data: { operation, deploymentEnvironment, dataScope },
      },
      { status: 409 }
    )
  }

  if (deploymentEnvironment !== 'production' && dataScope === 'production' && !overrideEnabled) {
    return NextResponse.json(
      {
        success: false,
        error: 'Operacion bloqueada: entorno no productivo apuntando a datos productivos.',
        data: { operation, deploymentEnvironment, dataScope },
      },
      { status: 409 }
    )
  }

  return null
}
