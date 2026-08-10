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
const n3uraliaUrl = 'https://www.n3uralia.com'
const legacyChileUrl = 'https://segur-ia.cl'
const siteTitle = 'SegurIA Security Suite | Seguridad, operación, Vision y Edge'
const siteDescription =
  'SegurIA es una Security Suite para seguridad física y operación: centro de control, infraestructura, incidentes, evidencia, Vision, Edge, cámaras, sensores, gateways y automatización. Powered by N3uralia.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | SegurIA Security Suite',
  },
  description: siteDescription,
  applicationName: 'SegurIA Security Suite',
  authors: [
    { name: 'SegurIA', url: siteUrl },
    { name: 'N3uralia', url: n3uraliaUrl },
  ],
  creator: 'SegurIA',
  publisher: 'SegurIA',
  category: 'Security Suite, seguridad física y operaciones',
  keywords: [
    'Security Suite Chile',
    'SegurIA Security Suite',
    'plataforma de seguridad física',
    'centro de control de seguridad',
    'gestión de incidentes de seguridad',
    'evidencia operacional',
    'videovigilancia inteligente',
    'cámaras de seguridad Chile',
    'alarmas y sensores',
    'control de acceso',
    'monitoreo de seguridad',
    'inteligencia artificial para seguridad',
    'Vision AI seguridad',
    'Edge AI seguridad',
    'gateways de seguridad',
    'automatización de seguridad',
    'seguridad multiempresa',
    'seguridad para campos',
    'seguridad para empresas',
    'seguridad para hoteles',
    'seguridad para condominios',
    'seguridad Santiago',
    'seguridad Valdivia',
    'seguridad sur de Chile',
    'seguridad Los Ríos',
    'conectividad para seguridad',
    'N3uralia',
    'SegurIA powered by N3uralia',
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
    siteName: 'SegurIA Security Suite',
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
  verification: {
    google: 'NUUN_I0qEnav-wABWmdFEV2i7NDEiDRe28f7nUSe-oE',
  },
  other: {
    'geo.region': 'CL',
    'geo.placename': 'Chile',
    'content-language': 'es-CL',
    'powered-by': 'N3uralia',
    'technology-provider': n3uraliaUrl,
    'product-category': 'Security Suite',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const chileServiceAreas = [
    { '@type': 'Country', name: 'Chile' },
    { '@type': 'AdministrativeArea', name: 'Región Metropolitana de Santiago' },
    { '@type': 'AdministrativeArea', name: 'Región de La Araucanía' },
    { '@type': 'AdministrativeArea', name: 'Región de Los Ríos' },
    { '@type': 'AdministrativeArea', name: 'Región de Los Lagos' },
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${n3uraliaUrl}/#organization`,
        name: 'N3uralia',
        url: n3uraliaUrl,
        description: 'Tecnología, motores de inteligencia artificial, automatización y sistemas inteligentes aplicados a productos digitales y operaciones.',
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'SegurIA Security Suite',
        alternateName: ['SegurIA', 'SegurIA Chile', 'Segur IA'],
        description: siteDescription,
        inLanguage: 'es-CL',
        publisher: { '@id': `${siteUrl}/#organization` },
        mentions: { '@id': `${n3uraliaUrl}/#organization` },
      },
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': `${siteUrl}/#organization`,
        name: 'SegurIA',
        alternateName: ['SegurIA Security Suite', 'SegurIA Chile', 'Segur IA'],
        url: siteUrl,
        logo: `${siteUrl}/seguria-logo.png`,
        description: siteDescription,
        foundingDate: '2024',
        telephone: '+56928003961',
        email: 'info@seguria.tech',
        areaServed: chileServiceAreas,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Av. Vitacura 3439, Of. 602',
          addressCountry: 'CL',
          addressRegion: 'Región Metropolitana',
          addressLocality: 'Vitacura',
        },
        location: [
          {
            '@type': 'Place',
            name: 'SegurIA — Base operacional Santiago',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Av. Vitacura 3439, Of. 602',
              addressCountry: 'CL',
              addressRegion: 'Región Metropolitana',
              addressLocality: 'Vitacura',
            },
          },
          {
            '@type': 'Place',
            name: 'SegurIA — Sucursal sur de Chile',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'CL',
              addressRegion: 'Región de Los Ríos',
              addressLocality: 'Valdivia',
            },
          },
        ],
        knowsAbout: [
          'Security Suite',
          'Centro de control de seguridad',
          'Infraestructura de seguridad',
          'Gestión de incidentes',
          'Evidencia operacional',
          'Videovigilancia y analítica de video',
          'Vision AI aplicada a seguridad',
          'Edge processing para cámaras',
          'Cámaras, sensores y gateways',
          'Alarmas y control de acceso',
          'Monitoreo de seguridad',
          'Automatización e inteligencia artificial aplicada a seguridad',
          'Redes y conectividad para operaciones de seguridad',
        ],
        sameAs: [legacyChileUrl],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          telephone: '+56928003961',
          email: 'info@seguria.tech',
          availableLanguage: ['es'],
          areaServed: 'CL',
          url: `${siteUrl}/es/contacto`,
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/#security-suite`,
        name: 'SegurIA Security Suite',
        alternateName: 'SegurIA',
        applicationCategory: 'SecurityApplication',
        applicationSubCategory: 'Security Operations Suite',
        operatingSystem: 'Web',
        url: siteUrl,
        description: siteDescription,
        brand: {
          '@type': 'Brand',
          name: 'SegurIA',
          url: siteUrl,
        },
        provider: { '@id': `${siteUrl}/#organization` },
        mentions: { '@id': `${n3uraliaUrl}/#organization` },
        featureList: [
          'Centro de Control',
          'Infraestructura',
          'Incidentes',
          'Evidencia',
          'Vision',
          'Edge',
          'Multiempresa y control de acceso',
          'Gateways, cámaras y sensores',
          'Automatización y trazabilidad operacional',
        ],
      },
      {
        '@type': 'Service',
        '@id': `${siteUrl}/#service`,
        name: 'SegurIA Security Suite',
        serviceType: 'Suite de seguridad física, operación, monitoreo, evidencia, Vision y Edge',
        provider: { '@id': `${siteUrl}/#organization` },
        areaServed: chileServiceAreas,
        audience: [
          { '@type': 'BusinessAudience', audienceType: 'Empresas' },
          { '@type': 'BusinessAudience', audienceType: 'Campos y agroindustria' },
          { '@type': 'BusinessAudience', audienceType: 'Hoteles' },
          { '@type': 'BusinessAudience', audienceType: 'Condominios y propiedades' },
          { '@type': 'BusinessAudience', audienceType: 'Operaciones rurales y remotas' },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'SegurIA Security Suite',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Centro de Control' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Infraestructura de seguridad' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Gestión de incidentes' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Evidencia operacional' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Vision y análisis visual' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Edge y procesamiento local' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cámaras, sensores, gateways y conectividad' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Automatización y respuesta operacional' } },
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
        <footer className="border-t border-white/10 bg-[#071521] px-4 py-5 text-center text-xs text-white/45">
          Powered by{' '}
          <a
            href={n3uraliaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            N3uralia
          </a>
        </footer>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
