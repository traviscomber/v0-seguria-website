import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Building2, MapPin, Mountain, Network, ShieldCheck } from 'lucide-react'
import { LocaleFooter } from '@/components/marketing/locale-footer'
import { LocaleNavigation } from '@/components/marketing/locale-navigation'
import { isLocale, locales, localizedPath, type Locale } from '@/lib/locales'

const siteUrl = 'https://seguria.tech'

const content = {
  es: {
    title: 'Seguridad inteligente en Chile | Santiago y Valdivia | SegurIA',
    description:
      'SegurIA Security Suite opera desde Santiago y cuenta con sucursal en Valdivia para el sur de Chile, con foco en operaciones, campos, hoteleria y sitios remotos.',
    eyebrow: 'Chile · Santiago + Valdivia',
    heading: 'Base operacional en Santiago. Sucursal sur en Valdivia. Una Security Suite preparada para operar donde el terreno exige mas.',
    intro:
      'SegurIA combina su base operacional en Santiago con una sucursal en Valdivia para atender el sur de Chile. Esta estructura permite abordar proyectos donde conectividad, distancia, clima e infraestructura existente hacen que la continuidad operacional importe tanto como la camara.',
    baseTitle: 'Base operacional: Santiago',
    baseText:
      'Nuestra base en Vitacura, Santiago, concentra coordinacion comercial, arquitectura, soporte y gestion nacional de proyectos. Santiago sigue siendo el centro operacional de SegurIA en Chile.',
    southTitle: 'Sucursal sur de Chile: Valdivia',
    southText:
      'Valdivia, en la Region de Los Rios, es la sucursal de SegurIA para el sur de Chile. Desde esta presencia regional reforzamos el desarrollo de proyectos en La Araucania, Los Rios y Los Lagos, especialmente en operaciones rurales, remotas, hoteleras, productivas y patrimoniales.',
    whyTitle: 'Por que SegurIA encaja en operaciones del sur',
    why: [
      ['Infraestructura existente', 'Integramos camaras, sensores, accesos y redes compatibles antes de proponer reemplazos innecesarios.'],
      ['Edge y conectividad degradada', 'El procesamiento local, buffer y reintentos permiten diseñar operaciones que no dependen de una conexion perfecta para cada evento.'],
      ['Campos y sitios remotos', 'Perimetros, portones, caminos, bodegas y zonas alejadas se integran dentro de una misma operacion auditable.'],
      ['Hoteleria y patrimonio', 'Seguridad discreta, evidencia e incidentes coordinados para lugares donde experiencia, naturaleza y operacion deben convivir.'],
    ],
    coverageTitle: 'Cobertura comercial y de proyectos',
    coverageText:
      'SegurIA desarrolla proyectos en Chile con base operacional en Santiago y sucursal sur en Valdivia. La factibilidad se valida segun alcance, infraestructura, logistica, conectividad y condiciones del sitio.',
    linksTitle: 'Explora soluciones relacionadas',
    contact: 'Evaluar un proyecto en Chile',
  },
  en: {
    title: 'Intelligent security in Chile | Santiago and Valdivia | SegurIA',
    description:
      'SegurIA Security Suite operates from Santiago and has a Valdivia branch for southern Chile, focused on operations, fields, hospitality and remote sites.',
    eyebrow: 'Chile · Santiago + Valdivia',
    heading: 'Operational base in Santiago. Southern branch in Valdivia. A Security Suite built for places where terrain demands more.',
    intro:
      'SegurIA combines its operational base in Santiago with a branch in Valdivia serving southern Chile. This structure supports projects where connectivity, distance, weather and existing infrastructure make operational continuity as important as the camera itself.',
    baseTitle: 'Operational base: Santiago',
    baseText:
      'Our base in Vitacura, Santiago, concentrates commercial coordination, architecture, support and national project management. Santiago remains SegurIA\'s operational center in Chile.',
    southTitle: 'Southern Chile branch: Valdivia',
    southText:
      'Valdivia, in the Los Rios Region, is SegurIA\'s branch for southern Chile. From this regional presence we strengthen project development across Araucania, Los Rios and Los Lagos, especially for rural, remote, hospitality, productive and heritage operations.',
    whyTitle: 'Why SegurIA fits southern operations',
    why: [
      ['Existing infrastructure', 'We integrate compatible cameras, sensors, access and networks before proposing unnecessary replacements.'],
      ['Edge and degraded connectivity', 'Local processing, buffering and retries help design operations that do not depend on a perfect connection for every event.'],
      ['Fields and remote sites', 'Perimeters, gates, roads, storage and distant zones are integrated into one auditable operation.'],
      ['Hospitality and heritage', 'Discreet security, evidence and coordinated incidents for places where experience, nature and operations must coexist.'],
    ],
    coverageTitle: 'Commercial and project coverage',
    coverageText:
      'SegurIA develops projects in Chile with an operational base in Santiago and a southern branch in Valdivia. Feasibility is validated according to scope, infrastructure, logistics, connectivity and site conditions.',
    linksTitle: 'Explore related solutions',
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
        ['/hoteleria-inteligente', 'Hoteleria Inteligente'],
        ['/integraciones', 'Integraciones'],
        ['/soluciones', 'SegurIA Security Suite'],
      ]
    : [
        ['/campos-inteligentes', 'Smart Fields'],
        ['/hoteleria-inteligente', 'Smart Hospitality'],
        ['/integraciones', 'Integrations'],
        ['/soluciones', 'SegurIA Security Suite'],
      ]

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={activeLocale} />

      <section className="relative overflow-hidden px-6 pb-24 pt-40 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(77,163,217,0.22),transparent_32%),linear-gradient(180deg,#0A1B2E,#07131F)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#4DA3D9]/30 bg-[#4DA3D9]/10 px-4 py-2 text-sm text-[#9DD2F2]">
            <MapPin className="h-4 w-4" strokeWidth={1.6} />
            {copy.eyebrow}
          </div>
          <h1 className="mt-7 max-w-5xl text-balance text-4xl font-light leading-tight text-white md:text-6xl">{copy.heading}</h1>
          <p className="mt-7 max-w-4xl text-lg leading-8 text-white/70 md:text-xl">{copy.intro}</p>
        </div>
      </section>

      <section className="bg-[#123A5A] px-6 py-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <article className="glass-card p-8">
            <Building2 className="h-8 w-8 text-[#9DD2F2]" strokeWidth={1.5} />
            <h2 className="mt-5 text-2xl font-light text-white">{copy.baseTitle}</h2>
            <p className="mt-4 leading-8 text-white/65">{copy.baseText}</p>
          </article>
          <article className="glass-card p-8">
            <Mountain className="h-8 w-8 text-[#9DD2F2]" strokeWidth={1.5} />
            <h2 className="mt-5 text-2xl font-light text-white">{copy.southTitle}</h2>
            <p className="mt-4 leading-8 text-white/65">{copy.southText}</p>
          </article>
        </div>
      </section>

      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <ShieldCheck className="h-9 w-9 text-[#9DD2F2]" strokeWidth={1.5} />
            <h2 className="mt-5 text-3xl font-light text-white md:text-4xl">{copy.whyTitle}</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {copy.why.map(([title, description]) => (
              <article key={title} className="rounded-[10px] border border-white/10 bg-white/[0.04] p-7">
                <h3 className="text-xl font-light text-white">{title}</h3>
                <p className="mt-3 leading-7 text-white/62">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#E6F1F8] px-6 py-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Network className="h-9 w-9 text-[#2B5C7E]" strokeWidth={1.5} />
            <h2 className="mt-5 text-3xl font-light text-[#0A1B2E]">{copy.coverageTitle}</h2>
            <p className="mt-4 leading-8 text-[#5C6670]">{copy.coverageText}</p>
          </div>
          <div>
            <h2 className="text-2xl font-light text-[#0A1B2E]">{copy.linksTitle}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {related.map(([href, label]) => (
                <Link key={href} href={localizedPath(activeLocale, href)} className="group flex items-center justify-between rounded-[8px] bg-white px-5 py-4 text-[#0A1B2E] shadow-sm">
                  <span>{label}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 text-center lg:px-8">
        <Link href={localizedPath(activeLocale, '/contacto')} className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
          {copy.contact}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <LocaleFooter locale={activeLocale} />
    </main>
  )
}
