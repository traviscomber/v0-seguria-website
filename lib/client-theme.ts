export type ClientThemeKey = 'huilo-huilo' | 'santa-elena' | 'default'

export interface ClientTheme {
  key: ClientThemeKey
  name: string
  location: string
  badge: string
  headline: string
  description: string
  backgroundImage: string
  heroImage: string
  pageBackground: string
  overlayClass: string
  gradientClass: string
  cardClass: string
  accentTextClass: string
  accentButtonClass: string
  accentButtonTextClass: string
  focusClass: string
  vocabulary: {
    properties: string
    operation: string
    priority: string
  }
}

export const CLIENT_THEMES: Record<ClientThemeKey, ClientTheme> = {
  'huilo-huilo': {
    key: 'huilo-huilo',
    name: 'Huilo Huilo',
    location: 'Reserva Biológica Huilo Huilo',
    badge: 'Protección conectada con el entorno',
    headline: 'Seguridad que cuida cada rincón de la naturaleza.',
    description:
      'Monitoreo inteligente para proteger huéspedes, equipos, instalaciones y espacios únicos sin perder la conexión con el paisaje.',
    backgroundImage:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=88',
    heroImage:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1800&q=86',
    pageBackground: '#07140f',
    overlayClass: 'bg-[#04110c]/58',
    gradientClass: 'from-[#06130f]/95 via-[#071812]/76 to-[#071812]/35',
    cardClass: 'bg-[#07140f]/76',
    accentTextClass: 'text-emerald-200',
    accentButtonClass: 'bg-emerald-400 hover:bg-emerald-300',
    accentButtonTextClass: 'text-emerald-950',
    focusClass: 'focus:border-emerald-300/50 focus:ring-emerald-300/10',
    vocabulary: {
      properties: 'espacios',
      operation: 'reserva',
      priority: 'protección del entorno',
    },
  },
  'santa-elena': {
    key: 'santa-elena',
    name: 'Santa Elena',
    location: 'Campos y operación lechera Santa Elena',
    badge: 'Continuidad para una operación que nunca se detiene',
    headline: 'Protección inteligente desde el campo hasta la sala de ordeña.',
    description:
      'Visibilidad operacional para cuidar el ganado, las instalaciones, los equipos y la continuidad de la producción lechera.',
    backgroundImage:
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=2400&q=88',
    heroImage:
      'https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&w=1800&q=86',
    pageBackground: '#171108',
    overlayClass: 'bg-[#1a1007]/54',
    gradientClass: 'from-[#1a1208]/96 via-[#24180d]/74 to-[#24180d]/32',
    cardClass: 'bg-[#171109]/78',
    accentTextClass: 'text-amber-200',
    accentButtonClass: 'bg-amber-300 hover:bg-amber-200',
    accentButtonTextClass: 'text-amber-950',
    focusClass: 'focus:border-amber-300/50 focus:ring-amber-300/10',
    vocabulary: {
      properties: 'predios',
      operation: 'operación lechera',
      priority: 'continuidad productiva',
    },
  },
  default: {
    key: 'default',
    name: 'SegurIA',
    location: 'Centro de operaciones',
    badge: 'Protección inteligente para tu operación',
    headline: 'Todo lo importante, visible en un solo lugar.',
    description:
      'Monitoreo, evidencia y respuesta coordinada para proteger personas, instalaciones y activos críticos.',
    backgroundImage:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=88',
    heroImage:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=86',
    pageBackground: '#081725',
    overlayClass: 'bg-[#06111d]/58',
    gradientClass: 'from-[#06111d]/96 via-[#0a1b2e]/76 to-[#0a1b2e]/35',
    cardClass: 'bg-[#081725]/78',
    accentTextClass: 'text-sky-200',
    accentButtonClass: 'bg-sky-300 hover:bg-sky-200',
    accentButtonTextClass: 'text-sky-950',
    focusClass: 'focus:border-sky-300/50 focus:ring-sky-300/10',
    vocabulary: {
      properties: 'propiedades',
      operation: 'operación',
      priority: 'continuidad operacional',
    },
  },
}

function normalize(value: string | null | undefined) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
}

export function getClientTheme(...identifiers: Array<string | null | undefined>): ClientTheme {
  const haystack = identifiers.map(normalize).join(' ')

  if (haystack.includes('santa-elena') || haystack.includes('santaelena')) {
    return CLIENT_THEMES['santa-elena']
  }

  if (haystack.includes('huilo-huilo') || haystack.includes('huilohuilo')) {
    return CLIENT_THEMES['huilo-huilo']
  }

  return CLIENT_THEMES.default
}
