import type { Metadata } from 'next'
import { CapabilityPage } from '@/components/capability-page'

export const metadata: Metadata = {
  title: 'Detección de vehículos con cámaras e IA en Chile',
  description: 'Detecta autos, camiones, motos y maquinaria con analítica de video SegurIA para accesos, campos, empresas y centros logísticos.',
  alternates: { canonical: '/deteccion-vehiculos' },
}

export default function Page() {
  return <CapabilityPage eyebrow="Detección de vehículos" title="Convierte el tránsito vehicular en información útil para seguridad y operación." description="SegurIA puede clasificar vehículos y activar reglas según zona, horario y tipo de movimiento, usando cámaras compatibles ya instaladas." highlights={['Clasificación de autos, camiones, motos y maquinaria.','Alertas por ingreso, salida o permanencia.','Reglas para accesos, caminos y patios.','Registro visual para investigación y auditoría.']} useCases={[{title:'Accesos',description:'Detecta entradas y salidas vehiculares en portones y controles de acceso.'},{title:'Centros logísticos',description:'Supervisa patios, zonas de carga y circulación de camiones.'},{title:'Campos y faenas',description:'Identifica vehículos y maquinaria en caminos o sectores remotos.'}]} faq={[{question:'¿Puede leer patentes?',answer:'La lectura de patentes requiere una configuración específica y condiciones técnicas adecuadas; se evalúa por separado.'},{question:'¿Distingue camiones de automóviles?',answer:'Sí, según la calidad del video y las clases habilitadas en el modelo.'},{question:'¿Puede alertar por vehículos fuera de horario?',answer:'Sí. Las reglas pueden considerar horario, dirección, zona y duración del evento.'}]} />
}
