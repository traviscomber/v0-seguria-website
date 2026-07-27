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
  Trees,
  UserRound,
  Wheat,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { ClientTheme } from '@/lib/client-theme'
import { cn } from '@/lib/utils'

export function ClientPortalShell({
  children,
  userName,
  userRole,
  theme,
}: {
  children: React.ReactNode
  userName: string
  userRole: string
  theme: ClientTheme
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeHash, setActiveHash] = useState('')

  const navItems = useMemo(() => {
    const propertiesLabel = theme.key === 'huilo-huilo' ? 'Espacios' : theme.key === 'santa-elena' ? 'Predios' : 'Propiedades'
    const PropertiesIcon = theme.key === 'huilo-huilo' ? Trees : theme.key === 'santa-elena' ? Wheat : Building2

    return [
      { href: '/app', label: 'Resumen', icon: Home },
      { href: '/app#propiedades', label: propertiesLabel, icon: PropertiesIcon },
      { href: '/app#incidentes', label: 'Incidentes', icon: Siren },
      { href: '/app#camaras', label: 'Vigilancia', icon: Camera },
      { href: '/app#actividad', label: 'Actividad', icon: BellRing },
      { href: '/es/contacto', label: 'Soporte', icon: Headphones },
    ]
  }, [theme.key])

  const quickLinks = useMemo(() => [
    {
      label: 'Estado general',
      value: `Resumen de la ${theme.vocabulary.operation}`,
      href: '/app',
    },
    {
      label: `Revisar ${theme.vocabulary.properties}`,
      value: theme.key === 'huilo-huilo' ? 'Hoteles, senderos y zonas críticas' : theme.key === 'santa-elena' ? 'Ganado, ordeña y maquinaria' : 'Cámaras, sensores y actividad',
      href: '/app#propiedades',
    },
    {
      label: 'Ver prioridades',
      value: `Alertas e incidentes de ${theme.vocabulary.priority}`,
      href: '/app#incidentes',
    },
    {
      label: 'Solicitar ayuda',
      value: 'Contacto directo con SegurIA',
      href: '/es/contacto',
    },
  ], [theme])

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
    <div className="min-h-screen text-white" style={{ backgroundColor: theme.pageBackground }}>
      <header className={`sticky top-0 z-40 border-b border-white/10 ${theme.cardClass} backdrop-blur-2xl`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/app" className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] ${theme.accentTextClass}`}>
              {theme.key === 'huilo-huilo' ? <Trees className="h-5 w-5" /> : theme.key === 'santa-elena' ? <Wheat className="h-5 w-5" /> : <Home className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">Portal de clientes</p>
              <p className="mt-0.5 text-sm font-medium text-white">{theme.name}</p>
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
                    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-all',
                    active ? `bg-white/10 text-white shadow-sm ${theme.accentTextClass}` : 'text-white/60 hover:bg-white/5 hover:text-white'
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
              <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] ${theme.accentTextClass}`}>
                <UserRound className="h-4 w-4" />
              </span>
              <div className="min-w-0 text-right">
                <p className="max-w-40 truncate text-sm text-white">{userName}</p>
                <p className="text-xs text-white/45">{userRole === 'client' ? theme.vocabulary.operation : userRole}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout} disabled={loggingOut} className="hidden border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white md:inline-flex">
              <LogOut className="h-4 w-4" />
              {loggingOut ? 'Cerrando...' : 'Salir'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white lg:hidden"
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
                      active ? `bg-white/10 text-white ${theme.accentTextClass}` : 'text-white/70 hover:bg-white/5 hover:text-white'
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

      <section className={`border-b border-white/10 ${theme.cardClass} backdrop-blur-xl`}>
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:px-6 lg:grid-cols-[1.05fr_1.95fr] lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3">
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 rounded-full border border-white/10 bg-white/[0.06] p-2 ${theme.accentTextClass}`}>
                <Home className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <div>
                <p className={`text-[11px] uppercase tracking-[0.22em] ${theme.accentTextClass}`}>{theme.badge}</p>
                <p className="mt-1 text-sm text-white">{userName}</p>
                <p className="mt-1 text-xs leading-5 text-white/55">
                  {theme.description}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
              >
                <p className={`text-[11px] uppercase tracking-[0.2em] text-white/45 group-hover:${theme.accentTextClass}`}>
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
