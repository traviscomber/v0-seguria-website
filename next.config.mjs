/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  async redirects() {
    return [
      // Domain consolidation: segur-ia.cl → seguria.tech (301 permanent redirect)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'segur-ia.cl' }],
        destination: 'https://seguria.tech/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
