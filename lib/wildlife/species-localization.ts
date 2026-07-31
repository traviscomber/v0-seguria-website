export type SpeciesLocalization = {
  label: string
  scientificName?: string
  priority?: 'focus' | 'operational' | 'support'
}

const SPECIES_LOCALIZATION: Record<string, SpeciesLocalization> = {
  huemul: { label: 'Huemul', scientificName: 'Hippocamelus bisulcus', priority: 'focus' },
  pudu: { label: 'Pudú', scientificName: 'Pudu puda', priority: 'focus' },
  puma: { label: 'Puma', scientificName: 'Puma concolor', priority: 'focus' },
  culpeo: { label: 'Zorro culpeo', scientificName: 'Lycalopex culpaeus', priority: 'focus' },
  zorro_chilla: { label: 'Zorro chilla', scientificName: 'Lycalopex griseus', priority: 'focus' },
  zorro_gris_chileno: { label: 'Zorro gris chileno', scientificName: 'Lycalopex griseus', priority: 'focus' },
  fox: { label: 'Zorro no determinado', scientificName: 'Lycalopex sp.', priority: 'focus' },
  guina: { label: 'Guiña', scientificName: 'Leopardus guigna', priority: 'focus' },
  gato_montes: { label: 'Guiña', scientificName: 'Leopardus guigna', priority: 'focus' },
  gato_montés: { label: 'Guiña', scientificName: 'Leopardus guigna', priority: 'focus' },
  coipo: { label: 'Coipo', scientificName: 'Myocastor coypus', priority: 'focus' },
  coipu: { label: 'Coipo', scientificName: 'Myocastor coypus', priority: 'focus' },
  person: { label: 'Persona', scientificName: 'Homo sapiens', priority: 'operational' },
  vehicle: { label: 'Vehículo', priority: 'operational' },
  dog: { label: 'Perro', scientificName: 'Canis lupus familiaris', priority: 'operational' },
  cat: { label: 'Gato doméstico', scientificName: 'Felis catus', priority: 'operational' },
  livestock: { label: 'Ganado', priority: 'operational' },
  bird_unknown: { label: 'Ave no determinada', priority: 'support' },
  empty_frame: { label: 'Imagen sin fauna', priority: 'support' },
  unknown_animal: { label: 'Animal no identificado', priority: 'support' },
  guanaco: { label: 'Guanaco', scientificName: 'Lama guanicoe', priority: 'support' },
  vicuna: { label: 'Vicuña', scientificName: 'Vicugna vicugna', priority: 'support' },
  vicuña: { label: 'Vicuña', scientificName: 'Vicugna vicugna', priority: 'support' },
  nandu: { label: 'Ñandú', scientificName: 'Rhea pennata', priority: 'support' },
  ñandú: { label: 'Ñandú', scientificName: 'Rhea pennata', priority: 'support' },
  chinchilla: { label: 'Chinchilla', scientificName: 'Chinchilla lanigera', priority: 'support' },
  vizcacha: { label: 'Vizcacha', scientificName: 'Lagidium viscacia', priority: 'support' },
}

function normalizeSpeciesCode(value: string) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

export function getSpeciesLocalization(value: string | null | undefined): SpeciesLocalization {
  const raw = String(value || '').trim()
  if (!raw) return { label: 'Sin identificación' }
  return SPECIES_LOCALIZATION[normalizeSpeciesCode(raw)] || {
    label: raw.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase()),
  }
}

export function getSpeciesLabel(value: string | null | undefined) {
  return getSpeciesLocalization(value).label
}

export function getSpeciesScientificName(value: string | null | undefined) {
  return getSpeciesLocalization(value).scientificName || null
}

export function getConfidenceLevel(confidence: number | null | undefined) {
  if (typeof confidence !== 'number' || !Number.isFinite(confidence)) return 'Sin confianza informada'
  if (confidence >= 0.9) return 'Certeza alta'
  if (confidence >= 0.75) return 'Certeza media-alta'
  if (confidence >= 0.6) return 'Certeza media'
  return 'Certeza baja'
}
