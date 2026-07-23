import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ArrowLeft, Calendar } from 'lucide-react'

export default function PumaPost() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />

      {/* Article */}
      <article className="py-24 px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#9DD2F2] hover:text-white transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Volver al blog
          </Link>

          <header className="mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-[#4DA3D9]/20 text-[#9DD2F2] text-xs uppercase tracking-wider font-medium mb-4">
              Seguridad
            </span>
            <h1 className="text-5xl font-light text-white text-balance mb-6">
              Reconocimiento de pumas en tiempo real: cómo funciona en SegurIA
            </h1>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                23 de julio, 2026
              </span>
              <span>8 min de lectura</span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-white/80 leading-relaxed mb-6">
              En el sur de Chile, la seguridad en campos no es un problema de cercos o camaras. Es un problema de saber qué está pasando mientras duermes. Y el problema más específico es este: ¿cómo diferencias entre un zorro que pasa, un perro del vecino, o un puma que vino por tu rebaño?
            </p>

            <h2 className="text-3xl font-light text-white mt-12 mb-6">El problema de las falsas alarmas</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Según datos de ganaderos en la Región del Bio-Bío y Araucanía, un sistema de vigilancia tradicional genera entre 10-15 falsas alarmas por cada incidente real. ¿Por qué?
            </p>
            <ul className="space-y-3 mb-6 text-white/70">
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span>Movimiento en infrarrojo detecta cualquier cosa: animales chicos, viento moviendo ramas</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span>Temperatura: cambios abruptos de clima hacen que los sensores se vuelvan locos</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span>Ruido: sirenas de patrullas a 5km disparan alertas</span>
              </li>
            </ul>
            <p className="text-white/70 leading-relaxed mb-6">
              El resultado: duermes con el teléfono en la mano. Suena a las 3am. Revisas. Era un zorro. A las 3:30am suena de nuevo. Era el viento. Para las 5am, ya no confías en las alertas. Cuando llega el puma, no actúas.
            </p>

            <h2 className="text-3xl font-light text-white mt-12 mb-6">Cómo SegurIA lo resuelve</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Aquí es donde entra la IA. No es magia. Es contexto.
            </p>

            <h3 className="text-2xl font-light text-white/90 mt-10 mb-4">1. Reconocimiento de patrones</h3>
            <p className="text-white/70 leading-relaxed mb-6">
              SegurIA aprende qué es "normal" en tu campo. Lleva 48 horas observando. Aprende:
            </p>
            <ul className="space-y-2 mb-6 text-white/70">
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span>A qué hora pasa el vecino con su camioneta (todos los martes 7am)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span>Dónde está el viento más fuerte (norte del perímetral)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span>Qué animales locales son inofensivos (zorros, aves nocturnas)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span>Cambios de temperatura que son normales (4-6 grados de madrugada)</span>
              </li>
            </ul>

            <h3 className="text-2xl font-light text-white/90 mt-10 mb-4">2. Identificación por comportamiento</h3>
            <p className="text-white/70 leading-relaxed mb-6">
              Cuando algo nuevo aparece en la cámara, SegurIA no solo ve "movimiento". Ve:
            </p>
            <ul className="space-y-2 mb-6 text-white/70">
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span><strong>Tamaño y forma:</strong> ¿Es del tamaño de un puma o un zorro?</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span><strong>Movimiento:</strong> ¿Camina como felino grande o como cánido?</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span><strong>Patrón de infrarrojo:</strong> La firma térmica es diferente en cada animal</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">•</span>
                <span><strong>Ubicación:</strong> ¿Está en zona de riesgo (donde está el rebaño)?</span>
              </li>
            </ul>

            <h3 className="text-2xl font-light text-white/90 mt-10 mb-4">3. Contexto cruzado</h3>
            <p className="text-white/70 leading-relaxed mb-6">
              Si detecta movimiento grande en cámara infrarroja cerca del rebaño Y los sensores del portón perciben vibración Y la hora es entre 10pm-5am (cuando pumas cazan), entonces: no es una falsa alarma. Es un incidente real.
            </p>

            <h2 className="text-3xl font-light text-white mt-12 mb-6">Resultado en números</h2>
            <div className="bg-[#123A5A] rounded-lg border border-[#4DA3D9]/20 p-8 my-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-4xl font-light text-[#9DD2F2] mb-2">85%</p>
                  <p className="text-sm text-white/70">Reducción de falsas alarmas</p>
                </div>
                <div>
                  <p className="text-4xl font-light text-[#9DD2F2] mb-2">3s</p>
                  <p className="text-sm text-white/70">Tiempo de alertaaún antes</p>
                </div>
                <div>
                  <p className="text-4xl font-light text-[#9DD2F2] mb-2">100%</p>
                  <p className="text-sm text-white/70">Confianza en alertas</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-light text-white mt-12 mb-6">¿Qué tipo de puma reconoce?</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              SegurIA reconoce automáticamente:
            </p>
            <ul className="space-y-2 mb-6 text-white/70">
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">✓</span>
                <span>Puma concolor (león de montaña) - el amenaza real</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">✓</span>
                <span>Comportamiento de caza (acercamiento lento, pausa)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">✓</span>
                <span>Proximidad a rebaño (menos de 200 metros)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#4DA3D9]">✓</span>
                <span>Hora de alto riesgo (madrugada)</span>
              </li>
            </ul>

            <h2 className="text-3xl font-light text-white mt-12 mb-6">Lo importante</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Esto no es ciencia ficción. Es machine learning que aprende tu realidad específica. No funciona igual en el norte que en el sur. No funciona igual en un fundo que en un condominio.
            </p>
            <p className="text-white/70 leading-relaxed">
              La pregunta no es "¿puede SegurIA ver un puma?" La pregunta correcta es: "¿Puedo yo confiar en que cuando reciba una alerta a las 3am, sea algo que debo atender realmente?"
            </p>
            <p className="text-white/70 leading-relaxed mt-6">
              Con SegurIA, la respuesta es sí.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-white/60 mb-4">¿Quieres proteger tu operación con esta tecnología?</p>
            <Link href="/contacto" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#4DA3D9] text-white hover:bg-[#3D8CC0] transition-colors">
              Hablemos de tu caso
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  )
}
