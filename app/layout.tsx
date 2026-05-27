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
  metadataBase: new URL('https://v0-seguria-website.vercel.app'),
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
    canonical: '/',
  },
  openGraph: {
    title: 'SegurIA | Infraestructura Inteligente para Campos y Propiedades',
    description:
      'Conectamos tecnologia. Protegemos lo que importa. Soluciones de seguridad e infraestructura inteligente para campos y propiedades.',
    url: '/',
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
  return (
    <html lang="es" className="bg-[#0A1B2E]">
      <body className={`${montserrat.className} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
