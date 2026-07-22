import { notFound } from 'next/navigation'
import { PublicDetailPage } from '@/components/marketing/public-pages'
import { isLocale, type Locale } from '@/lib/locales'

export default async function LocaleHospitalityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return <PublicDetailPage locale={locale as Locale} routeKey="hospitality" />
}

