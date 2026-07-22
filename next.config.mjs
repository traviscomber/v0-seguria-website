/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    ],
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
      // Redirect www to non-www (n3uralia.com)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.n3uralia.com' }],
        destination: 'https://n3uralia.com/:path*',
        permanent: true,
      },
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
