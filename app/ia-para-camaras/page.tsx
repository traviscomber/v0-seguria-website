import type { Metadata } from 'next'
import { CapabilityPage } from '@/components/capability-page'

export const metadata: Metadata = {
  title: 'Inteligencia artificial para cámaras de seguridad en Chile',
  description: 'Agrega detección de personas, vehículos, animales y objetos a cámaras compatibles existentes con la tecnología de SegurIA.',
  alternates: { canonical: '/ia-para-camaras' },
}

export default function Page() {
  return <CapabilityPage eyebrow="IA para cámaras" title="Convierte cámaras convencionales en sistemas que entienden lo que ocurre." description="SegurIA procesa flujos de video compatibles y agrega reconocimiento de objetos, reglas y alertas sin obligarte a renovar toda la infraestructura." highlights={['Aprovecha cámaras compatibles ya instaladas.','Distingue personas, vehículos, animales y objetos.','Reduce falsas alarmas mediante contexto y reglas.','Centraliza alertas, evidencia y respuesta.']} useCases={[{title:'Campos y predios',description:'Detección de personas, vehículos y fauna en perímetros, caminos y zonas remotas.'},{title:'Empresas',description:'Control visual de accesos, bodegas, patios y sectores restringidos.'},{title:'Propiedades',description:'Alertas relevantes en accesos, patios y zonas sensibles.'}]} faq={[{question:'¿Necesito cambiar mis cámaras?',answer:'No siempre. Primero validamos resolución, acceso al flujo de video, iluminación, ángulo y compatibilidad técnica.'},{question:'¿Qué puede reconocer?',answer:'Según el proyecto, personas, vehículos, animales, objetos y eventos definidos para cada entorno.'},{question:'¿Funciona de noche?',answer:'Puede funcionar con condiciones nocturnas adecuadas, iluminación infrarroja o cámaras preparadas para baja luz.'}]} />
}
