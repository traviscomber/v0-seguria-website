import { notFound } from 'next/navigation'
import { PublicIntegrationsPage } from '@/components/marketing/public-pages'
import { getMarketingPageMetadata } from '@/lib/marketing-page-metadata'
import { isLocale, type Locale } from '@/lib/locales'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return getMarketingPageMetadata(locale as Locale, 'integrations')
}

export default async function LocaleIntegrationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return <PublicIntegrationsPage locale={locale as Locale} />
}
