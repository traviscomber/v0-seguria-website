'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { localizedPath, type Locale } from '@/lib/locales'
import { marketing } from '@/lib/marketing-content'

export function LocaleNavigation({ locale }: { locale: Locale }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const copy = marketing[locale]
  const otherLocale = locale === 'es' ? 'en' : 'es'
  const otherPath = pathname.replace(/^\/(es|en)/, `/${otherLocale}`)

  const links = [
    { href: localizedPath(locale, '/soluciones'), label: copy.nav.solutions },
    { href: localizedPath(locale, '/preguntas-frecuentes'), label: locale === 'es' ? 'Preguntas frecuentes' : 'FAQ' },
    { href: '/app', label: copy.nav.portal },
  ]

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0A1B2E]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={localizedPath(locale)} className="flex items-center">
            <img src="/seguria-logo.png" alt="SegurIA" className="h-12 w-[220px] object-contain object-left" />
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
            <Link href={otherPath} className="rounded-full border border-white/15 px-3 py-2 text-xs text-white/60 transition-colors hover:text-white">
              {copy.nav.language}
            </Link>
            <Link href={localizedPath(locale, '/contacto')} className="btn-primary px-6 py-2 text-sm">
              {copy.nav.contact}
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="text-white md:hidden" aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="space-y-2 pb-4 md:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm text-white/70 transition-colors hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href={otherPath} className="block px-4 py-2 text-sm text-white/70" onClick={() => setIsOpen(false)}>
              {copy.nav.language}
            </Link>
            <Link href={localizedPath(locale, '/contacto')} className="btn-primary block px-4 py-2 text-sm" onClick={() => setIsOpen(false)}>
              {copy.nav.contact}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
