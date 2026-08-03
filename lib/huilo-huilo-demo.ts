const HUILO_HUILO_ASSET_BASE =
  'https://nzaonaqycyyzrbxcoosk.supabase.co/storage/v1/object/public/huilo-huilo-demo'

export const HUILO_HUILO_HERO_IMAGE = `${HUILO_HUILO_ASSET_BASE}/huilo-huilo-riverside-lodge.png`

export const HUILO_HUILO_DEMO_CAMERAS = [
  {
    name: 'Recepción principal',
    location: 'Hotel Huilo Huilo',
    image: `${HUILO_HUILO_ASSET_BASE}/huilo-huilo-lodge-entry.png`,
    description: 'Acceso principal, recepción y circulación de huéspedes.',
  },
  {
    name: 'Estacionamiento principal',
    location: 'Acceso al lodge',
    image: `${HUILO_HUILO_ASSET_BASE}/huilo-huilo-parking-lodge.png`,
    description: 'Llegadas, estacionamientos y zona de descenso.',
  },
  {
    name: 'Sendero bosque húmedo',
    location: 'Reserva biológica',
    image: `${HUILO_HUILO_ASSET_BASE}/huilo-huilo-forest-trail.png`,
    description: 'Monitoreo preventivo de senderos y entorno natural.',
  },
  {
    name: 'Cruce de río',
    location: 'Sendero turístico',
    image: `${HUILO_HUILO_ASSET_BASE}/huilo-huilo-river-bridge.png`,
    description: 'Supervisión del puente y condiciones del cauce.',
  },
  {
    name: 'Área de servicio',
    location: 'Operaciones internas',
    image: `${HUILO_HUILO_ASSET_BASE}/huilo-huilo-service-yard.png`,
    description: 'Control visual de logística y operaciones internas.',
  },
  {
    name: 'Mirador del lago',
    location: 'Circuito de miradores',
    image: `${HUILO_HUILO_ASSET_BASE}/huilo-huilo-lake-overlook.png`,
    description: 'Estado del mirador, accesos y condiciones ambientales.',
  },
  {
    name: 'Circuito de cabañas',
    location: 'Zona de alojamiento',
    image: `${HUILO_HUILO_ASSET_BASE}/huilo-huilo-forest-cabins.png`,
    description: 'Recorridos peatonales y accesos a las cabañas.',
  },
  {
    name: 'Vista general del lodge',
    location: 'Ribera y hotel principal',
    image: HUILO_HUILO_HERO_IMAGE,
    description: 'Vista panorámica del complejo y su entorno inmediato.',
  },
] as const

export function getHuiloHuiloDemoCamera(index: number) {
  return HUILO_HUILO_DEMO_CAMERAS[index % HUILO_HUILO_DEMO_CAMERAS.length]
}

export function isHuiloHuiloSite(...identifiers: Array<string | null | undefined>) {
  return identifiers.some((value) => value?.toLowerCase().includes('huilo huilo'))
}
