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
    label: 'Camara estandar',
    summary: 'Categoria principal para camaras inteligentes con vista en vivo y funciones operativas completas.',
    features: ['Vista en vivo', 'Reproduccion', 'Almacenamiento en nube', 'Centro de mensajes', 'Galeria', 'Ajustes'],
    pairing: ['EZ', 'AP', 'QR en algunos flujos'],
    notes: ['Soporta alertas de deteccion', 'Puede incluir sirena, switch, luz, numero y sensores'],
  },
  {
    code: 'dghsxj',
    label: 'Camara de bajo consumo',
    summary: 'Variante para equipos de bajo consumo, util en escenarios con bateria o ahorro de energia.',
    features: ['Vista en vivo', 'Reproduccion', 'Almacenamiento en nube', 'Alertas de deteccion'],
    pairing: ['QR', 'Flujos de bajo consumo'],
    notes: ['Equivalente funcional a camara estandar para escenarios de ahorro energetico'],
  },
]

export const cameraCommonCapabilities = [
  'Emparejamiento del dispositivo',
  'Video en vivo',
  'Administracion de bateria',
  'Alertas de timbre o puerta',
  'Almacenamiento en nube',
  'Alertas de deteccion',
]
