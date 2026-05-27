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
  title: 'SegurIA | Infraestructura Inteligente para Campos y Propiedades',
  description: 'Conectamos tecnología. Protegemos lo que importa. Preparamos tu operación para crecer. Soluciones de seguridad e infraestructura inteligente.',
  keywords: ['seguridad', 'infraestructura inteligente', 'campos', 'propiedades', 'monitoreo', 'cámaras', 'sensores', 'IoT'],
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
