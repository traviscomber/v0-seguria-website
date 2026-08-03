export const HUILO_HUILO_DEMO_CAMERAS = [
  {
    name: 'Recepción principal',
    location: 'Hotel Huilo Huilo',
    image: '/demo/huilo-huilo/lodge-entry.webp',
  },
  {
    name: 'Estacionamiento principal',
    location: 'Acceso al lodge',
    image: '/demo/huilo-huilo/parking-lodge.webp',
  },
  {
    name: 'Sendero bosque húmedo',
    location: 'Reserva biológica',
    image: '/demo/huilo-huilo/lodge-entry.webp',
  },
  {
    name: 'Cruce de río',
    location: 'Sendero turístico',
    image: '/demo/huilo-huilo/parking-lodge.webp',
  },
  {
    name: 'Área de servicio',
    location: 'Operaciones internas',
    image: '/demo/huilo-huilo/lodge-entry.webp',
  },
  {
    name: 'Mirador del lago',
    location: 'Circuito de miradores',
    image: '/demo/huilo-huilo/parking-lodge.webp',
  },
] as const

export function getHuiloHuiloDemoCamera(index: number) {
  return HUILO_HUILO_DEMO_CAMERAS[index % HUILO_HUILO_DEMO_CAMERAS.length]
}

export function isHuiloHuiloSite(...identifiers: Array<string | null | undefined>) {
  return identifiers.some((value) => value?.toLowerCase().includes('huilo huilo'))
}
