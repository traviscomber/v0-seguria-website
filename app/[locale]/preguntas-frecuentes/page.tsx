import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LocaleFooter } from '@/components/marketing/locale-footer'
import { LocaleNavigation } from '@/components/marketing/locale-navigation'
import { isLocale, locales, type Locale } from '@/lib/locales'

const siteUrl = 'https://seguria.tech'

const content = {
  es: {
    title: 'Preguntas frecuentes | SegurIA',
    description: 'Respuestas simples sobre cómo funciona SegurIA, qué puede integrar y cómo comienza un proyecto.',
    eyebrow: 'Preguntas frecuentes',
    heading: 'Lo esencial antes de empezar.',
    intro: 'SegurIA parte por entender tu operación. Después definimos qué conectar, qué alertas importan y cómo debe responder tu equipo.',
    contact: 'Hablar con SegurIA',
    questions: [
      {
        question: '¿Qué hace SegurIA?',
        answer: 'SegurIA reúne información de tu operación en una sola experiencia para que puedas ver qué está pasando, recibir alertas cuando algo requiere atención y responder con más contexto.',
      },
      {
        question: '¿Pueden aprovechar sistemas que ya tengo instalados?',
        answer: 'Sí. Primero revisamos lo que ya existe y reutilizamos los sistemas compatibles que aportan valor. Solo proponemos cambios cuando son necesarios para cumplir el objetivo de la operación.',
      },
      {
        question: '¿Qué tipo de alertas puede generar?',
        answer: 'Depende del lugar y del caso de uso. Definimos alertas sobre eventos que realmente importan para tu operación, evitando convertir cada señal en una notificación.',
      },
      {
        question: '¿Funciona en lugares con conectividad limitada?',
        answer: 'Sí, cuando el diseño lo requiere. Podemos considerar procesamiento local y continuidad operacional para que ciertas funciones no dependan de una conexión permanente.',
      },
      {
        question: '¿En qué tipos de operaciones trabajan?',
        answer: 'Trabajamos con campos, propiedades, hoteles, embarcaciones y otras operaciones donde sea importante tener visibilidad, alertas claras y una respuesta ordenada.',
      },
      {
        question: '¿Cómo comienza un proyecto?',
        answer: 'Comienza con una conversación. Entendemos qué necesitas controlar, qué riesgos importan y qué sistemas ya existen. Luego proponemos un alcance claro y una forma de implementarlo por etapas.',
      },
      {
        question: '¿Dónde trabaja SegurIA?',
        answer: 'Desarrollamos proyectos en Chile. La factibilidad se confirma según el alcance, la ubicación y las condiciones de cada operación.',
      },
    ],
  },
  en: {
    title: 'Frequently asked questions | SegurIA',
    description: 'Simple answers about how SegurIA works, what it can integrate and how a project begins.',
    eyebrow: 'Frequently asked questions',
    heading: 'The essentials before you start.',
    intro: 'SegurIA starts by understanding your operation. Then we define what to connect, which alerts matter and how your team should respond.',
    contact: 'Talk to SegurIA',
    questions: [
      {
        question: 'What does SegurIA do?',
        answer: 'SegurIA brings operational information into one experience so you can see what is happening, receive alerts when something needs attention and respond with better context.',
      },
      {
        question: 'Can you use systems I already have?',
        answer: 'Yes. We first assess what is already in place and reuse compatible systems that add value. We only propose changes when they are necessary to meet the operational goal.',
      },
      {
        question: 'What kind of alerts can it generate?',
        answer: 'It depends on the site and use case. We define alerts around events that actually matter to your operation instead of turning every signal into a notification.',
      },
      {
        question: 'Does it work with limited connectivity?',
        answer: 'Yes, when the design requires it. We can include local processing and operational continuity so selected functions do not depend on a permanent connection.',
      },
      {
        question: 'What types of operations do you work with?',
        answer: 'We work with fields, properties, hotels, vessels and other operations where visibility, clear alerts and organized response matter.',
      },
      {
        question: 'How does a project begin?',
        answer: 'It begins with a conversation. We understand what you need to control, which risks matter and what systems already exist. Then we propose a clear scope and phased implementation path.',
      },
      {
        question: 'Where does SegurIA operate?',
        answer: 'We develop projects in Chile. Feasibility is confirmed according to scope, location and the conditions of each operation.',
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
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={activeLocale} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="border-b border-white/10 px-6 pb-16 pt-36 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">{copy.eyebrow}</p>
          <h1 className="mt-5 text-balance text-4xl font-light leading-tight text-white md:text-6xl">{copy.heading}</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/65">{copy.intro}</p>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8">
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

        <div className="mx-auto mt-12 max-w-4xl text-center">
          <a href={`/${activeLocale}/contacto`} className="btn-primary inline-flex px-7 py-3 text-sm">{copy.contact}</a>
        </div>
      </section>

      <LocaleFooter locale={activeLocale} />
    </main>
  )
}
