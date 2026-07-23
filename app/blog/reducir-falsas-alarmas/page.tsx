import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ArrowLeft, Calendar } from 'lucide-react'

export default function FalseAlarmsPost() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />

      <article className="py-24 px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#9DD2F2] hover:text-white transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Volver al blog
          </Link>

          <header className="mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-[#4DA3D9]/20 text-[#9DD2F2] text-xs uppercase tracking-wider font-medium mb-4">
              Operación
            </span>
            <h1 className="text-5xl font-light text-white text-balance mb-6">
              Cómo reducir falsas alarmas en 85% sin sacrificar protección
            </h1>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                20 de julio, 2026
              </span>
              <span>6 min de lectura</span>
            </div>
          </header>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-white/80 leading-relaxed mb-6">
              Las falsas alarmas son el enemigo silencioso de la seguridad moderna. No es que tu sistema sea malo. Es que está configurado para capturar todo movimiento, toda vibración, todo cambio de temperatura. El resultado: confusión, fatiga, y finalmente, ignorar las alertas que importan.
            </p>

            <h2 className="text-3xl font-light text-white mt-12 mb-6">Los números reales</h2>
            <div className="bg-[#123A5A] rounded-lg border border-[#4DA3D9]/20 p-6 my-8">
              <p className="text-white/70 mb-4">Según análisis de 50+ implementaciones de seguridad en Chile:</p>
              <ul className="space-y-3">
                <li className="text-white/70 flex gap-3">
                  <span className="text-[#9DD2F2]">•</span>
                  <span>Industria promedio: 12-15 falsas alarmas por 1 incidente real</span>
                </li>
                <li className="text-white/70 flex gap-3">
                  <span className="text-[#4DA3D9]">•</span>
                  <span>Campos rurales: 18-20 falsas alarmas por 1 amenaza real</span>
                </li>
                <li className="text-white/70 flex gap-3">
                  <span className="text-[#4DA3D9]">•</span>
                  <span>Hoteles: 10-14 falsas alarmas por 1 incidente de seguridad real</span>
                </li>
              </ul>
            </div>

            <h2 className="text-3xl font-light text-white mt-12 mb-6">¿Por qué ocurre?</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Porque los sistemas están diseñados para NO perder nada. Mejor capturar 100 falsas alarmas que dejar pasar 1 verdadero problema. Pero esa mentalidad mata la confianza en el sistema.
            </p>

            <h3 className="text-2xl font-light text-white/90 mt-10 mb-4">Las 5 causas principales</h3>
            <ol className="space-y-6 mb-8">
              <li className="text-white/70">
                <strong className="text-white">Sensores sin contexto:</strong> Una cámara ve movimiento. Punto. No sabe si es viento, animal, persona autorizada o amenaza.
              </li>
              <li className="text-white/70">
                <strong className="text-white">Falta de aprendizaje:</strong> El sistema no aprende qué es "normal" en tu entorno. No distingue el patrón diario del incidente.
              </li>
              <li className="text-white/70">
                <strong className="text-white">Sensores mal calibrados:</strong> Un sensor de movimiento sensible al 100% en un área ventosa genera alarmas constantes.
              </li>
              <li className="text-white/70">
                <strong className="text-white">Falta de integración:</strong> Los sistemas no se hablan entre sí. La cámara no sabe qué dicen los sensores de temperatura o movimiento.
              </li>
              <li className="text-white/70">
                <strong className="text-white">Configuración genérica:</strong> Mismas reglas para todas las ubicaciones, sin adaptación a realidad local.
              </li>
            </ol>

            <h2 className="text-3xl font-light text-white mt-12 mb-6">Cómo SegurIA lo resuelve</h2>

            <h3 className="text-2xl font-light text-white/90 mt-10 mb-4">1. Aprendizaje automático del "baseline"</h3>
            <p className="text-white/70 leading-relaxed mb-6">
              SegurIA pasa 48-72 horas aprendiendo qué es normal en tu entorno específico. No es configuración manual. El sistema observa y aprende:
            </p>
            <ul className="space-y-2 mb-6 text-white/70">
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span>Patrones de tráfico (quién entra, cuándo, frecuencia)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span>Variaciones climáticas (cómo cambia la temperatura según hora y estación)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span>Fauna local (animales inofensivos vs amenazas)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span>Ruido ambiental (viento, tráfico, equipos cercanos)</span>
              </li>
            </ul>

            <h3 className="text-2xl font-light text-white/90 mt-10 mb-4">2. Correlación de eventos</h3>
            <p className="text-white/70 leading-relaxed mb-6">
              Una cámara ve movimiento. Antes: alarma. Ahora: SegurIA cruza:
            </p>
            <ul className="space-y-2 mb-6 text-white/70">
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">✓</span>
                <span>¿Es hora de tráfico normal? (9am: sí)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">✓</span>
                <span>¿Los sensores de acceso registran entrada autorizada? (sí)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">✓</span>
                <span>¿La temperatura es normal para la hora? (sí)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">✓</span>
                <span>Conclusión: no es incidente, es actividad normal</span>
              </li>
            </ul>

            <h3 className="text-2xl font-light text-white/90 mt-10 mb-4">3. Scoring de "importancia"</h3>
            <p className="text-white/70 leading-relaxed mb-6">
              Cada evento recibe un score de 0-100 sobre cuán probable es que sea una amenaza real:
            </p>
            <div className="space-y-3 mb-8">
              <div className="bg-white/[0.05] rounded-lg p-4 border border-white/10">
                <p className="text-white font-medium mb-2">Zorro en cámara perimetral a las 11pm</p>
                <p className="text-[#9DD2F2] text-2xl">Score: 12/100</p>
                <p className="text-white/60 text-sm mt-2">No alertar. Evento registrado para auditoría.</p>
              </div>
              <div className="bg-white/[0.05] rounded-lg p-4 border border-white/10">
                <p className="text-white font-medium mb-2">Entrada sin autorización a zona restringida a las 2am</p>
                <p className="text-red-400 text-2xl">Score: 94/100</p>
                <p className="text-white/60 text-sm mt-2">Alertar inmediatamente. Contactar seguridad.</p>
              </div>
            </div>

            <h3 className="text-2xl font-light text-white/90 mt-10 mb-4">4. Machine learning adaptativo</h3>
            <p className="text-white/70 leading-relaxed mb-6">
              El sistema mejora cada día. Cada vez que ignoras una alerta (o actúas en una), el ML lo aprende. Después de 2 semanas, la precisión mejora significativamente.
            </p>

            <h2 className="text-3xl font-light text-white mt-12 mb-6">Resultados medibles</h2>
            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div className="bg-[#123A5A] rounded-lg border border-[#4DA3D9]/20 p-6">
                <p className="text-4xl font-light text-[#9DD2F2] mb-2">85%</p>
                <p className="text-sm text-white/70">menos falsas alarmas</p>
              </div>
              <div className="bg-[#123A5A] rounded-lg border border-[#4DA3D9]/20 p-6">
                <p className="text-4xl font-light text-[#9DD2F2] mb-2">3s</p>
                <p className="text-sm text-white/70">tiempo medio de respuesta</p>
              </div>
              <div className="bg-[#123A5A] rounded-lg border border-[#4DA3D9]/20 p-6">
                <p className="text-4xl font-light text-[#9DD2F2] mb-2">100%</p>
                <p className="text-sm text-white/70">confianza en alertas reales</p>
              </div>
            </div>

            <h2 className="text-3xl font-light text-white mt-12 mb-6">Lo importante</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Reducir falsas alarmas no significa menos protección. Significa protección más inteligente. Significa que cuando recibas una alerta a las 3am, sea algo que realmente importa actender.
            </p>
            <p className="text-white/70 leading-relaxed">
              Y eso cambia todo.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-white/60 mb-4">¿Cansado de falsas alarmas?</p>
            <Link href="/contacto" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#4DA3D9] text-white hover:bg-[#3D8CC0] transition-colors">
              Hablemos
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  )
}
