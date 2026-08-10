import type { MetadataRoute } from 'next'

const siteUrl = 'https://seguria.tech'

const localizedRoutes = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/soluciones', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/campos-inteligentes', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/propiedades-inteligentes', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/hoteleria-inteligente', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/integraciones', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/preguntas-frecuentes', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contacto', changeFrequency: 'yearly', priority: 0.6 },
] as const

const capabilityRoutes = [
  { path: '/ia-para-camaras', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/deteccion-personas', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/deteccion-vehiculos', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/deteccion-animales', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/deteccion-pumas', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/proteccion-perimetral', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/analitica-video', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/modernizar-camaras-existentes', changeFrequency: 'monthly', priority: 0.8 },
] as const

const locales = ['es', 'en'] as const

type SitemapEntry = MetadataRoute.Sitemap[number]

export default function sitemap(): MetadataRoute.Sitemap {
  const localizedEntries = localizedRoutes.flatMap(({ path, changeFrequency, priority }) => {
    const alternates = {
      'es-CL': `${siteUrl}/es${path}`,
      en: `${siteUrl}/en${path}`,
      'x-default': `${siteUrl}/es${path}`,
    }

    return locales.map(
      (locale): SitemapEntry => ({
        url: `${siteUrl}/${locale}${path}`,
        changeFrequency,
        priority,
        alternates: {
          languages: alternates,
        },
      }),
    )
  })

  const capabilityEntries: SitemapEntry[] = capabilityRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    changeFrequency,
    priority,
  }))

  return [...localizedEntries, ...capabilityEntries]
}
