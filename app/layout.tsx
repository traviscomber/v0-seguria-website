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
    default: 'SegurIA | Plataforma de seguridad para campos y propiedades',
    template: '%s | SegurIA',
  },
  description:
    'SegurIA unifica operacion, evidencia y respuesta para propiedades y operaciones multiempresa, sin exponer el stack tecnico al cliente.',
  keywords: [
    'seguridad',
    'plataforma de seguridad',
    'campos',
    'propiedades',
    'operacion',
    'camaras',
    'sensores',
    'incidentes',
    'automatizacion',
  ],
  alternates: {
    canonical: 'https://seguria.tech',
  },
  openGraph: {
    title: 'SegurIA | Plataforma de seguridad para campos y propiedades',
    description:
      'SegurIA entrega una experiencia clara para operar seguridad, evidencia e incidentes sin mostrar la tecnologia subyacente.',
    url: 'https://seguria.tech',
    siteName: 'SegurIA',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SegurIA | Plataforma de seguridad para campos y propiedades',
    description:
      'Una plataforma clara para seguridad, evidencia, automatizacion y operacion multiempresa.',
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
    description: 'Plataforma de seguridad para campos y propiedades',
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
          suppressHydrationWarning
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
