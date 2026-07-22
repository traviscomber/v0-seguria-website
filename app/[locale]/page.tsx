import { notFound } from 'next/navigation'
import { PublicHomePage } from '@/components/marketing/public-pages'
import { isLocale, locales, type Locale } from '@/lib/locales'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return <PublicHomePage locale={locale as Locale} />
}

