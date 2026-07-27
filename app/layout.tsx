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
const siteTitle = 'SegurIA Chile | Seguridad integral, cámaras, redes e IA'
const siteDescription =
  'Diseñamos e instalamos sistemas de seguridad integral en Chile: cámaras, alarmas, sensores, control de acceso, redes, conectividad satelital de alta velocidad y analítica con inteligencia artificial.'

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
  category: 'Sistemas de seguridad integral y conectividad',
  keywords: [
    'sistemas de seguridad Chile',
    'seguridad integral Chile',
    'instalación de cámaras de seguridad',
    'instalación de sistemas de seguridad',
    'empresa de seguridad tecnológica Chile',
    'seguridad electrónica Chile',
    'cámaras de seguridad Chile',
    'videovigilancia inteligente',
    'alarmas y sensores',
    'control de acceso',
    'monitoreo de seguridad',
    'inteligencia artificial para seguridad',
    'reconocimiento de personas vehículos y animales',
    'conectividad satelital Chile',
    'internet satelital de alta velocidad',
    'instalación Starlink Chile',
    'redes para cámaras de seguridad',
    'redes inalámbricas rurales',
    'infraestructura de telecomunicaciones',
    'seguridad para campos',
    'seguridad para empresas',
    'seguridad para hoteles',
    'seguridad para condominios',
    'automatización de seguridad',
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
  verification: {
    google: 'NUUN_I0qEnav-wABWmdFEV2i7NDEiDRe28f7nUSe-oE',
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
        telephone: '+56928003961',
        email: 'info@seguria.tech',
        areaServed: {
          '@type': 'Country',
          name: 'Chile',
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Av. Vitacura 3439, Of. 602',
          addressCountry: 'CL',
          addressRegion: 'Región Metropolitana',
          addressLocality: 'Vitacura',
        },
        knowsAbout: [
          'Diseño e instalación de sistemas de seguridad integral',
          'Instalación de cámaras de seguridad',
          'Seguridad electrónica',
          'Videovigilancia y analítica de video',
          'Reconocimiento de personas, vehículos, objetos y animales',
          'Alarmas y sensores',
          'Control de acceso',
          'Monitoreo de seguridad',
          'Redes cableadas e inalámbricas',
          'Conectividad satelital de alta velocidad',
          'Integración de soluciones Starlink',
          'Infraestructura tecnológica para zonas rurales y remotas',
          'Automatización e inteligencia artificial aplicada a seguridad',
        ],
        sameAs: ['https://segur-ia.cl'],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          telephone: '+56928003961',
          email: 'info@seguria.tech',
          availableLanguage: ['es'],
          areaServed: 'CL',
          url: `${siteUrl}/contacto`,
        },
      },
      {
        '@type': 'Service',
        '@id': `${siteUrl}/#service`,
        name: 'Sistemas integrales de seguridad, conectividad e inteligencia artificial',
        serviceType: 'Diseño, instalación, integración y operación de seguridad, redes y conectividad',
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
          { '@type': 'BusinessAudience', audienceType: 'Operaciones rurales y remotas' },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Soluciones integrales SegurIA',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Diseño e instalación de cámaras y videovigilancia' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Analítica de video y reconocimiento de objetos con IA' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Alarmas, sensores y detección de eventos' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Control de acceso y protección perimetral' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Diseño e instalación de redes cableadas e inalámbricas' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Conectividad satelital de alta velocidad e integración de Starlink' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Monitoreo, automatización y respuesta a incidentes' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Modernización de infraestructura existente' } },
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
