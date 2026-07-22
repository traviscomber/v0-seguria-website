const defaultBaseUrl = 'https://seguria.tech'

const requiredHomeTerms = [
  'Operacion cliente',
  'Mirar primero',
  'Preparar reunion',
  'Pedir apoyo',
  'Bitacora ejecutiva',
  'Paquete de reunion',
  'Valor operativo',
  'Prueba de valor cliente',
  'Impacto ejecutivo del servicio',
  'Criterios de clase mundial',
  'Resumen para direccion',
  'Comparador operativo',
  'Lectura por rol',
  'Adopcion operativa cliente',
  'Madurez ejecutiva cliente',
  'Minuta ejecutiva',
  'Agenda semanal cliente',
  'Ficha de servicio cliente',
  'Promesa operativa cliente',
  'Completitud operativa',
  'Roadmap cliente',
  'Hitos proximos',
  'Lectura ejecutiva de riesgo',
  'Revision de directorio cliente',
  'Mapa de responsables',
  'Garantias visibles',
  'Ruta de trabajo del cliente',
  'Estandar profesional',
  'Indice ejecutivo',
  'Sala de decisiones',
  'Centro de confianza',
  'Salud por sitio',
]

const requiredDetailTerms = [
  'Modelo operativo del sitio',
  'Control diario del sitio',
  'Tablero de servicio',
  'Operacion viva',
  'Galeria de evidencia',
  'Centro de confianza',
  'Cumplimiento operativo',
  'Bandeja de acciones',
  'Equipos del sitio',
]

const forbiddenPublicTerms = [
  'Home Assistant',
  'Tuya',
  'COLUN',
  'Colun',
  'colun',
  'subyacente',
  'complejidad tecnica',
]

function readAccounts() {
  if (process.env.SEGURIA_PORTAL_ACCOUNTS) {
    const parsed = JSON.parse(process.env.SEGURIA_PORTAL_ACCOUNTS)
    if (!Array.isArray(parsed)) throw new Error('SEGURIA_PORTAL_ACCOUNTS must be a JSON array.')
    return parsed.map((account, index) => ({
      label: String(account.label || `Cuenta ${index + 1}`),
      email: String(account.email || ''),
      password: String(account.password || ''),
    }))
  }

  const accounts = [
    {
      label: 'Santa Elena',
      email: process.env.SEGURIA_SANTA_EMAIL || process.env.SEGURIA_PORTAL_SANTA_EMAIL || '',
      password: process.env.SEGURIA_SANTA_PASSWORD || process.env.SEGURIA_PORTAL_SANTA_PASSWORD || '',
    },
    {
      label: 'Huilo Huilo',
      email: process.env.SEGURIA_HUILO_EMAIL || process.env.SEGURIA_PORTAL_HUILO_EMAIL || '',
      password: process.env.SEGURIA_HUILO_PASSWORD || process.env.SEGURIA_PORTAL_HUILO_PASSWORD || '',
    },
  ]

  return accounts.filter((account) => account.email || account.password)
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertContains(source, terms, label) {
  const missing = terms.filter((term) => !source.includes(term))
  assert(missing.length === 0, `${label} missing public terms: ${missing.join(', ')}`)
}

function assertNoForbiddenTerms(source, label) {
  const found = forbiddenPublicTerms.filter((term) => source.includes(term))
  assert(found.length === 0, `${label} contains forbidden public terms: ${found.join(', ')}`)
}

function cookieHeader(response) {
  const getSetCookie = response.headers.getSetCookie?.()
  const raw = getSetCookie?.length ? getSetCookie : [response.headers.get('set-cookie')].filter(Boolean)
  return raw.map((value) => value.split(';')[0]).join('; ')
}

function firstPropertyHref(html) {
  const match = html.match(/href="(\/app\/properties\/[^"]+)"/)
  assert(match, 'Client home did not expose a property detail link.')
  return match[1]
}

async function fetchText(url, options, label) {
  const response = await fetch(url, options)
  const body = await response.text()
  assert(response.ok, `${label} returned HTTP ${response.status}: ${body.slice(0, 180)}`)
  return body
}

async function validateAccount(baseUrl, account) {
  assert(account.email, `${account.label} is missing email.`)
  assert(account.password, `${account.label} is missing password.`)

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: account.email, password: account.password }),
    redirect: 'manual',
  })
  assert(login.ok, `${account.label} login returned HTTP ${login.status}.`)

  const cookie = cookieHeader(login)
  assert(cookie, `${account.label} login did not return an auth cookie.`)

  const home = await fetchText(`${baseUrl}/app`, { headers: { cookie } }, `${account.label} /app`)
  assertContains(home, requiredHomeTerms, `${account.label} /app`)
  assertNoForbiddenTerms(home, `${account.label} /app`)

  const detailPath = firstPropertyHref(home)
  const detail = await fetchText(`${baseUrl}${detailPath}`, { headers: { cookie } }, `${account.label} ${detailPath}`)
  assertContains(detail, requiredDetailTerms, `${account.label} ${detailPath}`)
  assertNoForbiddenTerms(detail, `${account.label} ${detailPath}`)

  console.log(`${account.label}: ok ${detailPath} home=${home.length} detail=${detail.length}`)
}

async function main() {
  const baseUrl = (process.env.SEGURIA_BASE || process.env.SEGURIA_PORTAL_BASE || defaultBaseUrl).replace(/\/$/, '')
  const accounts = readAccounts()

  assert(
    accounts.length > 0,
    'Provide SEGURIA_PORTAL_ACCOUNTS JSON or SEGURIA_SANTA_EMAIL/SEGURIA_SANTA_PASSWORD and SEGURIA_HUILO_EMAIL/SEGURIA_HUILO_PASSWORD.'
  )

  for (const account of accounts) {
    await validateAccount(baseUrl, account)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
