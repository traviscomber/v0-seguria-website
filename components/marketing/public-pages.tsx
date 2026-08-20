import Link from 'next/link'
import { Anchor, ArrowRight, BellRing, CheckCircle2, Eye, Home, Hotel, Leaf, ShieldCheck } from 'lucide-react'
import { localizedPath, type Locale } from '@/lib/locales'
import { marketing } from '@/lib/marketing-content'
import { LocaleFooter } from '@/components/marketing/locale-footer'
import { LocaleNavigation } from '@/components/marketing/locale-navigation'
import { LocalizedContactForm } from '@/components/marketing/localized-contact-form'

const benefitIcons = [Eye, BellRing, CheckCircle2]
const placeIcons = [Leaf, Home, Hotel, Anchor]

function maritimePage(locale: Locale) {
  return locale === 'es'
    ? {
        eyebrow: 'Seguridad Marítima Inteligente',
        title: 'Sabe qué está pasando en tu embarcación.',
        description: 'Supervisa la operación, recibe alertas importantes y mantén contexto incluso con conectividad limitada.',
        href: '/seguridad-maritima',
        image: "linear-gradient(to bottom, rgba(10, 27, 46, 0.28), rgba(10, 27, 46, 0.9)), url('https://images.unsplash.com/photo-1601311852860-1d8f42381551?auto=format&fit=crop&q=82&w=2200')",
      }
    : {
        eyebrow: 'Smart Maritime Security',
        title: 'Know what is happening on your vessel.',
        description: 'Monitor operations, receive important alerts and keep context even when connectivity is limited.',
        href: '/seguridad-maritima',
        image: "linear-gradient(to bottom, rgba(10, 27, 46, 0.28), rgba(10, 27, 46, 0.9)), url('https://images.unsplash.com/photo-1601311852860-1d8f42381551?auto=format&fit=crop&q=82&w=2200')",
      }
}

export function PublicHomePage({ locale }: { locale: Locale }) {
  const copy = marketing[locale]
  const places = [copy.routes.fields, copy.routes.properties, copy.routes.hospitality, maritimePage(locale)]

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={locale} />

      <section className="relative flex min-h-[86vh] items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(105deg, rgba(10,27,46,0.97) 0%, rgba(10,27,46,0.82) 48%, rgba(10,27,46,0.38) 100%), url('https://images.unsplash.com/photo-1757358598889-1381c175d541?q=70&w=1800&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(77,163,217,0.16),transparent_28%),linear-gradient(to_bottom,transparent_72%,#0A1B2E_100%)]" />
        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4DA3D9]/30 bg-[#4DA3D9]/12 px-4 py-2 text-sm text-[#9DD2F2]">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.6} /> {copy.home.eyebrow}
            </div>
            <h1 className="mt-8 text-balance text-5xl font-light leading-[1.02] text-white md:text-6xl lg:text-7xl">{copy.home.title}</h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-white/76">{copy.home.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {copy.home.chips.map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/72">{item}</span>)}
            </div>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href={localizedPath(locale, '/soluciones')} className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-[15px]">{copy.home.primary}<ArrowRight className="h-4 w-4" /></Link>
              <Link href={localizedPath(locale, '/contacto')} className="btn-secondary inline-flex items-center justify-center px-8 py-4 text-[15px]">{copy.home.secondary}</Link>
            </div>
          </div>
          <HeroPanel locale={locale} />
        </div>
      </section>

      <section className="bg-[#123A5A] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">{copy.home.sectionEyebrow}</p>
            <h2 className="mt-4 text-balance text-3xl font-light text-white md:text-5xl">{copy.home.sectionTitle}</h2>
            <p className="mt-5 text-lg leading-8 text-white/64">{copy.home.sectionDescription}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {copy.home.benefits.map((benefit, index) => {
              const Icon = benefitIcons[index]
              return (
                <article key={benefit.title} className="glass-card p-8">
                  <Icon className="h-7 w-7 text-[#9DD2F2]" strokeWidth={1.5} />
                  <h3 className="mt-6 text-xl font-light text-white">{benefit.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-white/64">{benefit.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#E6F1F8] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-[#2B5C7E]">{copy.home.placesEyebrow}</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-light text-[#0A1B2E] md:text-4xl">{copy.home.placesTitle}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {places.map((place, index) => {
              const Icon = placeIcons[index]
              return (
                <Link key={place.href} href={localizedPath(locale, place.href)} className="glass-card-light group p-7 transition-all duration-300 hover:-translate-y-1">
                  <Icon className="h-7 w-7 text-[#2B5C7E]" strokeWidth={1.5} />
                  <h3 className="mt-5 text-xl font-light text-[#0A1B2E]">{place.eyebrow}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5C6670]">{place.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[15px] text-[#2B5C7E]">{copy.solutions.cta}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1B2E] py-20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-balance text-3xl font-light text-white md:text-4xl">{copy.home.finalTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/62">{copy.home.finalDescription}</p>
          <Link href={localizedPath(locale, '/contacto')} className="btn-primary mt-9 inline-flex items-center gap-2 px-8 py-4 text-[15px]">{copy.footer.askAdvice}<ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <LocaleFooter locale={locale} />
    </main>
  )
}

export function PublicSolutionsPage({ locale }: { locale: Locale }) {
  const copy = marketing[locale]
  const pages = [copy.routes.fields, copy.routes.properties, copy.routes.hospitality, maritimePage(locale)]

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={locale} />
      <section className="relative flex min-h-[52vh] items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(to bottom, rgba(10,27,46,0.62), rgba(10,27,46,0.96)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=70&w=1400&auto=format&fit=crop')" }} />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center lg:px-8">
          <h1 className="text-balance text-4xl font-light text-white md:text-6xl">{copy.solutions.heroTitle}</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/70 md:text-xl">{copy.solutions.heroDescription}</p>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-light text-white md:text-4xl">{copy.solutions.sectionTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-white/62">{copy.solutions.sectionDescription}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {pages.map((page) => (
              <Link key={page.href} href={localizedPath(locale, page.href)} className="group relative flex min-h-[360px] items-end overflow-hidden rounded-[10px] border border-white/10 bg-cover bg-center p-8 transition-all hover:border-[#9DD2F2]/40" style={{ backgroundImage: page.image }}>
                <div className="relative max-w-xl">
                  <p className="inline-flex rounded-[5px] bg-[#4DA3D9]/20 px-4 py-2 text-sm text-[#9DD2F2]">{page.eyebrow}</p>
                  <h3 className="mt-5 text-balance text-3xl font-light leading-tight text-white md:text-4xl">{page.title}</h3>
                  <p className="mt-4 text-[15px] leading-7 text-white/70">{page.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[#9DD2F2]">{copy.solutions.cta}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <LocaleFooter locale={locale} />
    </main>
  )
}

export function PublicDetailPage({ locale, routeKey }: { locale: Locale; routeKey: 'fields' | 'properties' | 'hospitality' }) {
  const copy = marketing[locale]
  const page = copy.routes[routeKey]

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={locale} />
      <section className="relative flex min-h-[72vh] items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: page.image }} />
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center lg:px-8">
          <p className="inline-flex rounded-[5px] bg-[#4DA3D9]/20 px-4 py-2 text-sm text-[#9DD2F2]">{page.eyebrow}</p>
          <h1 className="mt-6 text-balance text-4xl font-light leading-tight text-white md:text-6xl">{page.title}</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/72 md:text-xl">{page.description}</p>
          <Link href={localizedPath(locale, '/contacto')} className="btn-primary mt-9 inline-flex px-8 py-4 text-[15px]">{copy.footer.askAdvice}</Link>
        </div>
      </section>

      <section className="bg-[#123A5A] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-3xl font-light text-white md:text-4xl">{copy.detail.applications}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {page.cards.map(([title, description]) => (
              <article key={title} className="glass-card p-8">
                <h3 className="text-xl font-light text-white">{title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-white/62">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#E6F1F8] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-3xl font-light text-[#0A1B2E] md:text-4xl">{copy.detail.process}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {copy.detail.processItems.map(([step, title, description]) => (
              <article key={step} className="glass-card-light p-6">
                <span className="text-sm text-[#4DA3D9]">{step}</span>
                <h3 className="mt-3 text-lg font-light text-[#0A1B2E]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5C6670]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 className="text-3xl font-light text-white md:text-4xl">{copy.detail.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/62">{copy.detail.ctaText}</p>
          <Link href={localizedPath(locale, '/contacto')} className="btn-primary mt-9 inline-flex px-8 py-4 text-[15px]">{copy.footer.askAdvice}</Link>
        </div>
      </section>
      <LocaleFooter locale={locale} />
    </main>
  )
}

export function PublicIntegrationsPage({ locale }: { locale: Locale }) {
  const copy = marketing[locale]
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={locale} />
      <section className="px-6 pb-24 pt-40 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">{copy.footer.platform}</p>
            <h1 className="mt-6 max-w-3xl text-balance text-4xl font-light leading-tight text-white md:text-6xl">{copy.integrations.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">{copy.integrations.description}</p>
            <Link href={localizedPath(locale, '/contacto')} className="btn-primary mt-9 inline-flex items-center gap-2 px-8 py-4 text-[15px]">{copy.footer.askAdvice}<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-4">
            {copy.integrations.items.map((item) => <div key={item} className="flex items-start gap-3 rounded-[10px] border border-white/10 bg-white/[0.05] p-5"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#9DD2F2]" /><span className="text-white/76">{item}</span></div>)}
          </div>
        </div>
      </section>
      <LocaleFooter locale={locale} />
    </main>
  )
}

export function PublicContactPage({ locale }: { locale: Locale }) {
  const copy = marketing[locale]
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={locale} />
      <section className="px-6 pt-36 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 pb-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">{copy.footer.contact}</p>
            <h1 className="mt-5 max-w-2xl text-balance text-4xl font-light leading-tight text-white md:text-5xl">{copy.contact.title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/68">{copy.contact.description}</p>
          </div>
          <LocalizedContactForm locale={locale} />
        </div>
      </section>
      <LocaleFooter locale={locale} />
    </main>
  )
}

function HeroPanel({ locale }: { locale: Locale }) {
  const copy = marketing[locale]
  return (
    <div className="rounded-[12px] border border-white/10 bg-[#071521]/78 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="rounded-[10px] border border-white/10 bg-[#0A1B2E]/92 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">{copy.home.panelBadge}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {copy.home.proof.map((point) => (
            <div key={point.label} className="rounded-[8px] bg-white/[0.06] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/42">{point.label}</p>
              <p className="mt-2 text-xl font-light text-white">{point.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {copy.home.chips.map((item) => <div key={item} className="flex items-center gap-3 text-white/72"><CheckCircle2 className="h-5 w-5 text-[#9DD2F2]" /><span>{item}</span></div>)}
        </div>
      </div>
    </div>
  )
}
