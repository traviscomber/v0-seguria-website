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
    title: 'Sensores criticos',
    description: 'Los que conviene modelar primero para alertas, monitoreo y seguridad.',
    items: [
      {
        code: 'wsdcg',
        label: 'Temperatura y humedad',
        summary: 'Sensor ambiental base para monitoreo de clima y condiciones de sitio.',
        platforms: ['Sensor', 'Binary Sensor'],
        notes: ['Util para bodegas, salas tecnicas y ambientes sensibles'],
      },
      {
        code: 'mcs',
        label: 'Puerta y ventana',
        summary: 'Detecta apertura y cierre de accesos y perimetros.',
        platforms: ['Sensor', 'Binary Sensor'],
        notes: ['Ideal para puertas, ventanas y portones'],
      },
      {
        code: 'pir',
        label: 'Movimiento',
        summary: 'Captura presencia o movimiento en zonas criticas.',
        platforms: ['Sensor', 'Binary Sensor'],
        notes: ['Sirve para alarmas, perimetros y disuasion'],
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
        notes: ['Debe priorizarse en areas cerradas'],
      },
      {
        code: 'rqbj',
        label: 'Gas',
        summary: 'Monitorea presencia de gas en recintos sensibles.',
        platforms: ['Sensor', 'Binary Sensor'],
        notes: ['Muy util en instalaciones tecnicas'],
      },
      {
        code: 'hps',
        label: 'Presencia humana',
        summary: 'Detecta ocupacion o presencia continua.',
        platforms: ['Binary Sensor', 'Number'],
        notes: ['Sirve para automatizaciones y analisis de ocupacion'],
      },
      {
        code: 'sos',
        label: 'Boton de emergencia',
        summary: 'Disparo manual para eventos urgentes.',
        platforms: ['Binary Sensor', 'Sensor'],
        notes: ['Boton de panico o asistencia'],
      },
      {
        code: 'ldcg',
        label: 'Luz ambiental',
        summary: 'Mide luminosidad para automatizacion y control.',
        platforms: ['Binary Sensor', 'Sensor'],
        notes: ['Util para escenas y eficiencia energetica'],
      },
      {
        code: 'zd',
        label: 'Vibracion',
        summary: 'Detecta vibracion o manipulacion fisica.',
        platforms: ['Sensor', 'Binary Sensor', 'Number'],
        notes: ['Buena senal de intrusion o movimiento no deseado'],
      },
      {
        code: 'co2bj',
        label: 'CO2',
        summary: 'Control de calidad de aire y ventilacion.',
        platforms: ['Binary Sensor', 'Sensor'],
        notes: ['Util para recintos cerrados'],
      },
      {
        code: 'cobj',
        label: 'Monoxido de carbono',
        summary: 'Alerta de CO para riesgo de seguridad.',
        platforms: ['Binary Sensor', 'Sensor'],
        notes: ['Prioridad alta en zonas habitables'],
      },
    ],
  },
  {
    title: 'Equipos operativos',
    description: 'Dispositivos que completan la operacion y automatizacion del sitio.',
    items: [
      {
        code: 'kg',
        label: 'Switch',
        summary: 'Control de encendido y apagado con estado y automatizacion.',
        platforms: ['Sensor', 'Switch', 'Light', 'Select'],
        notes: ['Base para reles y salidas controladas'],
      },
      {
        code: 'cz',
        label: 'Socket',
        summary: 'Toma inteligente con telemetria y control remoto.',
        platforms: ['Sensor', 'Switch'],
        notes: ['Sirve para cargas simples y monitoreo'],
      },
      {
        code: 'pc',
        label: 'Power strip',
        summary: 'Multitoma con control individual o general.',
        platforms: ['Sensor', 'Switch'],
        notes: ['Muy util en salas tecnicas'],
      },
      {
        code: 'ckmkzq',
        label: 'Apertura de garage',
        summary: 'Control de acceso vehicular y portones.',
        platforms: ['Cover', 'Switch'],
        notes: ['Clave para accesos y perimetro'],
      },
      {
        code: 'wk',
        label: 'Termostato',
        summary: 'Control termico del sitio con lectura y mando.',
        platforms: ['Climate'],
        notes: ['Util para salas tecnicas y oficinas'],
      },
      {
        code: 'dj',
        label: 'Luz',
        summary: 'Iluminacion basica con control remoto.',
        platforms: ['Light', 'Switch'],
        notes: ['Base para escenas y horarios'],
      },
      {
        code: 'tgq',
        label: 'Regulador',
        summary: 'Atenuacion y control fino de iluminacion.',
        platforms: ['Light', 'Number', 'Select'],
        notes: ['Bueno para iluminacion ajustable'],
      },
      {
        code: 'gyd',
        label: 'Luz con sensor de movimiento',
        summary: 'Iluminacion activada por presencia.',
        platforms: ['Light'],
        notes: ['Muy util en accesos y pasillos'],
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
  'Control de clima y energia',
  'Equipos para accesos y automatizacion',
  'Base para dashboards simples y entendibles',
]
