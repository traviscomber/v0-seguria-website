/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.vercel.app https://inaturalist-open-data.s3.amazonaws.com https://tile.openstreetmap.org https://*.tile.opentopomap.org https://server.arcgisonline.com",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "media-src 'self' blob: https:",
      "worker-src 'self' blob:",
      'upgrade-insecure-requests',
    ].join('; '),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'inaturalist-open-data.s3.amazonaws.com',
      },
    ],
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
      {
        source: '/',
        destination: '/es',
        permanent: false,
      },
      {
        source: '/soluciones',
        destination: '/es/soluciones',
        permanent: false,
      },
      {
        source: '/campos-inteligentes',
        destination: '/es/campos-inteligentes',
        permanent: false,
      },
      {
        source: '/propiedades-inteligentes',
        destination: '/es/propiedades-inteligentes',
        permanent: false,
      },
      {
        source: '/hoteleria-inteligente',
        destination: '/es/hoteleria-inteligente',
        permanent: false,
      },
      {
        source: '/integraciones',
        destination: '/es/integraciones',
        permanent: false,
      },
      {
        source: '/contacto',
        destination: '/es/contacto',
        permanent: false,
      },
      {
        source: '/casas-inteligentes',
        destination: '/es/propiedades-inteligentes',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.n3uralia.com' }],
        destination: 'https://n3uralia.com/:path*',
        permanent: true,
      },
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
