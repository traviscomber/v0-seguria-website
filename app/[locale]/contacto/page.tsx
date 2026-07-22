import { notFound } from 'next/navigation'
import { PublicContactPage } from '@/components/marketing/public-pages'
import { isLocale, type Locale } from '@/lib/locales'

export default async function LocaleContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return <PublicContactPage locale={locale as Locale} />
}

