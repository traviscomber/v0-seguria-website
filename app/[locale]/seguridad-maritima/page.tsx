import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Anchor, Camera, FileSearch, Radio, ShieldCheck, WifiOff } from 'lucide-react'
import { LocaleFooter } from '@/components/marketing/locale-footer'
import { LocaleNavigation } from '@/components/marketing/locale-navigation'
import { isLocale, localizedPath, type Locale } from '@/lib/locales'

const siteUrl = 'https://seguria.tech'

const copy = {
  es: {
    eyebrow: 'Seguridad Marítima Inteligente',
    title: 'Tu embarcación no necesita más cámaras. Necesita saber qué pasó.',
    description: 'SegurIA conecta cámaras, grabadores y sistemas a bordo para transformar video en evidencia, incidentes y control operacional, incluso con conectividad limitada.',
    primary: 'Solicitar asesoría',
    secondary: 'Ver la suite',
    sectionTitle: 'Del video continuo a una operación que se entiende.',
    cards: [
      ['Evidencia ante incidentes', 'Reconstruye qué ocurrió, cuándo, dónde y qué cámara lo registró.'],
      ['Maniobras y atraques', 'Ordena evidencia de entrada, salida, atraque, desatraque y operación de cubierta.'],
      ['Seguridad de tripulación', 'Da contexto a eventos en cubierta, zonas restringidas y áreas de riesgo.'],
      ['Operación desconectada', 'Edge permite procesar señales localmente y mantener continuidad cuando la conectividad es limitada.'],
      ['Mantenimiento verificable', 'Relaciona intervenciones, equipos y evidencia visual para mejorar la trazabilidad operacional.'],
      ['Vision preparada para el mar', 'Una base para análisis visual y reglas inteligentes sobre cámaras compatibles, validada según cada instalación.'],
    ],
    note: 'Las capacidades de detección dependen de cámara, óptica, iluminación, movimiento, clima, conectividad y caso de uso. Cada instalación marítima se valida técnicamente antes de definir reglas de alerta.',
    finalTitle: 'Convierte lo que ocurre a bordo en evidencia útil.',
    finalText: 'Diseñamos una arquitectura sobre cámaras y sistemas compatibles existentes, con Edge, evidencia e incidentes conectados a la operación.',
  },
  en: {
    eyebrow: 'Smart Maritime Security',
    title: 'Your vessel does not need more cameras. It needs to know what happened.',
    description: 'SegurIA connects onboard cameras, recorders and systems to turn video into evidence, incidents and operational control, even with limited connectivity.',
    primary: 'Request advisory',
    secondary: 'View the suite',
    sectionTitle: 'From continuous video to an operation you can understand.',
    cards: [
      ['Incident evidence', 'Reconstruct what happened, when, where and which camera recorded it.'],
      ['Maneuvers and docking', 'Organize evidence from arrival, departure, docking, undocking and deck operations.'],
      ['Crew safety', 'Add context to events on deck, restricted zones and higher-risk areas.'],
      ['Disconnected operations', 'Edge can process signals locally and preserve continuity when connectivity is limited.'],
      ['Verifiable maintenance', 'Connect interventions, equipment and visual evidence to improve operational traceability.'],
      ['Vision ready for maritime use', 'A foundation for visual analysis and intelligent rules on compatible cameras, validated for each installation.'],
    ],
    note: 'Detection capabilities depend on camera, optics, lighting, motion, weather, connectivity and use case. Every maritime installation is technically validated before alert rules are defined.',
    finalTitle: 'Turn what happens onboard into useful evidence.',
    finalText: 'We design an architecture on top of compatible existing cameras and systems, connecting Edge, evidence and incidents to the operation.',
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const lang = locale as Locale
  const page = copy[lang]
  const canonical = `${siteUrl}/${lang}/seguridad-maritima`
  return {
    title: lang === 'es' ? 'Seguridad marítima inteligente | SegurIA Security Suite' : 'Smart maritime security | SegurIA Security Suite',
    description: page.description,
    alternates: {
      canonical,
      languages: {
        'es-CL': `${siteUrl}/es/seguridad-maritima`,
        en: `${siteUrl}/en/seguridad-maritima`,
        'x-default': `${siteUrl}/es/seguridad-maritima`,
      },
    },
  }
}

const icons = [FileSearch, Anchor, ShieldCheck, WifiOff, Radio, Camera]

export default async function MaritimeSecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const lang = locale as Locale
  const page = copy[lang]

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={lang} />
      <section className="relative flex min-h-[84vh] items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(77,163,217,0.25),transparent_30%),linear-gradient(135deg,#123A5A_0%,#0A1B2E_62%)]" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4DA3D9]/30 bg-[#4DA3D9]/12 px-4 py-2 text-sm text-[#9DD2F2]">
              <Anchor className="h-4 w-4" strokeWidth={1.6} /> {page.eyebrow}
            </div>
            <h1 className="mt-8 text-balance text-5xl font-light leading-[1.03] text-white md:text-6xl lg:text-7xl">{page.title}</h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-white/72">{page.description}</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href={localizedPath(lang, '/contacto')} className="btn-primary inline-flex items-center justify-center px-8 py-4 text-[15px]">{page.primary}</Link>
              <Link href={localizedPath(lang, '/soluciones')} className="btn-secondary inline-flex items-center justify-center px-8 py-4 text-[15px]">{page.secondary}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#123A5A] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="max-w-3xl text-balance text-3xl font-light text-white md:text-5xl">{page.sectionTitle}</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {page.cards.map(([title, description], index) => {
              const Icon = icons[index]
              return <article key={title} className="glass-card p-8"><Icon className="h-7 w-7 text-[#9DD2F2]" strokeWidth={1.5} /><h3 className="mt-6 text-xl font-light text-white">{title}</h3><p className="mt-3 text-[15px] leading-7 text-white/65">{description}</p></article>
            })}
          </div>
          <div className="mt-10 rounded-[10px] border border-[#9DD2F2]/20 bg-[#0A1B2E]/65 p-7 text-sm leading-7 text-white/70">{page.note}</div>
        </div>
      </section>

      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-balance text-3xl font-light text-white md:text-4xl">{page.finalTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/62">{page.finalText}</p>
          <Link href={localizedPath(lang, '/contacto')} className="btn-primary mt-10 inline-flex px-8 py-4 text-[15px]">{page.primary}</Link>
        </div>
      </section>
      <LocaleFooter locale={lang} />
    </main>
  )
}
