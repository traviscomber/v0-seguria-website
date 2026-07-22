export const locales = ['es', 'en'] as const

export type Locale = (typeof locales)[number]

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export function localizedPath(locale: Locale, path = '/') {
  const cleanPath = path === '/' ? '' : path
  return `/${locale}${cleanPath}`
}

