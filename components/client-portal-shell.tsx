'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, ClipboardCheck, House, LogOut, Menu, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/app', label: 'Resumen', icon: House },
  { href: '/app#decisiones', label: 'Decisiones', icon: ShieldCheck },
  { href: '/app#reunion', label: 'Reunion', icon: Sparkles },
  { href: '/app#acciones', label: 'Acciones', icon: ClipboardCheck },
  { href: '/app#confianza', label: 'Confianza', icon: ShieldCheck },
  { href: '/app#sitios', label: 'Sitios', icon: Building2 },
]

const guidanceItems = [
  {
    label: 'Mirar primero',
    value: 'Decisiones y acciones abiertas',
    href: '/app#decisiones',
  },
  {
    label: 'Ver evidencia',
    value: 'Sitios, eventos y respaldo',
    href: '/app#sitios',
  },
  {
    label: 'Preparar reunion',
    value: 'Decision, evidencia y cierre',
    href: '/app#reunion',
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
    if (href === '/app') return pathname === '/app'
    if (href === '/app#sitios') return pathname.startsWith('/app/properties')
    return false
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(77,163,217,0.18),_transparent_28%),linear-gradient(180deg,#081624_0%,#0A1B2E_100%)] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#081624]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/app" className="flex items-center gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Portal de cliente</p>
              <img
                src="/seguria-logo.png"
                alt="SegurIA"
                className="mt-1 h-7 w-[126px] rounded-[4px] object-contain object-left"
              />
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const active = isNavActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors',
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
            <div className="hidden text-right sm:block">
              <p className="text-sm text-white">{userName}</p>
              <p className="text-xs text-white/45">{userRole === 'client' ? 'Cliente' : userRole}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={loggingOut} className="hidden md:inline-flex">
              <LogOut className="h-4 w-4" />
              {loggingOut ? 'Cerrando...' : 'Salir'}
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen((value) => !value)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-2 rounded-xl border border-white/10 px-3 py-2 text-left text-sm text-white/70"
              >
                {loggingOut ? 'Cerrando...' : 'Salir'}
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
                <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#9FDBFF]">Operacion cliente</p>
                <p className="mt-1 text-sm text-white">{userName}</p>
                <p className="mt-1 text-xs leading-5 text-white/55">
                  Tu portal resume lo que cambia, lo que importa y lo que necesita respuesta.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {guidanceItems.map((item) => (
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
