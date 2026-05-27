import Link from 'next/link'
import { Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#051017] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Company */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-[5px] bg-[#4DA3D9] flex items-center justify-center">
                <span className="text-white font-light text-sm">S</span>
              </div>
              <span className="text-white font-light text-lg">SegurIA</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Infraestructura inteligente para campos y propiedades. Conectamos, protegemos y escalamos tu operación.
            </p>
          </div>

          {/* Soluciones */}
          <div>
            <h3 className="text-white font-light text-sm mb-4">Soluciones</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/campos-inteligentes" className="text-white/50 hover:text-white text-sm transition-colors">
                  Campos Inteligentes
                </Link>
              </li>
              <li>
                <Link href="/propiedades-inteligentes" className="text-white/50 hover:text-white text-sm transition-colors">
                  Propiedades Inteligentes
                </Link>
              </li>
              <li>
                <Link href="/soluciones" className="text-white/50 hover:text-white text-sm transition-colors">
                  Ver Todas
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-white font-light text-sm mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-white/50 hover:text-white text-sm transition-colors">
                  Acerca de
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/50 hover:text-white text-sm transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-white/50 hover:text-white text-sm transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-light text-sm mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#4DA3D9]" />
                <a href="mailto:info@seguria.com" className="text-white/50 hover:text-white text-sm transition-colors">
                  info@seguria.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#4DA3D9]" />
                <a href="tel:+5612345678" className="text-white/50 hover:text-white text-sm transition-colors">
                  +56 (2) 1234 5678
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-[#4DA3D9] mt-0.5" />
                <span className="text-white/50 text-sm">Santiago, Chile</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-white/40 text-sm">
            © 2024 SegurIA. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link href="#" className="text-white/40 hover:text-white transition-colors">
              <Linkedin size={18} />
            </Link>
            <Link href="#" className="text-white/40 hover:text-white transition-colors">
              <Twitter size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
