'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BellRing,
  Building2,
  Camera,
  Headphones,
  Home,
  LogOut,
  Menu,
  Siren,
  UserRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app', label: 'Resumen', icon: Home },
  { href: '/app#propiedades', label: 'Propiedades', icon: Building2 },
  { href: '/app#incidentes', label: 'Incidentes', icon: Siren },
  { href: '/app#camaras', label: 'Cámaras', icon: Camera },
  { href: '/app#actividad', label: 'Actividad', icon: BellRing },
  { href: '/es/contacto', label: 'Soporte', icon: Headphones },
]

const quickLinks = [
  {
    label: 'Estado general',
    value: 'Propiedades, alertas e incidentes',
    href: '/app',
  },
  {
    label: 'Revisar propiedades',
    value: 'Cámaras, sensores y actividad',
    href: '/app#propiedades',
  },
  {
    label: 'Ver pendientes',
    value: 'Alertas e incidentes abiertos',
    href: '/app#incidentes',
  },
  {
    label: 'Solicitar ayuda',
    value: 'Contacto directo con SegurIA',
    href: '/es/contacto',
  },
]

export function ClientPortalShell({
  children,
  userName,
  userRole,
}: {
  children: React.ReactNode
  userName: string
  userRole: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeHash, setActiveHash] = useState('')

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash)
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [pathname])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.replace('/login')
      router.refresh()
    }
  }

  const isNavActive = (href: string) => {
    if (href === '/app') return pathname === '/app' && !activeHash
    if (href === '/app#propiedades') {
      return pathname.startsWith('/app/properties') || (pathname === '/app' && activeHash === '#propiedades')
    }
    if (href.startsWith('/app#')) {
      return pathname === '/app' && activeHash === href.slice('/app'.length)
    }
    return pathname === href
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(77,163,217,0.18),_transparent_28%),linear-gradient(180deg,#081624_0%,#0A1B2E_100%)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#081624]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/app" className="flex items-center gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Portal de clientes</p>
              <img
                src="/seguria-logo.png"
                alt="SegurIA"
                className="mt-1 h-7 w-[126px] rounded-[4px] object-contain object-left"
              />
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación del portal">
            {navItems.map((item) => {
              const active = isNavActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors',
                    active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.8} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4DA3D9]/15 text-[#9DD2F2]">
                <UserRound className="h-4 w-4" />
              </span>
              <div className="min-w-0 text-right">
                <p className="max-w-40 truncate text-sm text-white">{userName}</p>
                <p className="text-xs text-white/45">{userRole === 'client' ? 'Cliente' : userRole}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout} disabled={loggingOut} className="hidden md:inline-flex">
              <LogOut className="h-4 w-4" />
              {loggingOut ? 'Cerrando...' : 'Salir'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 px-4 py-4 lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {navItems.map((item) => {
                const active = isNavActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                      active ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-left text-sm text-white/70"
              >
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'Cerrando...' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        )}
      </header>

      <section className="border-b border-white/10 bg-[#081624]/55 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:px-6 lg:grid-cols-[1.05fr_1.95fr] lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 rounded-full border border-[#4DA3D9]/40 bg-[#4DA3D9]/12 p-2 text-[#9FDBFF]">
                <Home className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#9FDBFF]">Tu seguridad</p>
                <p className="mt-1 text-sm text-white">{userName}</p>
                <p className="mt-1 text-xs leading-5 text-white/55">
                  Revisa lo importante, entra a tus propiedades y solicita ayuda cuando la necesites.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition-colors hover:border-[#4DA3D9]/45 hover:bg-[#4DA3D9]/10"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/45 group-hover:text-[#9FDBFF]">
                  {item.label}
                </p>
                <p className="mt-2 text-sm leading-5 text-white/78">{item.value}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
