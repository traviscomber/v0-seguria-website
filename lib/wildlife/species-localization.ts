export type SpeciesLocalization = {
  label: string
  scientificName?: string
}

const SPECIES_LOCALIZATION: Record<string, SpeciesLocalization> = {
  person: { label: 'Persona', scientificName: 'Homo sapiens' },
  vehicle: { label: 'Vehículo' },
  cat: { label: 'Gato doméstico', scientificName: 'Felis catus' },
  dog: { label: 'Perro', scientificName: 'Canis lupus familiaris' },
  puma: { label: 'Puma', scientificName: 'Puma concolor' },
  huemul: { label: 'Huemul', scientificName: 'Hippocamelus bisulcus' },
  pudu: { label: 'Pudú', scientificName: 'Pudu puda' },
  guanaco: { label: 'Guanaco', scientificName: 'Lama guanicoe' },
  vicuña: { label: 'Vicuña', scientificName: 'Vicugna vicugna' },
  'ñandú': { label: 'Ñandú', scientificName: 'Rhea pennata' },
  fox: { label: 'Zorro no determinado', scientificName: 'Lycalopex sp.' },
  culpeo: { label: 'Zorro culpeo', scientificName: 'Lycalopex culpaeus' },
  zorro_chilla: { label: 'Zorro chilla', scientificName: 'Lycalopex griseus' },
  zorro_gris_chileno: { label: 'Zorro gris chileno', scientificName: 'Lycalopex griseus' },
  gato_montés: { label: 'Guiña', scientificName: 'Leopardus guigna' },
  coipu: { label: 'Coipo', scientificName: 'Myocastor coypus' },
  chinchilla: { label: 'Chinchilla', scientificName: 'Chinchilla lanigera' },
  vizcacha: { label: 'Vizcacha', scientificName: 'Lagidium viscacia' },
  livestock: { label: 'Ganado' },
  unknown_animal: { label: 'Animal no identificado' },
  empty_frame: { label: 'Imagen sin fauna' },
}

function normalizeSpeciesCode(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_')
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
