import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://seguria.tech'),
  title: {
    default: 'SegurIA | Infraestructura Inteligente para Campos y Propiedades',
    template: '%s | SegurIA',
  },
  description:
    'Conectamos tecnologia. Protegemos lo que importa. Preparamos tu operacion para crecer con soluciones de seguridad e infraestructura inteligente.',
  keywords: [
    'seguridad',
    'infraestructura inteligente',
    'campos',
    'propiedades',
    'monitoreo',
    'camaras',
    'sensores',
    'IoT',
  ],
  alternates: {
    canonical: 'https://seguria.tech',
  },
  openGraph: {
    title: 'SegurIA | Infraestructura Inteligente para Campos y Propiedades',
    description:
      'Conectamos tecnologia. Protegemos lo que importa. Soluciones de seguridad e infraestructura inteligente para campos y propiedades.',
    url: 'https://seguria.tech',
    siteName: 'SegurIA',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SegurIA | Infraestructura Inteligente para Campos y Propiedades',
    description:
      'Conectamos tecnologia. Protegemos lo que importa. Soluciones de seguridad e infraestructura inteligente.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SegurIA',
    alternateName: 'Segur IA',
    url: 'https://seguria.tech',
    sameAs: ['https://segur-ia.cl'],
    description: 'Infraestructura inteligente para campos y propiedades',
    foundingDate: '2024',
    areaServed: 'CL',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: 'https://seguria.tech/contacto',
    },
  }

  return (
    <html lang="es" className="bg-[#0A1B2E]">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${montserrat.className} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
