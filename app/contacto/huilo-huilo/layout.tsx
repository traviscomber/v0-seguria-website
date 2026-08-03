import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ayuda Huilo Huilo | Portal SegurIA',
  description: 'Canal privado de soporte operativo para la Reserva Biológica Huilo Huilo.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  alternates: {
    canonical: 'https://seguria.tech/contacto/huilo-huilo',
  },
  openGraph: {
    title: 'Ayuda Huilo Huilo | Portal SegurIA',
    description: 'Canal privado de soporte operativo para Huilo Huilo.',
    url: 'https://seguria.tech/contacto/huilo-huilo',
    type: 'website',
  },
}

export default function HuiloHuiloSupportLayout({ children }: { children: React.ReactNode }) {
  return children
}
