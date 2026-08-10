import type { Metadata } from 'next'
import type { Locale } from '@/lib/locales'

const siteUrl = 'https://seguria.tech'

type PageKey =
  | 'solutions'
  | 'fields'
  | 'properties'
  | 'hospitality'
  | 'integrations'
  | 'contact'

type PageMetadata = {
  path: string
  title: string
  description: string
}

const pages: Record<Locale, Record<PageKey, PageMetadata>> = {
  es: {
    solutions: {
      path: '/soluciones',
      title: 'Soluciones | SegurIA Security Suite',
      description:
        'Conoce cómo SegurIA Security Suite integra seguridad física, infraestructura, incidentes, evidencia, Vision y Edge sobre sistemas existentes.',
    },
    fields: {
      path: '/campos-inteligentes',
      title: 'Seguridad para campos y predios | SegurIA Security Suite',
      description:
        'Seguridad integrada para campos, predios y operaciones remotas: cámaras, sensores, perímetros, evidencia, Vision, Edge y respuesta operacional.',
    },
    properties: {
      path: '/propiedades-inteligentes',
      title: 'Seguridad para propiedades | SegurIA Security Suite',
      description:
        'Integra cámaras, alarmas, accesos, sensores, incidentes y evidencia para propiedades, condominios, oficinas y negocios con SegurIA Security Suite.',
    },
    hospitality: {
      path: '/hoteleria-inteligente',
      title: 'Seguridad para hoteles | SegurIA Security Suite',
      description:
        'Seguridad operacional para hoteles: cámaras, accesos, alertas, incidentes, evidencia, Vision y continuidad operacional en una sola suite.',
    },
    integrations: {
      path: '/integraciones',
      title: 'Integraciones de seguridad | SegurIA Security Suite',
      description:
        'Integra cámaras, sensores, alarmas, accesos, gateways y sistemas existentes con SegurIA Security Suite y tecnología Powered by N3uralia.',
    },
    contact: {
      path: '/contacto',
      title: 'Contacto | SegurIA Security Suite',
      description:
        'Solicita una evaluación para integrar seguridad física, cámaras, sensores, incidentes, evidencia, Vision y Edge con SegurIA Security Suite.',
    },
  },
  en: {
    solutions: {
      path: '/soluciones',
      title: 'Solutions | SegurIA Security Suite',
      description:
        'See how SegurIA Security Suite unifies physical security, infrastructure, incidents, evidence, Vision and Edge on top of existing systems.',
    },
    fields: {
      path: '/campos-inteligentes',
      title: 'Security for farms and remote sites | SegurIA Security Suite',
      description:
        'Integrated security for farms and remote operations: cameras, sensors, perimeters, evidence, Vision, Edge and operational response.',
    },
    properties: {
      path: '/propiedades-inteligentes',
      title: 'Security for properties | SegurIA Security Suite',
      description:
        'Unify cameras, alarms, access, sensors, incidents and evidence for properties, communities, offices and businesses with SegurIA Security Suite.',
    },
    hospitality: {
      path: '/hoteleria-inteligente',
      title: 'Security for hotels | SegurIA Security Suite',
      description:
        'Operational security for hotels: cameras, access, alerts, incidents, evidence, Vision and operational continuity in one Security Suite.',
    },
    integrations: {
      path: '/integraciones',
      title: 'Security integrations | SegurIA Security Suite',
      description:
        'Integrate existing cameras, sensors, alarms, access systems and gateways with SegurIA Security Suite, powered by N3uralia technology.',
    },
    contact: {
      path: '/contacto',
      title: 'Contact | SegurIA Security Suite',
      description:
        'Request an assessment to integrate physical security, cameras, sensors, incidents, evidence, Vision and Edge with SegurIA Security Suite.',
    },
  },
}

export function getMarketingPageMetadata(locale: Locale, pageKey: PageKey): Metadata {
  const page = pages[locale][pageKey]
  const canonical = `${siteUrl}/${locale}${page.path}`
  const esUrl = `${siteUrl}/es${page.path}`
  const enUrl = `${siteUrl}/en${page.path}`

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical,
      languages: {
        'es-CL': esUrl,
        en: enUrl,
        'x-default': esUrl,
      },
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      siteName: 'SegurIA Security Suite',
      locale: locale === 'es' ? 'es_CL' : 'en_US',
      type: 'website',
    },
  }
}
