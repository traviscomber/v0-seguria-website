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
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
    const spacesLabel = theme.key === 'huilo-huilo' ? 'Espacios' : theme.key === 'santa-elena' ? 'Predios' : 'Propiedades'
    const SpacesIcon = theme.key === 'huilo-huilo' ? Trees : theme.key === 'santa-elena' ? Wheat : Building2

    return [
      { href: '/app', label: 'Resumen', icon: Home },
      { href: '/app#propiedades', label: spacesLabel, icon: SpacesIcon },
      { href: '/app#incidentes', label: 'Prioridades', icon: Siren },
      { href: '/app#camaras', label: 'Vigilancia', icon: Camera },
      { href: '/app#actividad', label: 'Actividad', icon: BellRing },
    ]
  }, [theme.key])

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash)
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [pathname])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname, activeHash])

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

  const PortalIcon = theme.key === 'huilo-huilo' ? Trees : theme.key === 'santa-elena' ? Wheat : Home
  const accountLabel = userRole === 'client' ? theme.vocabulary.operation : userRole

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: theme.pageBackground }}>
      <header className={cn('sticky top-0 z-50 border-b border-white/10 backdrop-blur-2xl', theme.cardClass)}>
        <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/app" className="flex min-w-0 shrink-0 items-center gap-3" aria-label={`Ir al resumen de ${theme.name}`}>
            <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]', theme.accentTextClass)}>
              <PortalIcon className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block text-[9px] uppercase tracking-[0.24em] text-white/35">Portal SegurIA</span>
              <span className="mt-0.5 block max-w-44 truncate text-sm font-medium text-white">{theme.name}</span>
            </span>
          </Link>

          <div className="hidden h-8 w-px shrink-0 bg-white/10 lg:block" />

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex" aria-label="Navegación principal del portal">
            {navItems.map((item) => {
              const active = isNavActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex h-10 items-center gap-2 rounded-xl px-3 text-[13px] transition-colors',
                    active
                      ? 'bg-white/[0.09] text-white'
                      : 'text-white/55 hover:bg-white/[0.05] hover:text-white'
                  )}
                >
                  <item.icon className={cn('h-4 w-4', active && theme.accentTextClass)} strokeWidth={1.7} />
                  <span>{item.label}</span>
                  {active ? <span className={cn('absolute inset-x-3 -bottom-[17px] h-px bg-current', theme.accentTextClass)} /> : null}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link
              href="/es/contacto"
              className="hidden h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-[13px] text-white/60 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white md:inline-flex"
            >
              <Headphones className="h-4 w-4" strokeWidth={1.7} />
              Ayuda
            </Link>

            <div className="hidden h-10 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.035] px-2.5 sm:flex">
              <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06]', theme.accentTextClass)}>
                <UserRound className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 text-right">
                <span className="block max-w-32 truncate text-xs font-medium text-white">{userName}</span>
                <span className="block max-w-32 truncate text-[10px] text-white/35">{accountLabel}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="hidden h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs text-white/55 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:opacity-50 md:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? 'Saliendo' : 'Salir'}
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white lg:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/10 bg-black/15 px-4 py-4 lg:hidden">
            <div className="mx-auto max-w-7xl">
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 sm:hidden">
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]', theme.accentTextClass)}>
                  <UserRound className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-white">{userName}</span>
                  <span className="block text-xs text-white/40">{accountLabel}</span>
                </span>
              </div>

              <nav className="grid gap-2 sm:grid-cols-2" aria-label="Navegación móvil del portal">
                {navItems.map((item) => {
                  const active = isNavActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-colors',
                        active
                          ? 'border-white/15 bg-white/[0.09] text-white'
                          : 'border-transparent text-white/65 hover:border-white/10 hover:bg-white/[0.05] hover:text-white'
                      )}
                    >
                      <item.icon className={cn('h-4 w-4', active && theme.accentTextClass)} />
                      {item.label}
                    </Link>
                  )
                })}
                <Link href="/es/contacto" className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm text-white/65 hover:border-white/10 hover:bg-white/[0.05] hover:text-white">
                  <Headphones className="h-4 w-4" />
                  Ayuda y soporte
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left text-sm text-white/65 hover:border-white/10 hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
                </button>
              </nav>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
