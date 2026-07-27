import type { Metadata } from 'next'
import { CapabilityPage } from '@/components/capability-page'

export const metadata: Metadata = {
  title: 'Protección perimetral inteligente con IA en Chile',
  description: 'Protección perimetral con cámaras, líneas virtuales, detección de personas, vehículos y animales para campos, empresas y propiedades.',
  alternates: { canonical: '/proteccion-perimetral' },
}

export default function Page() {
  return <CapabilityPage eyebrow="Protección perimetral" title="Protege límites, accesos y zonas críticas con reglas visuales inteligentes." description="SegurIA combina cámaras compatibles, líneas virtuales, clasificación de objetos y protocolos de alerta para detectar cruces relevantes antes de que el evento llegue al centro de la operación." highlights={['Líneas virtuales y zonas de exclusión.','Clasificación de personas, vehículos y animales.','Reglas por dirección, horario y permanencia.','Alertas con evidencia para decidir más rápido.']} useCases={[{title:'Campos',description:'Controla cercos, portones, caminos interiores y sectores remotos.'},{title:'Empresas',description:'Supervisa patios, bodegas, áreas técnicas y accesos secundarios.'},{title:'Condominios',description:'Refuerza cierres perimetrales y sectores de baja visibilidad.'}]} faq={[{question:'¿Necesita sensores físicos en todo el perímetro?',answer:'No necesariamente. La analítica visual puede complementar sensores existentes o cubrir sectores definidos mediante cámaras.'},{question:'¿Puede ignorar animales pequeños?',answer:'Sí, se pueden ajustar clases, zonas y umbrales para reducir eventos no relevantes, sujeto a validación técnica.'},{question:'¿Se integra con alarmas existentes?',answer:'En muchos proyectos sí. La integración depende del sistema instalado y de las interfaces disponibles.'}]} />
}
