import Link from 'next/link'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'

const whatsappUrl =
  'https://wa.me/56928003961?text=Hola%20SegurIA%2C%20quisiera%20recibir%20asesor%C3%ADa%20sobre%20un%20sistema%20de%20seguridad%20integral.'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#051017]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-12 grid gap-12 md:grid-cols-4">
          <div>
            <div className="mb-5">
              <img
                src="/seguria-logo.png"
                alt="SegurIA, sistemas de seguridad integral en Chile"
                className="h-12 w-[220px] object-contain object-left"
              />
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              Sistemas de seguridad integral en Chile. Integramos cámaras, alarmas, sensores, control de acceso,
              monitoreo e inteligencia artificial en una sola operación.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-light text-white">Soluciones</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/soluciones" className="text-sm text-white/50 transition-colors hover:text-white">
                  Seguridad integral
                </Link>
              </li>
              <li>
                <Link href="/campos-inteligentes" className="text-sm text-white/50 transition-colors hover:text-white">
                  Seguridad para campos
                </Link>
              </li>
              <li>
                <Link href="/propiedades-inteligentes" className="text-sm text-white/50 transition-colors hover:text-white">
                  Seguridad para propiedades
                </Link>
              </li>
              <li>
                <Link href="/hoteleria-inteligente" className="text-sm text-white/50 transition-colors hover:text-white">
                  Seguridad para hoteles
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-light text-white">Información</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/integraciones" className="text-sm text-white/50 transition-colors hover:text-white">
                  Integraciones
                </Link>
              </li>
              <li>
                <Link href="/preguntas-frecuentes" className="text-sm text-white/50 transition-colors hover:text-white">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm text-white/50 transition-colors hover:text-white">
                  Solicitar asesoría
                </Link>
              </li>
              <li>
                <Link href="/app" className="text-sm text-white/50 transition-colors hover:text-white">
                  Portal cliente
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-light text-white">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#4DA3D9]" />
                <a href="mailto:info@seguria.tech" className="text-sm text-white/50 transition-colors hover:text-white">
                  info@seguria.tech
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#4DA3D9]" />
                <a href="tel:+56928003961" className="text-sm text-white/50 transition-colors hover:text-white">
                  +56 9 2800 3961
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#4DA3D9]" />
                <span className="text-sm text-white/50">Av. Vitacura 3439, Of. 602, Vitacura, Santiago, Chile</span>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/90 px-4 py-2 text-sm text-white transition-colors hover:bg-[#25D366]"
                  aria-label="Escribir a SegurIA por WhatsApp"
                >
                  <MessageCircle size={16} />
                  WhatsApp directo
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/40">© 2026 SegurIA. Todos los derechos reservados.</p>
          <p className="text-sm text-white/35">Seguridad integral conectada con inteligencia artificial.</p>
        </div>
      </div>
    </footer>
  )
}
