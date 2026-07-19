import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#051017]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-12 grid gap-12 md:grid-cols-4">
          <div>
            <div className="mb-5">
              <img
                src="/seguria-logo.png"
                alt="SegurIA"
                className="h-12 w-[220px] object-contain object-left"
              />
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              Plataforma de seguridad para campos y propiedades. Unificamos operacion, evidencia y respuesta en una
              sola experiencia.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-light text-white">Soluciones</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/soluciones" className="text-sm text-white/50 transition-colors hover:text-white">
                  Ver solucion
                </Link>
              </li>
              <li>
                <Link href="/app" className="text-sm text-white/50 transition-colors hover:text-white">
                  Portal cliente
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm text-white/50 transition-colors hover:text-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-light text-white">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/soluciones" className="text-sm text-white/50 transition-colors hover:text-white">
                  Plataforma
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm text-white/50 transition-colors hover:text-white">
                  Solicitar asesoria
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-light text-white">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#4DA3D9]" />
                <a href="mailto:contacto@seguria.cl" className="text-sm text-white/50 transition-colors hover:text-white">
                  contacto@seguria.cl
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#4DA3D9]" />
                <a href="tel:+56912345678" className="text-sm text-white/50 transition-colors hover:text-white">
                  +56 9 1234 5678
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-[#4DA3D9]" />
                <span className="text-sm text-white/50">Santiago, Chile</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/40">© 2026 SegurIA. Todos los derechos reservados.</p>
          <p className="text-sm text-white/35">Operacion clara. Tecnologia interna.</p>
        </div>
      </div>
    </footer>
  )
}
