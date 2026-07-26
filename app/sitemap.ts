import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://seguria.tech'
  const publicRoutes = [
    '',
    '/soluciones',
    '/ia-para-camaras',
    '/deteccion-personas',
    '/deteccion-vehiculos',
    '/deteccion-animales',
    '/deteccion-pumas',
    '/proteccion-perimetral',
    '/analitica-video',
    '/modernizar-camaras-existentes',
    '/campos-inteligentes',
    '/propiedades-inteligentes',
    '/hoteleria-inteligente',
    '/integraciones',
    '/contacto',
  ]

  return publicRoutes.flatMap((route) =>
    (['es', 'en'] as const).map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : route === '/contacto' ? 0.7 : 0.9,
      alternates: {
        languages: {
          es: `${baseUrl}/es${route}`,
          en: `${baseUrl}/en${route}`,
        },
      },
    })),
  )
}
