import { notFound } from 'next/navigation'
import { PublicSolutionsPage } from '@/components/marketing/public-pages'
import { getMarketingPageMetadata } from '@/lib/marketing-page-metadata'
import { isLocale, type Locale } from '@/lib/locales'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return getMarketingPageMetadata(locale as Locale, 'solutions')
}

export default async function LocaleSolutionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return <PublicSolutionsPage locale={locale as Locale} />
}
