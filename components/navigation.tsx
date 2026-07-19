'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0A1B2E]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-[#4DA3D9]">
              <span className="text-sm font-light text-white">S</span>
            </div>
            <span className="text-lg font-light text-white">SegurIA</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/soluciones" className="text-sm text-white/70 transition-colors hover:text-white">
              Soluciones
            </Link>
            <Link href="/app" className="text-sm text-white/70 transition-colors hover:text-white">
              Portal
            </Link>
            <Link href="/contacto" className="btn-primary px-6 py-2 text-sm">
              Contacto
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="text-white md:hidden" aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="space-y-2 pb-4 md:hidden">
            <Link
              href="/soluciones"
              className="block px-4 py-2 text-sm text-white/70 transition-colors hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Soluciones
            </Link>
            <Link
              href="/app"
              className="block px-4 py-2 text-sm text-white/70 transition-colors hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Portal
            </Link>
            <Link href="/contacto" className="btn-primary block px-4 py-2 text-sm" onClick={() => setIsOpen(false)}>
              Contacto
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
