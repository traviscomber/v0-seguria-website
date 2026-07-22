import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, locales, type Locale } from '@/lib/locales'

const metadataByLocale: Record<Locale, Metadata> = {
  es: {
    title: 'SegurIA | Sistema integral de seguridad operativa',
    description:
      'SegurIA conecta camaras, sensores, accesos, eventos y respuesta para operar seguridad con claridad.',
    alternates: {
      canonical: 'https://seguria.tech/es',
      languages: {
        es: 'https://seguria.tech/es',
        en: 'https://seguria.tech/en',
      },
    },
    openGraph: {
      title: 'SegurIA | Sistema integral de seguridad operativa',
      description: 'Seguridad integral con evidencia, alertas utiles y respuesta clara.',
      url: 'https://seguria.tech/es',
      locale: 'es_CL',
    },
  },
  en: {
    title: 'SegurIA | Integrated Security Operations',
    description:
      'SegurIA connects cameras, sensors, access, events and response so security operations become clear.',
    alternates: {
      canonical: 'https://seguria.tech/en',
      languages: {
        es: 'https://seguria.tech/es',
        en: 'https://seguria.tech/en',
      },
    },
    openGraph: {
      title: 'SegurIA | Integrated Security Operations',
      description: 'Integrated security with evidence, useful alerts and clear response.',
      url: 'https://seguria.tech/en',
      locale: 'en_US',
    },
  },
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  return metadataByLocale[locale]
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return children
}

