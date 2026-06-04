import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
      // Redirect www to non-www (n3uralia.com)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.n3uralia.com' }],
        destination: 'https://n3uralia.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
