import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Building2, MapPin, Mountain, ShieldCheck } from 'lucide-react'
import { LocaleFooter } from '@/components/marketing/locale-footer'
import { LocaleNavigation } from '@/components/marketing/locale-navigation'
import { isLocale, locales, localizedPath, type Locale } from '@/lib/locales'

const siteUrl = 'https://seguria.tech'

const content = {
  es: {
    title: 'Seguridad inteligente en Chile | SegurIA',
    description: 'SegurIA desarrolla proyectos en Chile con presencia en Santiago y Valdivia, para operaciones urbanas, rurales y remotas.',
    eyebrow: 'Chile · Santiago + Valdivia',
    heading: 'Seguridad que se entiende, también cuando la operación está lejos.',
    intro: 'Desde Santiago y Valdivia trabajamos con operaciones que necesitan visibilidad clara, alertas útiles y continuidad aun cuando la distancia o la conectividad complican el día a día.',
    baseTitle: 'Santiago',
    baseText: 'Nuestra base operacional coordina proyectos, soporte y atención comercial a nivel nacional.',
    southTitle: 'Valdivia',
    southText: 'Nuestra presencia en el sur acerca SegurIA a campos, hoteles, propiedades, operaciones productivas y sitios remotos de La Araucanía, Los Ríos y Los Lagos.',
    whyTitle: 'Qué aporta SegurIA en operaciones distribuidas',
    why: [
      ['Más visibilidad', 'Reúne lo importante de la operación para entender qué está pasando sin perseguir distintos sistemas.'],
      ['Alertas con contexto', 'Ayuda a distinguir qué requiere atención y entrega información útil para responder.'],
      ['Continuidad remota', 'Puede considerar operación local cuando la conectividad no es constante.'],
      ['Aprovecha lo existente', 'Integramos sistemas compatibles antes de proponer reemplazos innecesarios.'],
    ],
    coverageTitle: 'Cobertura de proyectos',
    coverageText: 'Desarrollamos proyectos en Chile. La factibilidad se valida según ubicación, alcance y condiciones reales de la operación.',
    linksTitle: 'Explora soluciones',
    contact: 'Evaluar un proyecto en Chile',
  },
  en: {
    title: 'Intelligent security in Chile | SegurIA',
    description: 'SegurIA develops projects in Chile with presence in Santiago and Valdivia for urban, rural and remote operations.',
    eyebrow: 'Chile · Santiago + Valdivia',
    heading: 'Security that stays clear, even when operations are far away.',
    intro: 'From Santiago and Valdivia we work with operations that need clear visibility, useful alerts and continuity even when distance or connectivity make daily work harder.',
    baseTitle: 'Santiago',
    baseText: 'Our operational base coordinates projects, support and commercial attention at national level.',
    southTitle: 'Valdivia',
    southText: 'Our southern presence brings SegurIA closer to fields, hotels, properties, productive operations and remote sites across Araucania, Los Rios and Los Lagos.',
    whyTitle: 'What SegurIA adds to distributed operations',
    why: [
      ['More visibility', 'Bring important operational information together so you can understand what is happening without chasing systems.'],
      ['Contextual alerts', 'Help distinguish what needs attention and provide useful information for response.'],
      ['Remote continuity', 'Local operation can be considered when connectivity is not constant.'],
      ['Use what already exists', 'We integrate compatible systems before proposing unnecessary replacements.'],
    ],
    coverageTitle: 'Project coverage',
    coverageText: 'We develop projects in Chile. Feasibility is validated according to location, scope and real operating conditions.',
    linksTitle: 'Explore solutions',
    contact: 'Assess a project in Chile',
  },
} as const

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const copy = content[locale]
  const path = `/${locale}/seguridad-inteligente-chile`

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: `${siteUrl}${path}`,
      languages: {
        'es-CL': `${siteUrl}/es/seguridad-inteligente-chile`,
        en: `${siteUrl}/en/seguridad-inteligente-chile`,
        'x-default': `${siteUrl}/es/seguridad-inteligente-chile`,
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: `${siteUrl}${path}`,
      siteName: 'SegurIA Security Suite',
      type: 'website',
    },
  }
}

export default async function ChileCoveragePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const activeLocale = locale as Locale
  const copy = content[activeLocale]

  const related = activeLocale === 'es'
    ? [
        ['/campos-inteligentes', 'Campos Inteligentes'],
        ['/hoteleria-inteligente', 'Hotelería Inteligente'],
        ['/seguridad-maritima', 'Seguridad Marítima'],
        ['/soluciones', 'Todas las soluciones'],
      ]
    : [
        ['/campos-inteligentes', 'Smart Fields'],
        ['/hoteleria-inteligente', 'Smart Hospitality'],
        ['/seguridad-maritima', 'Maritime Security'],
        ['/soluciones', 'All solutions'],
      ]

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={activeLocale} />

      <section className="relative overflow-hidden px-6 pb-20 pt-40 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(77,163,217,0.22),transparent_32%),linear-gradient(180deg,#0A1B2E,#07131F)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#4DA3D9]/30 bg-[#4DA3D9]/10 px-4 py-2 text-sm text-[#9DD2F2]"><MapPin className="h-4 w-4" />{copy.eyebrow}</div>
          <h1 className="mt-7 max-w-5xl text-balance text-4xl font-light leading-tight text-white md:text-6xl">{copy.heading}</h1>
          <p className="mt-7 max-w-4xl text-lg leading-8 text-white/70 md:text-xl">{copy.intro}</p>
        </div>
      </section>

      <section className="bg-[#123A5A] px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <article className="glass-card p-8"><Building2 className="h-8 w-8 text-[#9DD2F2]" /><h2 className="mt-5 text-2xl font-light text-white">{copy.baseTitle}</h2><p className="mt-4 leading-8 text-white/65">{copy.baseText}</p></article>
          <article className="glass-card p-8"><Mountain className="h-8 w-8 text-[#9DD2F2]" /><h2 className="mt-5 text-2xl font-light text-white">{copy.southTitle}</h2><p className="mt-4 leading-8 text-white/65">{copy.southText}</p></article>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ShieldCheck className="h-9 w-9 text-[#9DD2F2]" />
          <h2 className="mt-5 text-3xl font-light text-white md:text-4xl">{copy.whyTitle}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {copy.why.map(([title, description]) => <article key={title} className="rounded-[10px] border border-white/10 bg-white/[0.04] p-7"><h3 className="text-xl font-light text-white">{title}</h3><p className="mt-3 leading-7 text-white/62">{description}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#E6F1F8] px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div><h2 className="text-3xl font-light text-[#0A1B2E]">{copy.coverageTitle}</h2><p className="mt-4 leading-8 text-[#5C6670]">{copy.coverageText}</p></div>
          <div><h2 className="text-2xl font-light text-[#0A1B2E]">{copy.linksTitle}</h2><div className="mt-6 grid gap-3 sm:grid-cols-2">{related.map(([href, label]) => <Link key={href} href={localizedPath(activeLocale, href)} className="group flex items-center justify-between rounded-[8px] bg-white px-5 py-4 text-[#0A1B2E] shadow-sm"><span>{label}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>)}</div></div>
        </div>
      </section>

      <section className="px-6 py-16 text-center lg:px-8">
        <Link href={localizedPath(activeLocale, '/contacto')} className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-[15px]">{copy.contact}<ArrowRight className="h-4 w-4" /></Link>
      </section>

      <LocaleFooter locale={activeLocale} />
    </main>
  )
}
