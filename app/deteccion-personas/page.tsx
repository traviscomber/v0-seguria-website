import type { Metadata } from 'next'
import { CapabilityPage } from '@/components/capability-page'

export const metadata: Metadata = {
  title: 'Detección de personas con cámaras e IA en Chile',
  description: 'Detecta presencia humana, cruces de perímetro y permanencia inusual con cámaras compatibles y analítica de video SegurIA.',
  alternates: { canonical: '/deteccion-personas' },
}

export default function Page() {
  return <CapabilityPage eyebrow="Detección de personas" title="Distingue presencia humana y actúa antes de que el evento escale." description="La analítica de SegurIA puede identificar personas, cruces de líneas virtuales, permanencia y actividad en zonas restringidas para generar alertas con contexto." highlights={['Detección humana sobre video compatible.','Cruces de perímetro y zonas virtuales.','Reglas por horario, sector y nivel de riesgo.','Evidencia visual asociada a cada alerta.']} useCases={[{title:'Perímetros',description:'Identifica ingresos o cruces en sectores donde no debería existir tránsito.'},{title:'Zonas restringidas',description:'Detecta presencia en bodegas, salas técnicas, patios o áreas críticas.'},{title:'Actividad fuera de horario',description:'Prioriza eventos humanos en ventanas horarias configuradas.'}]} faq={[{question:'¿Es reconocimiento facial?',answer:'No necesariamente. La detección de personas identifica presencia humana sin requerir identificar quién es la persona.'},{question:'¿Puede diferenciar una persona de un animal?',answer:'Sí, cuando la calidad del video y el modelo configurado permiten clasificar correctamente ambas categorías.'},{question:'¿Se puede limitar por horario?',answer:'Sí. Las reglas pueden activarse por horario, ubicación, dirección de cruce y criticidad.'}]} />
}
