'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/campos-inteligentes', label: 'Campos Inteligentes' },
  { href: '/propiedades-inteligentes', label: 'Propiedades Inteligentes' },
  { href: '/soluciones', label: 'Soluciones' },
  { href: '/contacto', label: 'Contacto' },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A1B2E]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-light text-white tracking-wide">SegurIA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[15px] text-white/80 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link
              href="/contacto"
              className="btn-primary px-6 py-2.5 text-[15px] inline-block"
            >
              Solicitar Asesoría
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#0A1B2E]/95 backdrop-blur-md border-t border-white/10">
          <div className="px-6 py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block text-[15px] text-white/80 hover:text-white transition-colors py-2"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contacto"
              onClick={() => setIsOpen(false)}
              className="btn-primary px-6 py-2.5 text-[15px] inline-block mt-4"
            >
              Solicitar Asesoría
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
