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

const siteUrl = 'https://seguria.tech'
const siteTitle = 'SegurIA Chile | Sistemas de seguridad integral con inteligencia artificial'
const siteDescription =
  'Sistemas de seguridad integral en Chile para campos, empresas, hoteles, condominios y propiedades. Integramos cámaras, alarmas, sensores, control de acceso, monitoreo y automatización con inteligencia artificial.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | SegurIA Chile',
  },
  description: siteDescription,
  applicationName: 'SegurIA',
  authors: [{ name: 'SegurIA', url: siteUrl }],
  creator: 'SegurIA',
  publisher: 'SegurIA',
  category: 'Sistemas de seguridad integral',
  keywords: [
    'sistemas de seguridad Chile',
    'seguridad integral Chile',
    'empresa de seguridad tecnológica Chile',
    'seguridad electrónica Chile',
    'cámaras de seguridad Chile',
    'videovigilancia inteligente',
    'alarmas y sensores',
    'control de acceso',
    'monitoreo de seguridad',
    'inteligencia artificial para seguridad',
    'seguridad para campos',
    'seguridad para empresas',
    'seguridad para hoteles',
    'seguridad para condominios',
    'seguridad para propiedades',
    'automatización de seguridad',
    'gestión de incidentes',
    'SegurIA Chile',
  ],
  alternates: {
    canonical: '/',
    languages: {
      'es-CL': '/',
      'x-default': '/',
    },
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: 'SegurIA Chile',
    locale: 'es_CL',
    type: 'website',
    countryName: 'Chile',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  other: {
    'geo.region': 'CL',
    'geo.placename': 'Chile',
    'content-language': 'es-CL',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'SegurIA Chile',
        alternateName: ['SegurIA', 'Segur IA'],
        description: siteDescription,
        inLanguage: 'es-CL',
        publisher: { '@id': `${siteUrl}/#organization` },
      },
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': `${siteUrl}/#organization`,
        name: 'SegurIA',
        alternateName: ['SegurIA Chile', 'Segur IA'],
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description: siteDescription,
        foundingDate: '2024',
        areaServed: {
          '@type': 'Country',
          name: 'Chile',
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'CL',
          addressRegion: 'Región Metropolitana',
          addressLocality: 'Santiago',
        },
        knowsAbout: [
          'Sistemas de seguridad integral',
          'Seguridad electrónica',
          'Videovigilancia',
          'Cámaras de seguridad',
          'Alarmas y sensores',
          'Control de acceso',
          'Monitoreo de seguridad',
          'Automatización',
          'Inteligencia artificial aplicada a seguridad',
          'Gestión de incidentes',
        ],
        sameAs: ['https://segur-ia.cl'],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          availableLanguage: ['es'],
          areaServed: 'CL',
          url: `${siteUrl}/contacto`,
        },
      },
      {
        '@type': 'Service',
        '@id': `${siteUrl}/#service`,
        name: 'Sistemas de seguridad integral con inteligencia artificial',
        serviceType: 'Diseño, integración y operación de sistemas de seguridad integral',
        provider: { '@id': `${siteUrl}/#organization` },
        areaServed: {
          '@type': 'Country',
          name: 'Chile',
        },
        audience: [
          { '@type': 'BusinessAudience', audienceType: 'Empresas' },
          { '@type': 'BusinessAudience', audienceType: 'Campos y agroindustria' },
          { '@type': 'BusinessAudience', audienceType: 'Hoteles' },
          { '@type': 'BusinessAudience', audienceType: 'Condominios y propiedades' },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Soluciones de seguridad integral',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cámaras y videovigilancia inteligente' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Alarmas, sensores y detección de eventos' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Control de acceso y protección perimetral' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Monitoreo, automatización y respuesta a incidentes' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Integración de sistemas existentes con inteligencia artificial' } },
          ],
        },
      },
    ],
  }

  return (
    <html lang="es-CL" className="bg-[#0A1B2E]">
      <head>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${montserrat.className} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
