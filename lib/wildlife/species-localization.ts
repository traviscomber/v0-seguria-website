export type SpeciesTaxonomy = {
  kingdom: string
  phylum: string
  className: string
  order: string
  family: string
  genus: string
}

export type SpeciesLocalization = {
  label: string
  scientificName?: string
  priority?: 'focus' | 'operational' | 'support'
  taxonomy?: SpeciesTaxonomy
  conservationStatus?: string
  diet?: string
  activity?: string
  localHabitat?: string
  diagnosticTraits?: string[]
  confusableWith?: string[]
  reviewPriority?: 'alta' | 'media' | 'baja'
}

const MAMMAL_BASE = {
  kingdom: 'Animalia',
  phylum: 'Chordata',
  className: 'Mammalia',
}

const SPECIES_LOCALIZATION: Record<string, SpeciesLocalization> = {
  huemul: {
    label: 'Huemul',
    scientificName: 'Hippocamelus bisulcus',
    priority: 'focus',
    taxonomy: { ...MAMMAL_BASE, order: 'Artiodactyla', family: 'Cervidae', genus: 'Hippocamelus' },
    conservationStatus: 'En peligro',
    diet: 'Herbivoro',
    activity: 'Diurna y crepuscular',
    localHabitat: 'Bosque andino patagonico, matorral montano y claros cercanos a pendientes rocosas.',
    diagnosticTraits: ['Cuerpo grande y robusto', 'Patas largas', 'Orejas grandes', 'Machos con astas bifurcadas'],
    confusableWith: ['Pudu'],
    reviewPriority: 'alta',
  },
  pudu: {
    label: 'Pudu',
    scientificName: 'Pudu puda',
    priority: 'focus',
    taxonomy: { ...MAMMAL_BASE, order: 'Artiodactyla', family: 'Cervidae', genus: 'Pudu' },
    conservationStatus: 'Casi amenazado',
    diet: 'Herbivoro',
    activity: 'Crepuscular y nocturna',
    localHabitat: 'Sotobosque denso, bosque templado lluvioso y sectores con cobertura vegetal cerrada.',
    diagnosticTraits: ['Tamano muy pequeno', 'Cuerpo compacto', 'Patas cortas', 'Astas cortas y simples en machos'],
    confusableWith: ['Huemul joven'],
    reviewPriority: 'alta',
  },
  puma: {
    label: 'Puma',
    scientificName: 'Puma concolor',
    priority: 'focus',
    taxonomy: { ...MAMMAL_BASE, order: 'Carnivora', family: 'Felidae', genus: 'Puma' },
    conservationStatus: 'Preocupacion menor',
    diet: 'Carnivoro',
    activity: 'Crepuscular y nocturna',
    localHabitat: 'Bosques, quebradas, laderas y corredores de vegetacion con baja perturbacion humana.',
    diagnosticTraits: ['Felino grande', 'Pelaje uniforme', 'Cola larga', 'Cabeza redondeada sin manchas visibles'],
    confusableWith: ['Perro grande'],
    reviewPriority: 'alta',
  },
  culpeo: {
    label: 'Zorro culpeo',
    scientificName: 'Lycalopex culpaeus',
    priority: 'focus',
    taxonomy: { ...MAMMAL_BASE, order: 'Carnivora', family: 'Canidae', genus: 'Lycalopex' },
    conservationStatus: 'Preocupacion menor',
    diet: 'Omnivoro',
    activity: 'Crepuscular y nocturna',
    localHabitat: 'Bosques abiertos, matorrales, pampas y bordes de senderos.',
    diagnosticTraits: ['Tamano mediano a grande', 'Hocico fino', 'Pelaje gris rojizo', 'Cola espesa con extremo oscuro'],
    confusableWith: ['Zorro chilla', 'Perro'],
    reviewPriority: 'alta',
  },
  zorro_chilla: {
    label: 'Zorro chilla',
    scientificName: 'Lycalopex griseus',
    priority: 'focus',
    taxonomy: { ...MAMMAL_BASE, order: 'Carnivora', family: 'Canidae', genus: 'Lycalopex' },
    conservationStatus: 'Preocupacion menor',
    diet: 'Omnivoro',
    activity: 'Crepuscular y nocturna',
    localHabitat: 'Matorral, bosque abierto y sectores de transicion entre vegetacion y pradera.',
    diagnosticTraits: ['Mas pequeno que el culpeo', 'Cuerpo liviano', 'Pelaje predominantemente gris', 'Cola larga y peluda'],
    confusableWith: ['Zorro culpeo', 'Perro'],
    reviewPriority: 'alta',
  },
  zorro_gris_chileno: {
    label: 'Zorro gris chileno',
    scientificName: 'Lycalopex griseus',
    priority: 'focus',
    taxonomy: { ...MAMMAL_BASE, order: 'Carnivora', family: 'Canidae', genus: 'Lycalopex' },
    conservationStatus: 'Preocupacion menor',
    diet: 'Omnivoro',
    activity: 'Crepuscular y nocturna',
    localHabitat: 'Matorral, bosque abierto y praderas cercanas al bosque.',
    diagnosticTraits: ['Pelaje gris', 'Hocico angosto', 'Orejas triangulares', 'Cola espesa'],
    confusableWith: ['Zorro culpeo', 'Perro'],
    reviewPriority: 'alta',
  },
  fox: {
    label: 'Zorro no determinado',
    scientificName: 'Lycalopex sp.',
    priority: 'focus',
    taxonomy: { ...MAMMAL_BASE, order: 'Carnivora', family: 'Canidae', genus: 'Lycalopex' },
    conservationStatus: 'Requiere identificacion a especie',
    diet: 'Omnivoro',
    activity: 'Principalmente crepuscular y nocturna',
    localHabitat: 'Bosque abierto, matorral, pradera y bordes de camino.',
    diagnosticTraits: ['Hocico fino', 'Orejas triangulares', 'Cola larga y peluda'],
    confusableWith: ['Zorro culpeo', 'Zorro chilla', 'Perro'],
    reviewPriority: 'alta',
  },
  guina: {
    label: 'Guina',
    scientificName: 'Leopardus guigna',
    priority: 'focus',
    taxonomy: { ...MAMMAL_BASE, order: 'Carnivora', family: 'Felidae', genus: 'Leopardus' },
    conservationStatus: 'Vulnerable',
    diet: 'Carnivoro',
    activity: 'Nocturna y crepuscular',
    localHabitat: 'Bosque templado lluvioso, sotobosque denso y corredores con alta cobertura vegetal.',
    diagnosticTraits: ['Felino pequeno', 'Pelaje moteado', 'Cola relativamente gruesa', 'Orejas redondeadas'],
    confusableWith: ['Gato domestico'],
    reviewPriority: 'alta',
  },
  gato_montes: { label: 'Guina', scientificName: 'Leopardus guigna', priority: 'focus', reviewPriority: 'alta' },
  coipo: {
    label: 'Coipo',
    scientificName: 'Myocastor coypus',
    priority: 'focus',
    taxonomy: { ...MAMMAL_BASE, order: 'Rodentia', family: 'Myocastoridae', genus: 'Myocastor' },
    conservationStatus: 'Preocupacion menor',
    diet: 'Herbivoro',
    activity: 'Crepuscular y nocturna',
    localHabitat: 'Riberas, humedales, lagunas, esteros y cursos de agua con vegetacion emergente.',
    diagnosticTraits: ['Roedor grande', 'Cuerpo robusto', 'Cola larga y cilindrica', 'Incisivos anaranjados'],
    confusableWith: ['Nutria', 'Castor'],
    reviewPriority: 'media',
  },
  coipu: { label: 'Coipo', scientificName: 'Myocastor coypus', priority: 'focus', reviewPriority: 'media' },
  person: { label: 'Persona', scientificName: 'Homo sapiens', priority: 'operational', reviewPriority: 'media' },
  vehicle: { label: 'Vehiculo', priority: 'operational', reviewPriority: 'media' },
  dog: { label: 'Perro', scientificName: 'Canis lupus familiaris', priority: 'operational', reviewPriority: 'alta' },
  cat: { label: 'Gato domestico', scientificName: 'Felis catus', priority: 'operational', reviewPriority: 'alta' },
  livestock: { label: 'Ganado', priority: 'operational', reviewPriority: 'media' },
  bird_unknown: { label: 'Ave no determinada', priority: 'support', reviewPriority: 'media' },
  empty_frame: { label: 'Imagen sin fauna', priority: 'support', reviewPriority: 'baja' },
  unknown_animal: { label: 'Animal no identificado', priority: 'support', reviewPriority: 'alta' },
  guanaco: { label: 'Guanaco', scientificName: 'Lama guanicoe', priority: 'support', reviewPriority: 'media' },
  vicuna: { label: 'Vicuna', scientificName: 'Vicugna vicugna', priority: 'support', reviewPriority: 'media' },
  nandu: { label: 'Nandu', scientificName: 'Rhea pennata', priority: 'support', reviewPriority: 'media' },
  chinchilla: { label: 'Chinchilla', scientificName: 'Chinchilla lanigera', priority: 'support', reviewPriority: 'media' },
  vizcacha: { label: 'Vizcacha', scientificName: 'Lagidium viscacia', priority: 'support', reviewPriority: 'media' },
}

function normalizeSpeciesCode(value: string) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[\s-]+/g, '_')
}

export function getSpeciesLocalization(value: string | null | undefined): SpeciesLocalization {
  const raw = String(value || '').trim()
  if (!raw) return { label: 'Sin identificacion' }
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
