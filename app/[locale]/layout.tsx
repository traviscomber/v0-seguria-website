import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, locales, type Locale } from '@/lib/locales'

const metadataByLocale: Record<Locale, Metadata> = {
  es: {
    title: { absolute: 'SegurIA Security Suite | Seguridad, operación, Vision y Edge' },
    description:
      'SegurIA es una Security Suite para seguridad física y operación: cámaras, sensores, infraestructura, incidentes, evidencia, Vision, Edge y automatización. Powered by N3uralia.',
    alternates: {
      canonical: 'https://seguria.tech/es',
      languages: {
        'es-CL': 'https://seguria.tech/es',
        en: 'https://seguria.tech/en',
        'x-default': 'https://seguria.tech/es',
      },
    },
    openGraph: {
      title: 'SegurIA Security Suite | Seguridad, operación, Vision y Edge',
      description: 'Security Suite para unificar infraestructura, incidentes, evidencia, Vision y Edge en una sola operación. Powered by N3uralia.',
      url: 'https://seguria.tech/es',
      locale: 'es_CL',
      siteName: 'SegurIA Security Suite',
      type: 'website',
    },
  },
  en: {
    title: { absolute: 'SegurIA Security Suite | Security Operations, Vision and Edge' },
    description:
      'SegurIA is a Security Suite for physical security and operations: cameras, sensors, infrastructure, incidents, evidence, Vision, Edge and automation. Powered by N3uralia.',
    alternates: {
      canonical: 'https://seguria.tech/en',
      languages: {
        'es-CL': 'https://seguria.tech/es',
        en: 'https://seguria.tech/en',
        'x-default': 'https://seguria.tech/es',
      },
    },
    openGraph: {
      title: 'SegurIA Security Suite | Security Operations, Vision and Edge',
      description: 'A Security Suite that unifies infrastructure, incidents, evidence, Vision and Edge into one operational system. Powered by N3uralia.',
      url: 'https://seguria.tech/en',
      locale: 'en_US',
      siteName: 'SegurIA Security Suite',
      type: 'website',
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
