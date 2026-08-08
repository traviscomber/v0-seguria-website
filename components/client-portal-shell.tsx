'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Building2,
  Camera,
  Cpu,
  FileImage,
  Headphones,
  Home,
  LogOut,
  Menu,
  ScanSearch,
  Siren,
  Trees,
  UserRound,
  Wheat,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PortalBrandLink } from '@/components/portal/portal-brand-link'
import type { ClientTheme } from '@/lib/client-theme'
import { cn } from '@/lib/utils'

const dashboardSectionIds = ['control', 'infraestructura', 'incidentes', 'evidencia', 'vision', 'edge'] as const

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

  const navItems = useMemo(() => [
    { href: '/app#control', label: 'Control', icon: Home },
    { href: '/app#infraestructura', label: 'Infraestructura', icon: Building2 },
    { href: '/app#incidentes', label: 'Incidentes', icon: Siren },
    { href: '/app#evidencia', label: 'Evidencia', icon: FileImage },
    { href: '/app#vision', label: 'Vision', icon: ScanSearch },
    { href: '/app#edge', label: 'Edge', icon: Cpu },
  ], [])

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || (pathname === '/app' ? '#control' : ''))
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [pathname])

  useEffect(() => {
    if (pathname !== '/app') return
    const sections = dashboardSectionIds.map((id) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section))
    if (sections.length === 0) return

    const visibleSections = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSections.set(entry.target.id, entry.intersectionRatio)
          else visibleSections.delete(entry.target.id)
        })
        const nextSection = [...visibleSections.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
        if (nextSection) setActiveHash(`#${nextSection}`)
      },
      { rootMargin: '-88px 0px -58% 0px', threshold: [0.08, 0.2, 0.4, 0.6] }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [pathname])

  useEffect(() => setMobileOpen(false), [pathname, activeHash])

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
    if (href === '/app#infraestructura' && pathname.startsWith('/app/properties')) return true
    if (!href.startsWith('/app#')) return pathname === href
    return pathname === '/app' && activeHash === href.slice('/app'.length)
  }

  const PortalIcon = theme.key === 'huilo-huilo' ? Trees : theme.key === 'santa-elena' ? Wheat : Camera
  const accountLabel = userRole === 'client' ? theme.vocabulary.operation : userRole
  const helpHref = theme.key === 'huilo-huilo' ? '/contacto/huilo-huilo' : '/es/contacto'
  const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black'

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: theme.pageBackground }}>
      <header className={cn('sticky top-0 z-50 border-b border-white/10 backdrop-blur-2xl', theme.cardClass)}>
        <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <div className="hidden sm:block">
            <PortalBrandLink href="/app#control" name={theme.name} icon={PortalIcon} accentClass={theme.accentTextClass} />
          </div>
          <div className="sm:hidden">
            <PortalBrandLink href="/app#control" name={theme.name} icon={PortalIcon} accentClass={theme.accentTextClass} compact />
          </div>

          <div className="hidden h-8 w-px shrink-0 bg-white/10 lg:block" />

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex" aria-label="Navegación principal del portal">
            {navItems.map((item) => {
              const active = isNavActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-[12px] transition-colors',
                    focusClass,
                    active ? 'bg-white/[0.09] text-white' : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                  )}
                >
                  <item.icon className={cn('h-3.5 w-3.5', active && theme.accentTextClass)} strokeWidth={1.7} aria-hidden="true" />
                  <span>{item.label}</span>
                  {active ? <span className={cn('absolute inset-x-2.5 -bottom-[17px] h-px bg-current', theme.accentTextClass)} /> : null}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link href={helpHref} className={cn('hidden h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-[13px] text-white/65 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white md:inline-flex', focusClass)}>
              <Headphones className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
              Ayuda
            </Link>

            <div className="hidden h-10 items-center gap-2.5 rounded-xl bg-white/[0.035] px-2.5 sm:flex">
              <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06]', theme.accentTextClass)}>
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 text-right">
                <span className="block max-w-32 truncate text-xs font-medium text-white">{userName}</span>
                <span className="block max-w-32 truncate text-[10px] text-white/45">{accountLabel}</span>
              </span>
            </div>

            <button type="button" onClick={handleLogout} disabled={loggingOut} className={cn('hidden h-10 items-center gap-2 rounded-xl px-3 text-xs text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-50 md:inline-flex', focusClass)}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {loggingOut ? 'Saliendo' : 'Salir'}
            </button>

            <button type="button" className={cn('flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white xl:hidden', focusClass)} onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={mobileOpen} aria-controls="portal-mobile-menu">
              {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div id="portal-mobile-menu" className="border-t border-white/10 bg-black/20 px-4 py-4 xl:hidden">
            <div className="mx-auto max-w-7xl">
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/[0.035] p-3 sm:hidden">
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]', theme.accentTextClass)}><UserRound className="h-4 w-4" aria-hidden="true" /></span>
                <span><span className="block text-sm font-medium text-white">{userName}</span><span className="block text-xs text-white/50">{accountLabel}</span></span>
              </div>

              <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Navegación móvil del portal">
                {navItems.map((item) => {
                  const active = isNavActive(item.href)
                  return (
                    <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors', focusClass, active ? 'bg-white/[0.09] text-white' : 'text-white/70 hover:bg-white/[0.05] hover:text-white')}>
                      <item.icon className={cn('h-4 w-4', active && theme.accentTextClass)} aria-hidden="true" />
                      {item.label}
                    </Link>
                  )
                })}
                <Link href={helpHref} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/70 hover:bg-white/[0.05] hover:text-white', focusClass)}><Headphones className="h-4 w-4" aria-hidden="true" />Ayuda y soporte</Link>
                <button type="button" onClick={handleLogout} disabled={loggingOut} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white/70 hover:bg-white/[0.05] hover:text-white disabled:opacity-50', focusClass)}><LogOut className="h-4 w-4" aria-hidden="true" />{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</button>
              </nav>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
