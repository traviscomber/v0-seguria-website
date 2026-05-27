import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#0A1B2E] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xl font-light text-white tracking-wide">SegurIA</span>
            </Link>
            <p className="text-[15px] text-white/60 leading-relaxed">
              Conectamos tecnología. Protegemos lo que importa. Preparamos tu operación para crecer.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-light text-lg mb-4">Navegación</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-[15px] text-white/60 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/campos-inteligentes" className="text-[15px] text-white/60 hover:text-white transition-colors">
                  Campos Inteligentes
                </Link>
              </li>
              <li>
                <Link href="/propiedades-inteligentes" className="text-[15px] text-white/60 hover:text-white transition-colors">
                  Propiedades Inteligentes
                </Link>
              </li>
              <li>
                <Link href="/soluciones" className="text-[15px] text-white/60 hover:text-white transition-colors">
                  Soluciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-white font-light text-lg mb-4">Soluciones</h4>
            <ul className="space-y-3">
              <li className="text-[15px] text-white/60">Cámaras Inteligentes</li>
              <li className="text-[15px] text-white/60">Sensores e IoT</li>
              <li className="text-[15px] text-white/60">Redes y Conectividad</li>
              <li className="text-[15px] text-white/60">Control de Acceso</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-light text-lg mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-[15px] text-white/60">
                <Phone className="w-4 h-4 text-[#4DA3D9]" strokeWidth={1.5} />
                <span>+56 9 1234 5678</span>
              </li>
              <li className="flex items-center gap-3 text-[15px] text-white/60">
                <Mail className="w-4 h-4 text-[#4DA3D9]" strokeWidth={1.5} />
                <span>contacto@seguria.cl</span>
              </li>
              <li className="flex items-center gap-3 text-[15px] text-white/60">
                <MapPin className="w-4 h-4 text-[#4DA3D9]" strokeWidth={1.5} />
                <span>Santiago, Chile</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-center text-[14px] text-white/40">
            © {new Date().getFullYear()} SegurIA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
