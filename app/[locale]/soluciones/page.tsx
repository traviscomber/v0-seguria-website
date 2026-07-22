import { notFound } from 'next/navigation'
import { PublicSolutionsPage } from '@/components/marketing/public-pages'
import { isLocale, type Locale } from '@/lib/locales'

export default async function LocaleSolutionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return <PublicSolutionsPage locale={locale as Locale} />
}

