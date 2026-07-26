import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react'

type FAQ = { question: string; answer: string }

type CapabilityPageProps = {
  eyebrow: string
  title: string
  description: string
  highlights: string[]
  useCases: { title: string; description: string }[]
  faq: FAQ[]
}

const whatsappUrl =
  'https://wa.me/56928003961?text=Hola%20SegurIA%2C%20quisiera%20evaluar%20una%20soluci%C3%B3n%20de%20seguridad%20con%20inteligencia%20artificial.'

export function CapabilityPage({ eyebrow, title, description, highlights, useCases, faq }: CapabilityPageProps) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="relative overflow-hidden px-6 pb-20 pt-32 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(77,163,217,0.22),transparent_34%),linear-gradient(180deg,#0A1B2E,#071523)]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.24em] text-[#9DD2F2]">{eyebrow}</p>
          <h1 className="mt-5 max-w-5xl text-balance text-4xl font-light leading-tight text-white md:text-6xl">{title}</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/68 md:text-xl">{description}</p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/contacto" className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-4">
              Solicitar evaluación
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center justify-center gap-2 px-7 py-4">
              <MessageCircle className="h-4 w-4" />
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[#123A5A] py-20">
        <div className="mx-auto grid max-w-6xl gap-5 px-6 md:grid-cols-2 lg:px-8">
          {highlights.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-[10px] border border-white/10 bg-[#0A1B2E]/45 p-5">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#9DD2F2]" strokeWidth={1.6} />
              <p className="leading-7 text-white/76">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h2 className="text-3xl font-light text-white md:text-4xl">Casos de uso</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {useCases.map((item) => (
              <article key={item.title} className="rounded-[10px] border border-white/10 bg-white/[0.04] p-7">
                <h3 className="text-xl font-light text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/62">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#071523] py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 className="text-3xl font-light text-white md:text-4xl">Preguntas frecuentes</h2>
          <div className="mt-10 space-y-4">
            {faq.map((item) => (
              <article key={item.question} className="rounded-[10px] border border-white/10 bg-white/[0.04] p-6">
                <h3 className="text-lg text-white">{item.question}</h3>
                <p className="mt-3 leading-7 text-white/62">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
