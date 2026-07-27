import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LocaleFooter } from '@/components/marketing/locale-footer'
import { LocaleNavigation } from '@/components/marketing/locale-navigation'
import { isLocale, locales, type Locale } from '@/lib/locales'

const siteUrl = 'https://seguria.tech'

const content = {
  es: {
    title: 'Preguntas frecuentes sobre seguridad, cámaras, redes e IA',
    description:
      'Respuestas claras sobre instalación de cámaras, alarmas, control de acceso, redes, conectividad satelital, Starlink y analítica de video con inteligencia artificial en Chile.',
    eyebrow: 'Preguntas frecuentes',
    heading: 'Respuestas claras antes de implementar.',
    intro:
      'Conoce cómo SegurIA diseña, instala e integra infraestructura de seguridad y conectividad para empresas, campos, hoteles, condominios y propiedades en Chile.',
    contact: 'Hablar con un especialista',
    questions: [
      {
        question: '¿Qué hace SegurIA?',
        answer:
          'SegurIA diseña, instala e integra sistemas de seguridad e infraestructura tecnológica. Trabajamos con cámaras, alarmas, sensores, control de acceso, redes LAN y WiFi, conectividad satelital, Starlink, automatización y analítica con inteligencia artificial.',
      },
      {
        question: '¿Pueden trabajar con cámaras y sistemas que ya están instalados?',
        answer:
          'Sí. Evaluamos la infraestructura existente y, cuando es técnicamente conveniente, la modernizamos e integramos para agregar monitoreo, automatización, alertas y analítica de video con IA sin reemplazar innecesariamente todo el sistema.',
      },
      {
        question: '¿También instalan sistemas nuevos desde cero?',
        answer:
          'Sí. Diseñamos e instalamos soluciones completas según el lugar, los riesgos, la operación y la conectividad disponible. Esto puede incluir cámaras, grabación, alarmas, sensores, control de acceso, redes, respaldo eléctrico y conectividad remota.',
      },
      {
        question: '¿Qué puede detectar la inteligencia artificial?',
        answer:
          'Según el proyecto, la analítica puede detectar personas, vehículos, animales, objetos, cruces de perímetro, permanencias, movimientos en zonas sensibles y otros eventos definidos para la operación.',
      },
      {
        question: '¿Instalan redes, WiFi y conectividad para lugares remotos?',
        answer:
          'Sí. Diseñamos e instalamos redes cableadas e inalámbricas, enlaces para cámaras y sensores, WiFi operativo y conectividad satelital de alta velocidad, incluyendo integración de Starlink para zonas rurales o remotas.',
      },
      {
        question: '¿En qué tipos de propiedades trabajan?',
        answer:
          'Trabajamos con empresas, campos, agroindustria, hoteles, condominios, oficinas, casas, segundas viviendas, bodegas y operaciones ubicadas en zonas urbanas, rurales o remotas.',
      },
      {
        question: '¿SegurIA ofrece monitoreo y alertas?',
        answer:
          'Sí. Las soluciones pueden centralizar eventos, generar alertas con contexto, mantener trazabilidad y facilitar una respuesta más rápida. El alcance exacto depende del diseño y del servicio contratado.',
      },
      {
        question: '¿Cómo comienza un proyecto?',
        answer:
          'Comienza con una conversación y un levantamiento técnico. Revisamos objetivos, riesgos, infraestructura, energía, cobertura y conectividad; luego proponemos una arquitectura, etapas de implementación y alcance comercial.',
      },
      {
        question: '¿Dónde atiende SegurIA?',
        answer:
          'SegurIA tiene base en Vitacura, Santiago, y desarrolla proyectos en Chile. La factibilidad en cada zona se confirma según alcance, logística y condiciones técnicas.',
      },
      {
        question: '¿Cómo puedo solicitar una evaluación?',
        answer:
          'Puedes escribir a info@seguria.tech o llamar al +56 9 2800 3961 para coordinar una conversación inicial y una evaluación del proyecto.',
      },
    ],
  },
  en: {
    title: 'Frequently asked questions about security, cameras, networks and AI',
    description:
      'Clear answers about camera installation, alarms, access control, networks, satellite connectivity, Starlink and AI video analytics in Chile.',
    eyebrow: 'Frequently asked questions',
    heading: 'Clear answers before implementation.',
    intro:
      'Learn how SegurIA designs, installs and integrates security and connectivity infrastructure for businesses, farms, hotels, communities and properties in Chile.',
    contact: 'Talk to a specialist',
    questions: [
      {
        question: 'What does SegurIA do?',
        answer:
          'SegurIA designs, installs and integrates security systems and technology infrastructure, including cameras, alarms, sensors, access control, LAN and WiFi networks, satellite connectivity, Starlink, automation and AI analytics.',
      },
      {
        question: 'Can you work with existing cameras and systems?',
        answer:
          'Yes. We assess existing infrastructure and, when technically appropriate, modernize and integrate it to add monitoring, automation, alerts and AI video analytics without unnecessarily replacing the entire system.',
      },
      {
        question: 'Do you also install new systems from scratch?',
        answer:
          'Yes. We design and install complete solutions based on the site, risks, operations and available connectivity, including cameras, recording, alarms, sensors, access control, networks, power backup and remote connectivity.',
      },
      {
        question: 'What can the artificial intelligence detect?',
        answer:
          'Depending on the project, analytics can detect people, vehicles, animals, objects, perimeter crossings, dwell time, movement in sensitive areas and other events defined for the operation.',
      },
      {
        question: 'Do you install networks, WiFi and remote connectivity?',
        answer:
          'Yes. We design and install wired and wireless networks, links for cameras and sensors, operational WiFi and high-speed satellite connectivity, including Starlink integration for rural or remote locations.',
      },
      {
        question: 'What types of properties do you serve?',
        answer:
          'We work with businesses, farms, agribusiness, hotels, residential communities, offices, homes, second homes, warehouses and operations in urban, rural or remote areas.',
      },
      {
        question: 'Does SegurIA provide monitoring and alerts?',
        answer:
          'Yes. Solutions can centralize events, generate contextual alerts, maintain traceability and support faster response. The exact scope depends on the system design and contracted service.',
      },
      {
        question: 'How does a project begin?',
        answer:
          'It begins with a conversation and technical assessment. We review objectives, risks, infrastructure, power, coverage and connectivity, then propose an architecture, implementation stages and commercial scope.',
      },
      {
        question: 'Where does SegurIA operate?',
        answer:
          'SegurIA is based in Vitacura, Santiago, and develops projects across Chile. Feasibility is confirmed according to scope, logistics and technical conditions.',
      },
      {
        question: 'How can I request an assessment?',
        answer:
          'Email info@seguria.tech or call +56 9 2800 3961 to arrange an initial conversation and project assessment.',
      },
    ],
  },
} as const

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const copy = content[locale]
  const path = `/${locale}/preguntas-frecuentes`

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: path,
      languages: {
        es: '/es/preguntas-frecuentes',
        en: '/en/preguntas-frecuentes',
        'x-default': '/es/preguntas-frecuentes',
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: `${siteUrl}${path}`,
      type: 'website',
    },
  }
}

export default async function FrequentlyAskedQuestionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const activeLocale = locale as Locale
  const copy = content[activeLocale]
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: copy.questions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={activeLocale} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="border-b border-white/10 px-6 pb-20 pt-36 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">{copy.eyebrow}</p>
          <h1 className="mt-5 text-balance text-4xl font-light leading-tight text-white md:text-6xl">{copy.heading}</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/65">{copy.intro}</p>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-4">
          {copy.questions.map((item, index) => (
            <details key={item.question} className="group rounded-[10px] border border-white/10 bg-white/[0.04] p-6 open:border-[#9DD2F2]/30 open:bg-white/[0.06]">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-light text-white">
                <span>{item.question}</span>
                <span className="text-[#9DD2F2] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-5 max-w-3xl leading-8 text-white/65">{item.answer}</p>
              <span className="sr-only">FAQ {index + 1}</span>
            </details>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-4xl rounded-[10px] border border-[#9DD2F2]/25 bg-[#123A5A] p-8 text-center">
          <p className="text-xl font-light text-white">{copy.contact}</p>
          <a href={`/${activeLocale}/contacto`} className="btn-primary mt-6 inline-flex px-7 py-3 text-sm">
            {copy.contact}
          </a>
        </div>
      </section>

      <LocaleFooter locale={activeLocale} />
    </main>
  )
}
