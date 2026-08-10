import { notFound } from 'next/navigation'
import { PublicContactPage } from '@/components/marketing/public-pages'
import { getMarketingPageMetadata } from '@/lib/marketing-page-metadata'
import { isLocale, type Locale } from '@/lib/locales'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return getMarketingPageMetadata(locale as Locale, 'contact')
}

export default async function LocaleContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return <PublicContactPage locale={locale as Locale} />
}
