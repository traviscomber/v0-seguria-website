import { notFound } from 'next/navigation'
import { PublicIntegrationsPage } from '@/components/marketing/public-pages'
import { isLocale, type Locale } from '@/lib/locales'

export default async function LocaleIntegrationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return <PublicIntegrationsPage locale={locale as Locale} />
}

