import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Anchor, BellRing, Eye, ShieldCheck } from 'lucide-react'
import { LocaleFooter } from '@/components/marketing/locale-footer'
import { LocaleNavigation } from '@/components/marketing/locale-navigation'
import { isLocale, localizedPath, type Locale } from '@/lib/locales'

const siteUrl = 'https://seguria.tech'

const maritimeImages = {
  hero: "https://images.unsplash.com/photo-1601311852860-1d8f42381551?auto=format&fit=crop&q=82&w=2200",
  bridge: "https://images.unsplash.com/photo-1668257791213-200b3d9e54c4?auto=format&fit=crop&q=82&w=1400",
  deck: "https://images.unsplash.com/photo-1742293466570-8aad7ae1f877?auto=format&fit=crop&q=82&w=1400",
  systems: "https://images.unsplash.com/photo-1755427485356-15d66cadb838?auto=format&fit=crop&q=82&w=1400",
} as const

const copy = {
  es: {
    eyebrow: 'Seguridad Marítima Inteligente',
    title: 'Sabe qué está pasando en tu embarcación.',
    description: 'Supervisa la operación, recibe alertas importantes y mantén el contexto de lo que ocurre a bordo, incluso con conectividad limitada.',
    primary: 'Solicitar asesoría',
    benefitsTitle: 'Lo importante, claro y en una sola operación.',
    benefits: [
      ['Operación visible', 'Entiende el estado de la embarcación y los eventos relevantes sin perseguir distintos sistemas.'],
      ['Alertas que requieren atención', 'Distingue lo importante del ruido y entrega contexto para que el equipo pueda actuar.'],
      ['Continuidad a bordo', 'Mantén la operación disponible localmente y sincroniza información cuando vuelve la conectividad.'],
    ],
    scenariosTitle: 'Dónde aporta claridad.',
    scenarios: [
      ['Puente y navegación', 'Estado operacional, maniobras y alertas reunidos en una lectura más simple.', maritimeImages.bridge],
      ['Cubierta y tripulación', 'Áreas críticas, operaciones y situaciones que requieren atención durante la jornada.', maritimeImages.deck],
      ['Equipos y mantenimiento', 'Eventos e intervenciones asociados a los sistemas importantes de la embarcación.', maritimeImages.systems],
    ],
    note: 'SegurIA puede integrarse con sistemas compatibles que ya existen a bordo. El alcance se valida según cada embarcación y operación.',
    finalTitle: 'Tu embarcación, más clara de operar.',
    finalText: 'Cuéntanos cómo operas hoy y diseñamos una solución para darte más visibilidad, mejores alertas y una respuesta más rápida.',
  },
  en: {
    eyebrow: 'Smart Maritime Security',
    title: 'Know what is happening on your vessel.',
    description: 'Monitor operations, receive important alerts and keep context about what is happening onboard, even with limited connectivity.',
    primary: 'Request advisory',
    benefitsTitle: 'What matters, clear and in one operation.',
    benefits: [
      ['Visible operations', 'Understand vessel status and relevant events without chasing different systems.'],
      ['Alerts that need attention', 'Separate important events from noise and give the team enough context to act.'],
      ['Onboard continuity', 'Keep operations available locally and synchronize information when connectivity returns.'],
    ],
    scenariosTitle: 'Where clarity matters.',
    scenarios: [
      ['Bridge and navigation', 'Operational status, maneuvers and alerts brought into a simpler view.', maritimeImages.bridge],
      ['Deck and crew', 'Critical areas, operations and situations that need attention during the day.', maritimeImages.deck],
      ['Equipment and maintenance', 'Events and interventions connected to important onboard systems.', maritimeImages.systems],
    ],
    note: 'SegurIA can integrate with compatible systems already onboard. Scope is validated for each vessel and operation.',
    finalTitle: 'A vessel that is easier to operate.',
    finalText: 'Tell us how you operate today and we will design a solution for more visibility, better alerts and faster response.',
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const lang = locale as Locale
  const page = copy[lang]
  const canonical = `${siteUrl}/${lang}/seguridad-maritima`
  return {
    title: lang === 'es' ? 'Seguridad marítima inteligente | SegurIA' : 'Smart maritime security | SegurIA',
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

const benefitIcons = [Eye, BellRing, ShieldCheck]

export default async function MaritimeSecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const lang = locale as Locale
  const page = copy[lang]

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={lang} />

      <section className="relative flex min-h-[76vh] items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(100deg, rgba(5,16,23,0.97) 0%, rgba(10,27,46,0.84) 48%, rgba(10,27,46,0.34) 100%), url('${maritimeImages.hero}')` }} />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4DA3D9]/30 bg-[#0A1B2E]/65 px-4 py-2 text-sm text-[#9DD2F2]"><Anchor className="h-4 w-4" />{page.eyebrow}</div>
            <h1 className="mt-8 text-balance text-5xl font-light leading-[1.03] text-white md:text-7xl">{page.title}</h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-white/76">{page.description}</p>
            <Link href={localizedPath(lang, '/contacto')} className="btn-primary mt-9 inline-flex px-8 py-4 text-[15px]">{page.primary}</Link>
          </div>
        </div>
      </section>

      <section className="bg-[#123A5A] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="max-w-3xl text-balance text-3xl font-light text-white md:text-5xl">{page.benefitsTitle}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {page.benefits.map(([title, description], index) => {
              const Icon = benefitIcons[index]
              return <article key={title} className="glass-card p-8"><Icon className="h-7 w-7 text-[#9DD2F2]" /><h3 className="mt-6 text-xl font-light text-white">{title}</h3><p className="mt-3 text-[15px] leading-7 text-white/64">{description}</p></article>
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#071521] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-light text-white md:text-5xl">{page.scenariosTitle}</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {page.scenarios.map(([title, description, image]) => (
              <article key={title} className="overflow-hidden rounded-[12px] border border-white/10 bg-[#0A1B2E]">
                <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(10,27,46,0.05), rgba(10,27,46,0.48)), url('${image}')` }} />
                <div className="p-7"><h3 className="text-xl font-light text-white">{title}</h3><p className="mt-3 text-[15px] leading-7 text-white/62">{description}</p></div>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-7 text-white/52">{page.note}</p>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 className="text-3xl font-light text-white md:text-4xl">{page.finalTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/62">{page.finalText}</p>
          <Link href={localizedPath(lang, '/contacto')} className="btn-primary mt-9 inline-flex px-8 py-4 text-[15px]">{page.primary}</Link>
        </div>
      </section>

      <LocaleFooter locale={lang} />
    </main>
  )
}
