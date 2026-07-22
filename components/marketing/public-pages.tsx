import Link from 'next/link'
import { ArrowRight, BellRing, Camera, CheckCircle2, Clock, Eye, FileSearch, Home, Hotel, Leaf, Moon, ShieldCheck, Siren } from 'lucide-react'
import { localizedPath, type Locale } from '@/lib/locales'
import { marketing } from '@/lib/marketing-content'
import { LocaleFooter } from '@/components/marketing/locale-footer'
import { LocaleNavigation } from '@/components/marketing/locale-navigation'
import { LocalizedContactForm } from '@/components/marketing/localized-contact-form'

const benefitIcons = [Moon, Siren, FileSearch]
const placeIcons = [Leaf, Home, Hotel]

export function PublicHomePage({ locale }: { locale: Locale }) {
  const copy = marketing[locale]
  const places = [copy.routes.fields, copy.routes.properties, copy.routes.hospitality]

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={locale} />

      <section className="relative flex min-h-screen items-start overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "linear-gradient(110deg, rgba(10, 27, 46, 0.96) 0%, rgba(10, 27, 46, 0.78) 42%, rgba(10, 27, 46, 0.42) 100%), url('https://images.unsplash.com/photo-1757358598889-1381c175d541?q=70&w=1800&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(77,163,217,0.22),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(157,210,242,0.16),transparent_28%),linear-gradient(to_bottom,transparent_62%,#0A1B2E_100%)]" />
        <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-[#0A1B2E] to-transparent" />

        <div className="relative z-10 mx-auto grid w-full max-w-[1480px] items-start gap-12 px-6 pb-16 pt-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(500px,0.78fr)] lg:gap-16 lg:px-8 lg:pt-24 xl:grid-cols-[minmax(0,0.86fr)_minmax(560px,0.74fr)] xl:gap-20 xl:pt-28">
          <div className="flex max-w-3xl flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#4DA3D9]/30 bg-[#4DA3D9]/12 px-4 py-2 text-sm text-[#9DD2F2]">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.6} />
              {copy.home.eyebrow}
            </div>
            <h1 className="mt-8 max-w-[720px] text-balance text-5xl font-light leading-[1.02] text-white md:text-[4rem] lg:text-[4.7rem]">
              {copy.home.title}
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-xl leading-9 text-white/78">{copy.home.description}</p>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {copy.home.chips.map((item) => (
                <div key={item} className="rounded-[8px] border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white/76 backdrop-blur-md">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href={localizedPath(locale, '/soluciones')} className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-[15px]">
                {copy.home.primary}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={localizedPath(locale, '/contacto')} className="btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4 text-[15px]">
                {copy.home.secondary}
              </Link>
            </div>
          </div>

          <HeroPanel locale={locale} />
        </div>
      </section>

      <section className="bg-[#123A5A] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">{copy.home.sectionEyebrow}</p>
            <h2 className="mt-4 text-balance text-3xl font-light text-white md:text-4xl">{copy.home.sectionTitle}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/64">{copy.home.sectionDescription}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {copy.home.benefits.map((benefit, index) => {
              const Icon = benefitIcons[index]
              return (
                <div key={benefit.title} className="glass-card p-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#4DA3D9]/18 text-[#9DD2F2]">
                    <Icon className="h-6 w-6" strokeWidth={1.6} />
                  </div>
                  <h3 className="text-xl font-light text-white">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/65">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">{copy.home.whyEyebrow}</p>
            <h2 className="mt-4 text-balance text-3xl font-light text-white md:text-4xl">{copy.home.whyTitle}</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/62">{copy.home.whyDescription}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.home.wins.map((win) => (
              <div key={win} className="flex items-start gap-3 rounded-[8px] border border-white/10 bg-white/5 p-5">
                <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-[#9DD2F2]" strokeWidth={1.7} />
                <span className="text-[15px] leading-7 text-white/75">{win}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#E6F1F8] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-[#2B5C7E]">{copy.home.placesEyebrow}</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-light text-[#0A1B2E] md:text-4xl">{copy.home.placesTitle}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {places.map((place, index) => {
              const Icon = placeIcons[index]
              return (
                <Link key={place.href} href={localizedPath(locale, place.href)} className="glass-card-light group p-8 transition-all duration-300 hover:-translate-y-1">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#2B5C7E]/10 text-[#2B5C7E]">
                    <Icon className="h-6 w-6" strokeWidth={1.6} />
                  </div>
                  <h3 className="text-xl font-light text-[#0A1B2E]">{place.eyebrow}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5C6670]">{place.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[15px] text-[#2B5C7E]">
                    {copy.solutions.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <Clock className="mx-auto mb-6 h-10 w-10 text-[#9DD2F2]" strokeWidth={1.4} />
          <h2 className="text-balance text-3xl font-light text-white md:text-4xl">{copy.home.finalTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/62">{copy.home.finalDescription}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={localizedPath(locale, '/contacto')} className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              {copy.footer.askAdvice}
            </Link>
            <Link href={localizedPath(locale, '/soluciones')} className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              {copy.home.primary}
            </Link>
          </div>
        </div>
      </section>

      <LocaleFooter locale={locale} />
    </main>
  )
}

export function PublicSolutionsPage({ locale }: { locale: Locale }) {
  const copy = marketing[locale]
  const pages = [copy.routes.fields, copy.routes.properties, copy.routes.hospitality]

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <LocaleNavigation locale={locale} />
      <section className="relative flex min-h-[64vh] items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(to bottom, rgba(10, 27, 46, 0.54), rgba(10, 27, 46, 0.93)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=70&w=1400&auto=format&fit=crop')" }} />
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h1 className="text-balance text-4xl font-light leading-tight text-white md:text-5xl lg:text-6xl">{copy.solutions.heroTitle}</h1>
          <p className="mx-auto mt-6 max-w-3xl text-balance text-lg leading-8 text-white/72 md:text-xl">{copy.solutions.heroDescription}</p>
        </div>
      </section>
      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-balance text-3xl font-light text-white md:text-4xl">{copy.solutions.sectionTitle}</h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/62">{copy.solutions.sectionDescription}</p>
          </div>
          <div className="grid gap-6">
            {pages.map((page) => (
              <Link key={page.href} href={localizedPath(locale, page.href)} className="group relative flex min-h-[420px] items-end overflow-hidden rounded-[8px] border border-white/10 bg-cover bg-center p-8 transition-all duration-300 hover:border-[#9DD2F2]/45 md:p-12" style={{ backgroundImage: page.image }}>
                <div className="relative max-w-3xl">
                  <p className="mb-5 inline-flex rounded-[5px] bg-[#4DA3D9]/20 px-4 py-2 text-sm text-[#9DD2F2]">{page.eyebrow}</p>
                  <h3 className="text-balance text-4xl font-light leading-tight text-white md:text-5xl">{page.title}</h3>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">{page.description}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-[15px] text-[#9DD2F2]">
                    {copy.solutions.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
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
      <section className="relative flex min-h-[84vh] items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: page.image }} />
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-[5px] bg-[#4DA3D9]/20 px-4 py-2 text-sm text-[#9DD2F2]">
            {page.eyebrow}
          </div>
          <h1 className="text-balance text-4xl font-light leading-tight text-white md:text-5xl lg:text-6xl">{page.title}</h1>
          <p className="mx-auto mt-6 max-w-3xl text-balance text-lg leading-relaxed text-white/72 md:text-xl">{page.description}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={localizedPath(locale, '/contacto')} className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              {copy.footer.askAdvice}
            </Link>
            <Link href={localizedPath(locale, '/soluciones')} className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              {copy.footer.seeSolution}
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-[#123A5A] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-3xl font-light text-white md:text-4xl">{copy.detail.applications}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {page.cards.map(([title, description]) => (
              <div key={title} className="glass-card p-8">
                <h3 className="mb-3 text-xl font-light text-white">{title}</h3>
                <p className="text-[15px] leading-relaxed text-white/60">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#E6F1F8] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-3xl font-light text-[#0A1B2E] md:text-4xl">{copy.detail.process}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {copy.detail.processItems.map(([step, title, description]) => (
              <div key={step} className="glass-card-light p-6 text-center">
                <div className="mb-4 text-sm font-light text-[#4DA3D9]">{step}</div>
                <h3 className="mb-2 text-lg font-light text-[#0A1B2E]">{title}</h3>
                <p className="text-[14px] leading-relaxed text-[#6B7280]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-balance text-3xl font-light text-white md:text-4xl">{copy.detail.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/60">{copy.detail.ctaText}</p>
          <Link href={localizedPath(locale, '/contacto')} className="btn-primary mt-10 inline-flex px-8 py-4 text-[15px]">
            {copy.footer.askAdvice}
          </Link>
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
      <section className="relative overflow-hidden px-6 py-32 pt-40 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(77,163,217,0.2),transparent_32%),linear-gradient(180deg,rgba(10,27,46,0.94),rgba(10,27,46,0.98))]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">{copy.footer.platform}</p>
            <h1 className="mt-6 max-w-3xl text-balance text-4xl font-light leading-tight text-white md:text-5xl lg:text-6xl">{copy.integrations.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">{copy.integrations.description}</p>
            <Link href={localizedPath(locale, '/contacto')} className="btn-primary mt-10 inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              {copy.footer.askAdvice}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4">
            {copy.integrations.items.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#9DD2F2]" strokeWidth={1.6} />
                <span className="text-white/78">{item}</span>
              </div>
            ))}
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
      <section className="relative overflow-hidden px-6 pt-32 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(77,163,217,0.16),transparent_32%),linear-gradient(180deg,rgba(10,27,46,0.95),rgba(10,27,46,0.99))]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 pb-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4DA3D9]/30 bg-[#4DA3D9]/12 px-4 py-2 text-sm text-[#9DD2F2]">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.6} />
              {copy.footer.contact}
            </div>
            <h1 className="max-w-2xl text-balance text-4xl font-light leading-tight text-white md:text-5xl">{copy.contact.title}</h1>
            <p className="max-w-xl text-lg leading-8 text-white/68">{copy.contact.description}</p>
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
    <div className="relative flex justify-end lg:pl-6 xl:translate-x-8 2xl:translate-x-14">
      <div className="w-full max-w-[580px] rounded-[12px] border border-white/12 bg-[#061525]/76 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-6 xl:max-w-[620px]">
        <div className="overflow-hidden rounded-[10px] border border-white/10 bg-[#0A1B2E]">
          <div
            className="relative h-56 overflow-hidden bg-cover bg-center md:h-72"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(10, 27, 46, 0.12), rgba(10, 27, 46, 0.82)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=70&w=1400&auto=format&fit=crop')",
            }}
          >
            <div className="absolute left-5 top-5 rounded-full border border-[#9DD2F2]/30 bg-[#0A1B2E]/70 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#9DD2F2] backdrop-blur">
              {copy.home.panelBadge}
            </div>
            <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-3">
              {copy.home.proof.map((point) => (
                <div key={point.label} className="rounded-[8px] border border-white/10 bg-[#0A1B2E]/72 p-4 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/42">{point.label}</p>
                  <p className="mt-2 text-xl font-light text-white">{point.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-px bg-white/10 md:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-[#0A1B2E]/95 p-5">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.6} />
                <p className="text-sm uppercase tracking-[0.2em] text-white/50">Dashboard</p>
              </div>
              <div className="mt-5 space-y-3">
                {copy.home.proof.map((item, index) => (
                  <div key={item.label} className="flex items-center justify-between rounded-[8px] bg-white/[0.06] px-4 py-3">
                    <span className="text-sm text-white/74">{item.label}</span>
                    <span className="text-xs text-[#9DD2F2]">0{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0A1B2E]/95 p-5">
              <div className="flex items-center gap-3">
                <Camera className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.6} />
                <p className="text-sm uppercase tracking-[0.2em] text-white/50">Signals</p>
              </div>
              <div className="mt-5 space-y-4">
                {copy.home.chips.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#9DD2F2]" strokeWidth={1.6} />
                    <p className="text-[15px] leading-7 text-white/74">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
