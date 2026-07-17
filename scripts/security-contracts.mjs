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
const streamFrameRoutePath = 'app/api/cameras/[deviceId]/stream/frame/route.ts'
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
const integrationStatusRoutePath = 'app/api/integrations/status/route.ts'
const integrationStatePath = 'lib/integration-state.ts'
const securityInventoryRoutePath = 'app/api/admin/security-inventory/route.ts'
const auditPagePath = 'app/admin/auditoria/page.tsx'
const gatewayConfigRoutePath = 'app/api/gateway/config/route.ts'
const gatewayRuntimeBridgePath = 'gateway/src/home-assistant.js'
const gatewayAutomationsRoutePath = 'app/api/gateway/automations/route.ts'
const gatewayCameraSnapshotRoutePath = 'app/api/gateway/cameras/snapshot/route.ts'
const adminAutomationsRoutePath = 'app/api/admin/automations/route.ts'
const adminDashboardPath = 'app/admin/page.tsx'
const adminClientsPath = 'app/admin/clientes/page.tsx'
const adminProjectsPath = 'app/admin/proyectos/page.tsx'
const adminDocumentsPath = 'app/admin/documentos/page.tsx'
const authStorePath = 'lib/auth-store.ts'
const snapshotRoute = read(snapshotRoutePath)
const snapshotComponent = read(snapshotComponentPath)
const streamFrameRoute = read(streamFrameRoutePath)
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
const integrationStatusRoute = read(integrationStatusRoutePath)
const integrationState = read(integrationStatePath)
const securityInventoryRoute = read(securityInventoryRoutePath)
const auditPage = read(auditPagePath)
const gatewayConfigRoute = read(gatewayConfigRoutePath)
const gatewayRuntimeBridge = read(gatewayRuntimeBridgePath)
const gatewayAutomationsRoute = read(gatewayAutomationsRoutePath)
const gatewayCameraSnapshotRoute = read(gatewayCameraSnapshotRoutePath)
const adminAutomationsRoute = read(adminAutomationsRoutePath)
const adminDashboard = read(adminDashboardPath)
const adminClients = read(adminClientsPath)
const adminProjects = read(adminProjectsPath)
const adminDocuments = read(adminDocumentsPath)
const authStore = read(authStorePath)

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
  /canAccessProperty\(auth\.user, device\.property_id\)/.test(snapshotRoute) &&
    /\.select\('id, property_id'\)/.test(snapshotRoute),
  `${snapshotRoutePath} must explicitly authorize snapshot access by device property.`
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
assertNotContains(
  streamFrameRoute,
  [/createSignedUrl/, /signedUrl/],
  streamFrameRoutePath
)
assert(
  /\.download\(snapshot\.object_path\)/.test(streamFrameRoute) && /return new NextResponse\(bytes/.test(streamFrameRoute),
  `${streamFrameRoutePath} must proxy private frame bytes without signed storage URLs.`
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
  /hasScopedAccess = auth\.user\.role === 'admin' \|\| \(auth\.user\.clientIds\.length > 0 && auth\.user\.propertyIds\.length > 0\)/.test(adminDashboard) &&
    /\.in\('id', auth\.user\.clientIds\)/.test(adminDashboard) &&
    /\.in\('property_id', auth\.user\.propertyIds\)/.test(adminDashboard) &&
    /auth\.user\.role === 'admin'\s*\?\s*supabase\.from\('leads'\)/.test(adminDashboard),
  `${adminDashboardPath} must scope dashboard counts by authenticated clients and properties.`
)
assert(
  /auth\.user\.role === 'admin' \? <ClientProvisionForm \/>/.test(adminClients),
  `${adminClientsPath} must hide client provisioning from non-admin users.`
)
assert(
  /if \(user\.role === 'admin'\) return true\s*\n\s*return user\.propertyIds\.includes\(propertyId\)/.test(authStore),
  `${authStorePath} must scope property access for technicians and clients.`
)
assert(
  /if \(user\.role === 'admin'\) return true\s*\n\s*return user\.clientIds\.includes\(clientId\)/.test(authStore),
  `${authStorePath} must scope client access for technicians and clients.`
)
assert(
  /organizationsQuery = organizationsQuery\.in\('id', auth\.user\.clientIds\)/.test(adminClients) &&
    /propertiesQuery = propertiesQuery\.in\('id', auth\.user\.propertyIds\)/.test(adminClients) &&
    /devicesQuery = devicesQuery\.in\('property_id', auth\.user\.propertyIds\)/.test(adminClients) &&
    !/scopedOrganizationIds/.test(adminClients) &&
    !/scopedPropertyIds/.test(adminClients),
  `${adminClientsPath} must query non-admin client visibility by authenticated scope.`
)
assert(
  /propertiesQuery = propertiesQuery\.in\('id', auth\.user\.propertyIds\)/.test(adminProjects) &&
    /organizationsQuery = organizationsQuery\.in\('id', auth\.user\.clientIds\)/.test(adminProjects) &&
    /devicesQuery = devicesQuery\.in\('property_id', auth\.user\.propertyIds\)/.test(adminProjects) &&
    !/allowedPropertyIds/.test(adminProjects),
  `${adminProjectsPath} must query project operations through authenticated client and property scope.`
)
assert(
  /snapshotsQuery = snapshotsQuery\.in\('property_id', auth\.user\.propertyIds\)/.test(adminDocuments) &&
    /propertiesQuery = propertiesQuery\.in\('id', auth\.user\.propertyIds\)/.test(adminDocuments) &&
    /devicesQuery = devicesQuery\.in\('property_id', auth\.user\.propertyIds\)/.test(adminDocuments) &&
    !/allowedPropertyIds/.test(adminDocuments),
  `${adminDocumentsPath} must query evidence through authenticated property scope.`
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
  /incidentsQuery = incidentsQuery\.in\('property_id', auth\.user\.propertyIds\)/.test(incidentsRoute) &&
    /canAccessProperty\(auth\.user, incident\.property_id\)/.test(incidentsRoute) &&
    /getVisibleOperatorIds\(supabase, auth\)/.test(incidentsRoute),
  `${incidentsRoutePath} must scope incident reads, mutations, and assignees by authenticated properties.`
)
assert(
  /note:\s*z\.string\(\)\.trim\(\)\.max\(2000\)\.optional\(\)/.test(incidentsRoute),
  `${incidentsRoutePath} must accept bounded incident notes.`
)
assertNotContains(
  incidentsRoute,
  [/Cambio invÃ/i, /transiciÃ/i, /asignaciÃ/i, /estÃ/i],
  incidentsRoutePath
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
  /getIntegrationSummary\(user\)/.test(adminIntegrations) &&
    /getIntegrationConnections\(user\)/.test(adminIntegrations) &&
    /getIntegrationEvents\(12, user\)/.test(adminIntegrations),
  `${adminIntegrationsPath} must load integration metrics through the authenticated user scope.`
)
assert(
  /getIntegrationSummary\(auth\.user\)/.test(integrationStatusRoute) &&
    /getIntegrationConnections\(auth\.user\)/.test(integrationStatusRoute) &&
    /getIntegrationEvents\(10, auth\.user\)/.test(integrationStatusRoute),
  `${integrationStatusRoutePath} must load integration status through the authenticated user scope.`
)
assert(
  /function hasScopedProperties\(user\?: AuthUser\)/.test(integrationState) &&
    /integrationsQuery = integrationsQuery\.in\('property_id', user\.propertyIds\)/.test(integrationState) &&
    /query = query\.in\('property_id', user\.propertyIds\)/.test(integrationState),
  `${integrationStatePath} must scope integration connections and events by assigned properties.`
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
  /'camera_snapshot\.received': 'Snapshot de camara recibido'/.test(auditPage) &&
    /organizationsQuery = organizationsQuery\.in\('id', auth\.user\.clientIds\)/.test(auditPage) &&
    /propertiesQuery = propertiesQuery\.in\('id', auth\.user\.propertyIds\)/.test(auditPage) &&
    /gatewaysQuery = gatewaysQuery\.in\('property_id', auth\.user\.propertyIds\)/.test(auditPage),
  `${auditPagePath} must scope audit lookup metadata and label camera snapshot evidence.`
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
assert(
  /action:\s*'camera_snapshot\.received'/.test(gatewayCameraSnapshotRoute) &&
    /actor_gateway_id:\s*gateway\.id/.test(gatewayCameraSnapshotRoute) &&
    /target_type:\s*'camera_snapshot'/.test(gatewayCameraSnapshotRoute),
  `${gatewayCameraSnapshotRoutePath} must audit private camera evidence uploads.`
)
assertNotContains(
  gatewayAutomationsRoute,
  [/return NextResponse\.json\(\{\s*success:\s*true,\s*data:\s*data \|\| \[\]\s*\}/, /config:\s*automation\.config/, /configuracionÃ/i, /ConfirmaciÃ/i, /instalaciÃ/i],
  gatewayAutomationsRoutePath
)

assert(
  /function canManageOrganization\(auth: Awaited<ReturnType<typeof getAuthorizedRequest>>, organizationId: string\)/.test(adminAutomationsRoute) &&
    /function canManageProperty\(auth: Awaited<ReturnType<typeof getAuthorizedRequest>>, propertyId: string\)/.test(adminAutomationsRoute),
  `${adminAutomationsRoutePath} must define explicit organization and property scope guards.`
)
assert(
  /auth\.user\.role !== 'admin'/.test(adminAutomationsRoute) &&
    /organizationsQuery = organizationsQuery\.in\('id', auth\.user\.clientIds\)/.test(adminAutomationsRoute) &&
    /automationsQuery = automationsQuery\.in\('property_id', auth\.user\.propertyIds\)/.test(adminAutomationsRoute),
  `${adminAutomationsRoutePath} must filter automation reads for non-admin users.`
)
assert(
  /!canManageOrganization\(auth, organizationId\)/.test(adminAutomationsRoute) &&
    /!canManageProperty\(auth, property\.id\)/.test(adminAutomationsRoute) &&
    /!canManageProperty\(auth, automation\.property_id\)/.test(adminAutomationsRoute),
  `${adminAutomationsRoutePath} must enforce scope on automation mutations.`
)
assertNotContains(
  adminAutomationsRoute,
  [/Comando invÃ/i, /enviÃ/i, /SimulaciÃ/i, /QuedarÃ/i],
  adminAutomationsRoutePath
)

console.log(JSON.stringify({
  ok: true,
  checkedAt: new Date().toISOString(),
  contracts: [
    'camera snapshot route proxies private image bytes',
    'camera snapshot component does not receive signed storage URLs',
    'camera stream frame route proxies private image bytes',
    'client provisioning is admin-only and audited',
    'admin dashboard counts are scoped by authenticated clients and properties',
    'admin clients page queries through authenticated scope',
    'admin project and evidence pages query through authenticated scope',
    'lead CRM updates are persisted in Supabase',
    'contact form qualifies leads before CRM follow-up',
    'legacy in-memory demo store is absent',
    'public signup remains closed and internal-only',
    'incident comments are explicit and audited',
    'incident operations are scoped by authenticated properties',
    'admin integrations use neutral visible labels',
    'integration dashboards are scoped by authenticated user',
    'client notifications are explicit and audited',
    'client portal renders activity and next actions',
    'device inventory assignments are audited',
    'audit page lookup metadata is scoped',
    'gateway camera evidence uploads are audited',
    'gateway config hides internal provider names',
    'gateway automation delivery uses sanitized parameters',
    'technician access is scoped to assigned clients and properties',
    'automation admin access is scoped by client and property',
  ],
}, null, 2))
