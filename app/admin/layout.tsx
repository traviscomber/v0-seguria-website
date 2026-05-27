'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  FileText, 
  Cpu, 
  FileCheck,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/proyectos', label: 'Proyectos', icon: FolderKanban },
  { href: '/admin/documentos', label: 'Documentos', icon: FileText },
  { href: '/admin/dispositivos', label: 'Dispositivos', icon: Cpu },
  { href: '/admin/propuestas', label: 'Propuestas', icon: FileCheck },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0A1B2E]">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#123A5A] z-50 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-lg font-light text-white">SegurIA Admin</span>
        </Link>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 bg-[#123A5A] z-40
        transform transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-lg font-light text-white">SegurIA</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-[5px] transition-colors
                  ${isActive 
                    ? 'bg-[#4DA3D9]/20 text-[#4DA3D9]' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-[15px]">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-[5px] text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[15px]">Volver al sitio</span>
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
