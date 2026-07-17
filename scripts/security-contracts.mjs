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
const snapshotRoute = read(snapshotRoutePath)
const snapshotComponent = read(snapshotComponentPath)

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

console.log(JSON.stringify({
  ok: true,
  checkedAt: new Date().toISOString(),
  contracts: [
    'camera snapshot route proxies private image bytes',
    'camera snapshot component does not receive signed storage URLs',
  ],
}, null, 2))
