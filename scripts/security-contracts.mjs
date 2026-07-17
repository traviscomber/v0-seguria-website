import fs from 'node:fs'

function read(path) {
  return fs.readFileSync(path, 'utf8')
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertNotContains(source, patterns, label) {
  for (const pattern of patterns) {
    assert(!pattern.test(source), `${label} contains forbidden pattern: ${pattern}`)
  }
}

const snapshotRoutePath = 'app/api/cameras/[deviceId]/snapshot/route.ts'
const snapshotComponentPath = 'components/camera-snapshot.tsx'
const clientProvisionRoutePath = 'app/api/clients/provision/route.ts'
const contactPagePath = 'app/contacto/page.tsx'
const leadsRoutePath = 'app/api/leads/route.ts'
const adminLeadsPath = 'app/admin/leads/page.tsx'
const signupRoutePath = 'app/api/auth/signup/route.ts'
const signupPagePath = 'app/signup/page.tsx'
const loginFormPath = 'components/login-form.tsx'
const incidentsRoutePath = 'app/api/admin/incidents/route.ts'
const incidentCenterPath = 'components/incident-center.tsx'
const notificationsRoutePath = 'app/api/notifications/route.ts'
const clientNotificationsPath = 'components/client-notification-center.tsx'
const clientPortalPagePath = 'app/app/page.tsx'
const adminIntegrationsPath = 'app/admin/integraciones/page.tsx'
const securityInventoryRoutePath = 'app/api/admin/security-inventory/route.ts'
const auditPagePath = 'app/admin/auditoria/page.tsx'
const gatewayConfigRoutePath = 'app/api/gateway/config/route.ts'
const gatewayRuntimeBridgePath = 'gateway/src/home-assistant.js'
const gatewayAutomationsRoutePath = 'app/api/gateway/automations/route.ts'
const adminDashboardPath = 'app/admin/page.tsx'
const adminClientsPath = 'app/admin/clientes/page.tsx'
const snapshotRoute = read(snapshotRoutePath)
const snapshotComponent = read(snapshotComponentPath)
const clientProvisionRoute = read(clientProvisionRoutePath)
const contactPage = read(contactPagePath)
const leadsRoute = read(leadsRoutePath)
const adminLeads = read(adminLeadsPath)
const signupRoute = read(signupRoutePath)
const signupPage = read(signupPagePath)
const loginForm = read(loginFormPath)
const incidentsRoute = read(incidentsRoutePath)
const incidentCenter = read(incidentCenterPath)
const notificationsRoute = read(notificationsRoutePath)
const clientNotifications = read(clientNotificationsPath)
const clientPortalPage = read(clientPortalPagePath)
const adminIntegrations = read(adminIntegrationsPath)
const securityInventoryRoute = read(securityInventoryRoutePath)
const auditPage = read(auditPagePath)
const gatewayConfigRoute = read(gatewayConfigRoutePath)
const gatewayRuntimeBridge = read(gatewayRuntimeBridgePath)
const gatewayAutomationsRoute = read(gatewayAutomationsRoutePath)
const adminDashboard = read(adminDashboardPath)
const adminClients = read(adminClientsPath)

assertNotContains(
  snapshotRoute,
  [
    /createSignedUrl/,
    /signedUrl/,
    /NextResponse\.json\(\s*\{\s*data:\s*\{\s*url/s,
  ],
  snapshotRoutePath
)

assert(
  /\.download\(snapshot\.object_path\)/.test(snapshotRoute),
  `${snapshotRoutePath} must download private evidence server-side.`
)
assert(
  /return new NextResponse\(image/.test(snapshotRoute),
  `${snapshotRoutePath} must return proxied image bytes.`
)
assert(
  /Content-Type/.test(snapshotRoute) && /X-Seguria-Captured-At/.test(snapshotRoute),
  `${snapshotRoutePath} must preserve media metadata headers.`
)

assertNotContains(
  snapshotComponent,
  [
    /fetch\(`/,
    /payload\?\.data\?\.url/,
    /setUrl/,
  ],
  snapshotComponentPath
)

assert(
  /src=\{`\/api\/cameras\/\$\{encodeURIComponent\(deviceId\)\}\/snapshot`\}/.test(snapshotComponent),
  `${snapshotComponentPath} must render the SegurIA snapshot proxy route directly.`
)

assert(
  /getAuthorizedRequest\(request,\s*\['admin'\]\)/.test(clientProvisionRoute),
  `${clientProvisionRoutePath} must restrict client provisioning to administrators.`
)
assert(
  /action:\s*'client\.provisioned'/.test(clientProvisionRoute) && /from\('audit_log'\)\.insert/.test(clientProvisionRoute),
  `${clientProvisionRoutePath} must write an audit event when a client is provisioned.`
)
assertNotContains(
  clientProvisionRoute,
  [/getAuthorizedRequest\(request,\s*\['admin',\s*'technician'\]\)/],
  clientProvisionRoutePath
)
assert(
  /auth\.user\.role === 'admin' \? <ClientProvisionForm \/>/.test(adminDashboard),
  `${adminDashboardPath} must hide client provisioning from non-admin users.`
)
assert(
  /auth\.user\.role === 'admin' \? <ClientProvisionForm \/>/.test(adminClients),
  `${adminClientsPath} must hide client provisioning from non-admin users.`
)
assert(
  /export async function PATCH\(request: NextRequest\)/.test(leadsRoute),
  `${leadsRoutePath} must support authenticated lead status updates.`
)
assert(
  /getAuthorizedRequest\(request,\s*\['admin',\s*'technician'\]\)/.test(leadsRoute) && /\.from\('leads'\)\s*\n\s*\.update\(/.test(leadsRoute),
  `${leadsRoutePath} must update leads in Supabase for staff users.`
)
assert(
  /method:\s*'PATCH'/.test(adminLeads) && /Guardar seguimiento/.test(adminLeads),
  `${adminLeadsPath} must persist CRM follow-up changes instead of showing read-only leads.`
)
assert(
  /fetch\('\/api\/leads'/.test(contactPage) && /cantidadSitios/.test(contactPage) && /urgencia/.test(contactPage),
  `${contactPagePath} must submit qualified leads to the Supabase-backed leads API.`
)
assert(
  /cantidadSitios:\s*z\.enum/.test(leadsRoute) && /urgencia:\s*z\.enum/.test(leadsRoute),
  `${leadsRoutePath} must validate lead site count and urgency before persistence.`
)
assert(
  /cantidadSitios/.test(adminLeads) && /Problema activo/.test(adminLeads),
  `${adminLeadsPath} must surface lead priority and site count for operators.`
)
assert(
  !fs.existsSync('lib/store.ts'),
  'lib/store.ts must not reintroduce the legacy in-memory demo store.'
)
assert(
  /status:\s*410/.test(signupRoute) && /panel interno/.test(signupRoute),
  `${signupRoutePath} must keep public signup closed.`
)
assert(
  /redirect\('\/contacto'\)/.test(signupPage),
  `${signupPagePath} must route unauthenticated account requests to contact instead of public signup.`
)
assert(
  !fs.existsSync('components/signup-form.tsx'),
  'components/signup-form.tsx must not reintroduce public account creation UI.'
)
assertNotContains(
  loginForm,
  [/registered/, /Cuenta creada/, /Crear cuenta/],
  loginFormPath
)
assert(
  /supabase\.rpc\('manage_incident'/.test(incidentsRoute),
  `${incidentsRoutePath} must use the audited incident management function.`
)
assert(
  /note:\s*z\.string\(\)\.trim\(\)\.max\(2000\)\.optional\(\)/.test(incidentsRoute),
  `${incidentsRoutePath} must accept bounded incident notes.`
)
assert(
  /function recordComment\(\)/.test(incidentCenter) && /updateIncident\(\{\s*note:\s*cleanNote\s*\}\)/.test(incidentCenter),
  `${incidentCenterPath} must persist incident comments through an explicit bitacora action.`
)
assertNotContains(
  incidentCenter,
  [/update\(\{\}\)/, /situaciÃ/, /bitÃ/, /CrÃ/, /AtenciÃ/, /PrÃ/],
  incidentCenterPath
)
assertNotContains(
  adminIntegrations,
  [/GitHub/, /Listo para puente HA/, /Ã/, /Â/, /â€¢/],
  adminIntegrationsPath
)
assert(
  /function scrubVisibleText\(value: string\)/.test(adminIntegrations) && /scrubVisiblePayload/.test(adminIntegrations),
  `${adminIntegrationsPath} must sanitize provider names from visible integration events.`
)
assert(
  /Cuenta operativa/.test(adminIntegrations) && /Puente local/.test(adminIntegrations),
  `${adminIntegrationsPath} must use neutral operational labels.`
)
assert(
  /supabase\.rpc\('acknowledge_notification'/.test(notificationsRoute),
  `${notificationsRoutePath} must acknowledge notifications through the audited RPC.`
)
assert(
  /getCurrentAuthSession\(\)/.test(notificationsRoute) && /notificationId:\s*z\.string\(\)\.uuid\(\)/.test(notificationsRoute),
  `${notificationsRoutePath} must require an authenticated user and a bounded notification id.`
)
assert(
  /function acknowledgeNotification\(id: string\)/.test(clientNotifications) && /Confirmar recepcion/.test(clientNotifications),
  `${clientNotificationsPath} must expose an explicit client acknowledgement action.`
)
assertNotContains(
  clientNotifications,
  [/ConfirmaciÃ/, /recepciÃ/, /CrÃ/, /AtenciÃ/, /Todo estÃ/, /tuya/i, /home assistant/i, /github/i],
  clientNotificationsPath
)
assert(
  /getPortalActivityFeed\(sites\)/.test(clientPortalPage) && /Actividad reciente/.test(clientPortalPage),
  `${clientPortalPagePath} must render the client-facing activity feed.`
)
assert(
  /const nextAction =/.test(clientPortalPage) && /Proxima accion/.test(clientPortalPage),
  `${clientPortalPagePath} must translate site state into a simple next action.`
)
assert(
  /<section id="sitios"/.test(clientPortalPage),
  `${clientPortalPagePath} must keep the client sites anchor used by portal navigation.`
)
assertNotContains(
  clientPortalPage,
  [/tuya/i, /home assistant/i, /github/i, /Ã/, /Â/, /â€¢/],
  clientPortalPagePath
)
assert(
  /action:\s*'device\.space_assigned'/.test(securityInventoryRoute) && /from\('audit_log'\)\.insert/.test(securityInventoryRoute),
  `${securityInventoryRoutePath} must audit device space assignments.`
)
assert(
  /createSupabaseAdminClient\(\)/.test(securityInventoryRoute) && /previousSpaceId/.test(securityInventoryRoute) && /nextSpaceId/.test(securityInventoryRoute),
  `${securityInventoryRoutePath} must use service-role audit logging with before/after space ids.`
)
assert(
  /'device\.space_assigned': 'Equipo asignado a espacio'/.test(auditPage),
  `${auditPagePath} must show device space assignment audits with a readable label.`
)
assert(
  /provider:\s*getOperationalProvider\(credential\.provider\)/.test(gatewayConfigRoute),
  `${gatewayConfigRoutePath} must expose only operational provider aliases to gateways.`
)
assertNotContains(
  gatewayConfigRoute,
  [/internalProvider:\s*credential\.provider/],
  gatewayConfigRoutePath
)
assert(
  /connection\.provider === 'local_bridge'/.test(gatewayRuntimeBridge),
  `${gatewayRuntimeBridgePath} must consume the neutral local_bridge alias from config delivery.`
)
assert(
  /function sanitizeAutomationParameters\(config: unknown\)/.test(gatewayAutomationsRoute) && /parameters:\s*sanitizeAutomationParameters\(automation\.config\)/.test(gatewayAutomationsRoute),
  `${gatewayAutomationsRoutePath} must expose sanitized automation parameters instead of raw config.`
)
assertNotContains(
  gatewayAutomationsRoute,
  [/return NextResponse\.json\(\{\s*success:\s*true,\s*data:\s*data \|\| \[\]\s*\}/, /config:\s*automation\.config/, /configuracionÃ/i, /ConfirmaciÃ/i, /instalaciÃ/i],
  gatewayAutomationsRoutePath
)

console.log(JSON.stringify({
  ok: true,
  checkedAt: new Date().toISOString(),
  contracts: [
    'camera snapshot route proxies private image bytes',
    'camera snapshot component does not receive signed storage URLs',
    'client provisioning is admin-only and audited',
    'lead CRM updates are persisted in Supabase',
    'contact form qualifies leads before CRM follow-up',
    'legacy in-memory demo store is absent',
    'public signup remains closed and internal-only',
    'incident comments are explicit and audited',
    'admin integrations use neutral visible labels',
    'client notifications are explicit and audited',
    'client portal renders activity and next actions',
    'device inventory assignments are audited',
    'gateway config hides internal provider names',
    'gateway automation delivery uses sanitized parameters',
  ],
}, null, 2))
