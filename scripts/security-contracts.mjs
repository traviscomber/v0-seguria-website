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
const adminDashboardPath = 'app/admin/page.tsx'
const adminClientsPath = 'app/admin/clientes/page.tsx'
const snapshotRoute = read(snapshotRoutePath)
const snapshotComponent = read(snapshotComponentPath)
const clientProvisionRoute = read(clientProvisionRoutePath)
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

console.log(JSON.stringify({
  ok: true,
  checkedAt: new Date().toISOString(),
  contracts: [
    'camera snapshot route proxies private image bytes',
    'camera snapshot component does not receive signed storage URLs',
    'client provisioning is admin-only and audited',
  ],
}, null, 2))
