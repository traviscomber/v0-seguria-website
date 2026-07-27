import type { Metadata } from 'next'
import { CapabilityPage } from '@/components/capability-page'

export const metadata: Metadata = {
  title: 'Detección de animales y fauna con cámaras e IA en Chile',
  description: 'Detecta animales y fauna con cámaras compatibles para proteger predios, ganado, propiedades y zonas rurales mediante SegurIA.',
  alternates: { canonical: '/deteccion-animales' },
}

export default function Page() {
  return <CapabilityPage eyebrow="Detección de animales" title="Distingue fauna y animales de otros eventos para alertar con mayor precisión." description="SegurIA incorpora visión artificial para separar personas, vehículos y animales, reduciendo falsas alarmas y ayudando a vigilar sectores rurales o sensibles." highlights={['Clasificación de animales en video compatible.','Reglas por especie o categoría cuando el modelo lo permite.','Alertas en corrales, perímetros, caminos y zonas de conservación.','Integración con luces, sirenas y protocolos de respuesta.']} useCases={[{title:'Protección de ganado',description:'Detecta presencia animal inusual cerca de corrales o zonas de pastoreo.'},{title:'Fauna silvestre',description:'Genera evidencia y alertas sobre actividad de fauna en sectores definidos.'},{title:'Propiedades rurales',description:'Diferencia animales de personas para reducir avisos innecesarios.'}]} faq={[{question:'¿Puede reconocer cualquier especie?',answer:'La capacidad depende del modelo disponible, la calidad de imagen y la cantidad de ejemplos representativos de esa especie.'},{question:'¿Puede diferenciar un perro de una persona?',answer:'Sí, en condiciones técnicas adecuadas la clasificación separa categorías humanas y animales.'},{question:'¿Funciona con cámaras existentes?',answer:'En muchos casos sí, siempre que entreguen un flujo de video compatible y tengan resolución, ángulo e iluminación suficientes.'}]} />
}
