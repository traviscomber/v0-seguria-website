import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Anchor, Activity, FileSearch, Radio, ShieldCheck, WifiOff } from 'lucide-react'
import { LocaleFooter } from '@/components/marketing/locale-footer'
import { LocaleNavigation } from '@/components/marketing/locale-navigation'
import { isLocale, localizedPath, type Locale } from '@/lib/locales'

const siteUrl = 'https://seguria.tech'

const maritimeImages = {
  hero: "https://images.unsplash.com/photo-1601311852860-1d8f42381551?auto=format&fit=crop&q=82&w=2200",
  radar: "https://images.unsplash.com/photo-1742293466570-8aad7ae1f877?auto=format&fit=crop&q=82&w=1400",
  bridge: "https://images.unsplash.com/photo-1668257791213-200b3d9e54c4?auto=format&fit=crop&q=82&w=1400",
  systems: "https://images.unsplash.com/photo-1755427485356-15d66cadb838?auto=format&fit=crop&q=82&w=1400",
} as const

const copy = {
  es: {
    eyebrow: 'Seguridad Marítima Inteligente',
    title: 'Sabe qué está pasando en tu embarcación. En todo momento.',
    description: 'SegurIA conecta los sistemas a bordo para darte visibilidad operacional, alertas y evidencia en una sola plataforma, incluso con conectividad limitada.',
    primary: 'Solicitar asesoría',
    secondary: 'Ver la suite',
    equipmentEyebrow: 'Operación conectada',
    equipmentTitle: 'Tecnología marítima integrada donde realmente importa.',
    equipmentDescription: 'Integramos radar, sensores, electrónica de puente, comunicaciones y Edge con una arquitectura pensada para vibración, exposición, operación continua y conectividad intermitente.',
    equipmentItems: [
      ['Radar y sensores exteriores', 'Visibilidad del entorno, antenas y sensores instalados en puntos elevados y protegidos.'],
      ['Puente y monitoreo', 'Navegación, alertas y sistemas operacionales reunidos para entender el estado de la embarcación desde un solo lugar.'],
      ['Edge embarcado', 'Procesamiento local, continuidad operacional y sincronización inteligente aunque la conexión a Internet sea limitada.'],
    ],
    sectionTitle: 'De señales dispersas a una operación que se entiende en tiempo real.',
    cards: [
      ['Visibilidad operacional', 'Entiende qué está ocurriendo a bordo y concentra los eventos relevantes en una sola vista.'],
      ['Maniobras y atraques', 'Supervisa entrada, salida, atraque, desatraque y operación de cubierta con contexto operacional.'],
      ['Seguridad de tripulación', 'Da contexto a eventos en cubierta, zonas restringidas y áreas de riesgo.'],
      ['Operación desconectada', 'Edge procesa señales localmente y mantiene continuidad cuando la conectividad es limitada.'],
      ['Mantenimiento verificable', 'Relaciona intervenciones, equipos y eventos para mejorar la trazabilidad operacional.'],
      ['Inteligencia preparada para el mar', 'Una base para análisis y reglas inteligentes sobre sistemas compatibles, validada según cada instalación.'],
    ],
    note: 'Las capacidades dependen de los sensores, sistemas integrados, condiciones ambientales, conectividad y caso de uso. Cada instalación marítima se valida técnicamente antes de definir reglas de alerta.',
    finalTitle: 'Convierte lo que está pasando a bordo en decisiones útiles.',
    finalText: 'Diseñamos una arquitectura sobre sistemas compatibles existentes, con Edge, alertas, evidencia e incidentes conectados a la operación.',
  },
  en: {
    eyebrow: 'Smart Maritime Security',
    title: 'Know what is happening on your vessel. At all times.',
    description: 'SegurIA connects onboard systems to give you operational visibility, alerts and evidence in one platform, even with limited connectivity.',
    primary: 'Request advisory',
    secondary: 'View the suite',
    equipmentEyebrow: 'Connected operations',
    equipmentTitle: 'Maritime technology integrated where it actually matters.',
    equipmentDescription: 'We integrate radar, sensors, bridge electronics, communications and Edge in an architecture designed for vibration, exposure, continuous operation and intermittent connectivity.',
    equipmentItems: [
      ['Radar and exterior sensors', 'Environmental visibility, antennas and sensors installed in elevated, protected positions.'],
      ['Bridge and monitoring', 'Navigation, alerts and operational systems brought together to understand vessel status from one place.'],
      ['Onboard Edge', 'Local processing, operational continuity and intelligent synchronization even when Internet connectivity is limited.'],
    ],
    sectionTitle: 'From scattered signals to an operation you understand in real time.',
    cards: [
      ['Operational visibility', 'Understand what is happening onboard and bring relevant events into a single view.'],
      ['Maneuvers and docking', 'Monitor arrival, departure, docking, undocking and deck operations with operational context.'],
      ['Crew safety', 'Add context to events on deck, restricted zones and higher-risk areas.'],
      ['Disconnected operations', 'Edge processes signals locally and preserves continuity when connectivity is limited.'],
      ['Verifiable maintenance', 'Connect interventions, equipment and events to improve operational traceability.'],
      ['Intelligence ready for maritime use', 'A foundation for analysis and intelligent rules across compatible systems, validated for each installation.'],
    ],
    note: 'Capabilities depend on integrated sensors and systems, environmental conditions, connectivity and use case. Every maritime installation is technically validated before alert rules are defined.',
    finalTitle: 'Turn what is happening onboard into useful decisions.',
    finalText: 'We design an architecture on top of compatible existing systems, connecting Edge, alerts, evidence and incidents to the operation.',
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

const icons = [Activity, Anchor, ShieldCheck, WifiOff, Radio, FileSearch]
const equipmentImages = [maritimeImages.radar, maritimeImages.bridge, maritimeImages.systems]

export default async function MaritimeSecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const lang = locale as Locale
  const page = copy[lang]

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={lang} />
      <section className="relative flex min-h-[84vh] items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `linear-gradient(100deg, rgba(5,16,23,0.97) 0%, rgba(10,27,46,0.88) 45%, rgba(10,27,46,0.42) 100%), url('${maritimeImages.hero}')`, backgroundPosition: 'center 55%' }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(77,163,217,0.2),transparent_30%),linear-gradient(to_bottom,transparent_70%,#0A1B2E_100%)]" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4DA3D9]/30 bg-[#0A1B2E]/65 px-4 py-2 text-sm text-[#9DD2F2] backdrop-blur-md"><Anchor className="h-4 w-4" strokeWidth={1.6} /> {page.eyebrow}</div>
            <h1 className="mt-8 text-balance text-5xl font-light leading-[1.03] text-white md:text-6xl lg:text-7xl">{page.title}</h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-white/78">{page.description}</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href={localizedPath(lang, '/contacto')} className="btn-primary inline-flex items-center justify-center px-8 py-4 text-[15px]">{page.primary}</Link>
              <Link href={localizedPath(lang, '/soluciones')} className="btn-secondary inline-flex items-center justify-center px-8 py-4 text-[15px]">{page.secondary}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#071521] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">{page.equipmentEyebrow}</p>
            <h2 className="mt-4 text-balance text-3xl font-light text-white md:text-5xl">{page.equipmentTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-white/64">{page.equipmentDescription}</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {page.equipmentItems.map(([title, description], index) => (
              <article key={title} className="group overflow-hidden rounded-[12px] border border-white/10 bg-[#0A1B2E]">
                <div className="h-72 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02]" style={{ backgroundImage: `linear-gradient(to bottom, rgba(10,27,46,0.04), rgba(10,27,46,0.42)), url('${equipmentImages[index]}')` }} />
                <div className="p-7"><h3 className="text-xl font-light text-white">{title}</h3><p className="mt-3 text-[15px] leading-7 text-white/62">{description}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#123A5A] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="max-w-3xl text-balance text-3xl font-light text-white md:text-5xl">{page.sectionTitle}</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {page.cards.map(([title, description], index) => { const Icon = icons[index]; return <article key={title} className="glass-card p-8"><Icon className="h-7 w-7 text-[#9DD2F2]" strokeWidth={1.5} /><h3 className="mt-6 text-xl font-light text-white">{title}</h3><p className="mt-3 text-[15px] leading-7 text-white/65">{description}</p></article> })}
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
