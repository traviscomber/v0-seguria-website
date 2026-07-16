export interface CameraCatalogItem {
  code: string
  label: string
  summary: string
  features: string[]
  pairing: string[]
  notes: string[]
}

export const cameraCatalog: CameraCatalogItem[] = [
  {
    code: 'sp',
    label: 'Cámara estándar',
    summary: 'Categoría principal para cámaras inteligentes con vista en vivo y funciones operativas completas.',
    features: ['Vista en vivo', 'Reproducción', 'Almacenamiento en nube', 'Centro de mensajes', 'Galería', 'Ajustes'],
    pairing: ['EZ', 'AP', 'QR en algunos flujos'],
    notes: ['Soporta alertas de detección', 'Puede incluir sirena, switch, luz, número y sensores'],
  },
  {
    code: 'dghsxj',
    label: 'Cámara de bajo consumo',
    summary: 'Variante para equipos de bajo consumo, útil en escenarios con batería o ahorro de energía.',
    features: ['Vista en vivo', 'Reproducción', 'Almacenamiento en nube', 'Alertas de detección'],
    pairing: ['QR', 'Flujos de bajo consumo'],
    notes: ['La categoría aparece en integraciones oficiales y comunidad como equivalente funcional a cámara estándar'],
  },
]

export const cameraCommonCapabilities = [
  'Emparejamiento del dispositivo',
  'Video en vivo',
  'Administración de batería',
  'Alertas de timbre o puerta',
  'Almacenamiento en nube',
  'Alertas de detección',
]
