'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'

const navItems = [
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
        <div className="flex items-center justify-center h-20 relative">
          {/* Logo - positioned on the left */}
          <Link href="/" className="absolute left-6 flex-shrink-0 h-full flex items-center">
            <Image
              src="/logo-seguria-icon.png"
              alt="SegurIA"
              width={240}
              height={240}
              className="w-auto h-[210%]"
              priority
            />
          </Link>

          {/* Desktop Navigation - centered */}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-white absolute right-0"
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
          </div>
        </div>
      )}
    </nav>
  )
}
