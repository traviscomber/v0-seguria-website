import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { localizedPath, type Locale } from '@/lib/locales'
import { marketing } from '@/lib/marketing-content'

export function LocaleFooter({ locale }: { locale: Locale }) {
  const copy = marketing[locale].footer

  return (
    <footer className="border-t border-white/10 bg-[#051017]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-12 grid gap-12 md:grid-cols-4">
          <div>
            <div className="mb-5">
              <img src="/seguria-logo.png" alt="SegurIA" className="h-12 w-[220px] object-contain object-left" />
            </div>
            <p className="text-sm leading-relaxed text-white/50">{copy.description}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-light text-white">{copy.solutions}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={localizedPath(locale, '/soluciones')} className="text-sm text-white/50 transition-colors hover:text-white">
                  {copy.seeSolution}
                </Link>
              </li>
              <li>
                <Link href="/app" className="text-sm text-white/50 transition-colors hover:text-white">
                  {copy.clientPortal}
                </Link>
              </li>
              <li>
                <Link href={localizedPath(locale, '/contacto')} className="text-sm text-white/50 transition-colors hover:text-white">
                  {copy.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-light text-white">{copy.company}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={localizedPath(locale, '/soluciones')} className="text-sm text-white/50 transition-colors hover:text-white">
                  {copy.platform}
                </Link>
              </li>
              <li>
                <Link href={localizedPath(locale, '/contacto')} className="text-sm text-white/50 transition-colors hover:text-white">
                  {copy.askAdvice}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-light text-white">{copy.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#4DA3D9]" />
                <a href="mailto:contacto@seguria.tech" className="text-sm text-white/50 transition-colors hover:text-white">
                  contacto@seguria.tech
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#4DA3D9]" />
                <a href="tel:+56912345678" className="text-sm text-white/50 transition-colors hover:text-white">
                  +56 9 1234 5678
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-[#4DA3D9]" />
                <span className="text-sm text-white/50">Santiago, Chile</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/40">{copy.rights}</p>
          <p className="text-sm text-white/35">{copy.line}</p>
        </div>
      </div>
    </footer>
  )
}

