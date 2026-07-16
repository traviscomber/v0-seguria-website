export interface DeviceCatalogItem {
  code: string
  label: string
  summary: string
  platforms: string[]
  notes: string[]
}

export interface DeviceCatalogGroup {
  title: string
  description: string
  items: DeviceCatalogItem[]
}

export const deviceCatalogGroups: DeviceCatalogGroup[] = [
  {
    title: 'Sensores críticos',
    description: 'Los que conviene modelar primero para alertas, monitoreo y seguridad.',
    items: [
      {
        code: 'wsdcg',
        label: 'Temperatura y humedad',
        summary: 'Sensor ambiental base para monitoreo de clima y condiciones de sitio.',
        platforms: ['Sensor', 'Binary Sensor'],
        notes: ['Útil para bodegas, salas técnicas y ambientes sensibles'],
      },
      {
        code: 'mcs',
        label: 'Puerta y ventana',
        summary: 'Detecta apertura/cierre de accesos y perímetros.',
        platforms: ['Sensor', 'Binary Sensor'],
        notes: ['Ideal para puertas, ventanas y portones'],
      },
      {
        code: 'pir',
        label: 'Movimiento',
        summary: 'Captura presencia o movimiento en zonas críticas.',
        platforms: ['Sensor', 'Binary Sensor'],
        notes: ['Sirve para alarmas, perímetros y disuasión'],
      },
      {
        code: 'sj',
        label: 'Agua',
        summary: 'Detecta fugas o presencia de agua en puntos de riesgo.',
        platforms: ['Sensor', 'Binary Sensor'],
        notes: ['Bodegas, salas de bombas y tableros'],
      },
      {
        code: 'ywbj',
        label: 'Humo',
        summary: 'Alertas tempranas de humo o incendio.',
        platforms: ['Sensor', 'Binary Sensor'],
        notes: ['Debe priorizarse en áreas cerradas'],
      },
      {
        code: 'rqbj',
        label: 'Gas',
        summary: 'Monitorea presencia de gas en recintos sensibles.',
        platforms: ['Sensor', 'Binary Sensor'],
        notes: ['Muy útil en instalaciones técnicas'],
      },
      {
        code: 'hps',
        label: 'Presencia humana',
        summary: 'Detecta ocupación o presencia continua.',
        platforms: ['Binary Sensor', 'Number'],
        notes: ['Sirve para automatizaciones y análisis de ocupación'],
      },
      {
        code: 'sos',
        label: 'Botón de emergencia',
        summary: 'Disparo manual para eventos urgentes.',
        platforms: ['Binary Sensor', 'Sensor'],
        notes: ['Botón de pánico o asistencia'],
      },
      {
        code: 'ldcg',
        label: 'Luz ambiental',
        summary: 'Mide luminosidad para automatización y control.',
        platforms: ['Binary Sensor', 'Sensor'],
        notes: ['Útil para escenas y eficiencia energética'],
      },
      {
        code: 'zd',
        label: 'Vibración',
        summary: 'Detecta vibración o manipulación física.',
        platforms: ['Sensor', 'Binary Sensor', 'Number'],
        notes: ['Buena señal de intrusión o movimiento no deseado'],
      },
      {
        code: 'co2bj',
        label: 'CO2',
        summary: 'Control de calidad de aire y ventilación.',
        platforms: ['Binary Sensor', 'Sensor'],
        notes: ['Útil para recintos cerrados'],
      },
      {
        code: 'cobj',
        label: 'Monóxido de carbono',
        summary: 'Alerta de CO para riesgo de seguridad.',
        platforms: ['Binary Sensor', 'Sensor'],
        notes: ['Prioridad alta en zonas habitables'],
      },
      {
        code: 'jqbj',
        label: 'Formaldehído',
        summary: 'Control de contaminantes o gas específico.',
        platforms: ['Binary Sensor', 'Sensor'],
        notes: ['Útil en ambientes con ventilación controlada'],
      },
      {
        code: 'jwbj',
        label: 'Metano',
        summary: 'Detecta fugas o presencia de metano.',
        platforms: ['Binary Sensor', 'Sensor'],
        notes: ['Muy útil en cocinas e instalaciones técnicas'],
      },
      {
        code: 'voc',
        label: 'Compuestos VOC',
        summary: 'Control de compuestos volátiles y calidad de aire.',
        platforms: ['Binary Sensor', 'Sensor'],
        notes: ['Puede alimentar dashboards ambientales'],
      },
      {
        code: 'ylcg',
        label: 'Presión',
        summary: 'Monitoreo de presión en sistemas y tuberías.',
        platforms: ['Binary Sensor', 'Sensor'],
        notes: ['Apto para bombas y control industrial'],
      },
    ],
  },
  {
    title: 'Equipos operativos',
    description: 'Dispositivos que completan la operación y automatización del sitio.',
    items: [
      {
        code: 'kg',
        label: 'Switch',
        summary: 'Control de encendido/apagado con estado y automatización.',
        platforms: ['Sensor', 'Switch', 'Light', 'Select'],
        notes: ['Base para relés y salidas controladas'],
      },
      {
        code: 'cz',
        label: 'Socket',
        summary: 'Toma inteligente con telemetría y control remoto.',
        platforms: ['Sensor', 'Switch'],
        notes: ['Sirve para cargas simples y monitoreo'],
      },
      {
        code: 'pc',
        label: 'Power strip',
        summary: 'Multitoma con control individual o general.',
        platforms: ['Sensor', 'Switch'],
        notes: ['Muy útil en salas técnicas'],
      },
      {
        code: 'ckmkzq',
        label: 'Apertura de garage',
        summary: 'Control de acceso vehicular y portones.',
        platforms: ['Cover', 'Switch'],
        notes: ['Clave para accesos y perímetro'],
      },
      {
        code: 'wk',
        label: 'Termostato',
        summary: 'Control térmico del sitio con lectura y mando.',
        platforms: ['Climate'],
        notes: ['Útil para salas técnicas y oficinas'],
      },
      {
        code: 'dj',
        label: 'Luz',
        summary: 'Iluminación básica con control remoto.',
        platforms: ['Light', 'Switch'],
        notes: ['Base para escenas y horarios'],
      },
      {
        code: 'tgq',
        label: 'Regulador',
        summary: 'Atenuación y control fino de iluminación.',
        platforms: ['Light', 'Number', 'Select'],
        notes: ['Bueno para iluminación ajustable'],
      },
      {
        code: 'gyd',
        label: 'Luz con sensor de movimiento',
        summary: 'Iluminación activada por presencia.',
        platforms: ['Light'],
        notes: ['Muy útil en accesos y pasillos'],
      },
      {
        code: 'ykq',
        label: 'Control remoto',
        summary: 'Mando general para equipos y escenas.',
        platforms: ['Light'],
        notes: ['Puede mapear botones y acciones'],
      },
    ],
  },
]

export const deviceCatalogHighlights = [
  'Sensores de puerta, movimiento, agua y humo',
  'Control de clima y energía',
  'Equipos para accesos y automatización',
  'Base para dashboards simples y entendibles',
]
