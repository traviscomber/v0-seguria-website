'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-[#0A1B2E]/95 backdrop-blur-sm z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[5px] bg-[#4DA3D9] flex items-center justify-center">
              <span className="text-white font-light text-sm">S</span>
            </div>
            <span className="text-white font-light text-lg">SegurIA</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/campos-inteligentes" className="text-white/70 hover:text-white transition-colors text-sm">
              Campos Inteligentes
            </Link>
            <Link href="/propiedades-inteligentes" className="text-white/70 hover:text-white transition-colors text-sm">
              Propiedades Inteligentes
            </Link>
            <Link href="/soluciones" className="text-white/70 hover:text-white transition-colors text-sm">
              Soluciones
            </Link>
            <Link href="/contacto" className="btn-primary px-6 py-2 text-sm">
              Contacto
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/campos-inteligentes"
              className="block px-4 py-2 text-white/70 hover:text-white transition-colors text-sm"
              onClick={() => setIsOpen(false)}
            >
              Campos Inteligentes
            </Link>
            <Link
              href="/propiedades-inteligentes"
              className="block px-4 py-2 text-white/70 hover:text-white transition-colors text-sm"
              onClick={() => setIsOpen(false)}
            >
              Propiedades Inteligentes
            </Link>
            <Link
              href="/soluciones"
              className="block px-4 py-2 text-white/70 hover:text-white transition-colors text-sm"
              onClick={() => setIsOpen(false)}
            >
              Soluciones
            </Link>
            <Link
              href="/contacto"
              className="block px-4 py-2 btn-primary text-sm"
              onClick={() => setIsOpen(false)}
            >
              Contacto
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
