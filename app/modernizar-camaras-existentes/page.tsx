import type { Metadata } from 'next'
import { CapabilityPage } from '@/components/capability-page'

export const metadata: Metadata = {
  title: 'Moderniza cámaras existentes con inteligencia artificial',
  description: 'Convierte cámaras de seguridad compatibles en sistemas inteligentes con detección de personas, vehículos, animales y eventos mediante SegurIA.',
  alternates: { canonical: '/modernizar-camaras-existentes' },
}

export default function Page() {
  return <CapabilityPage eyebrow="Modernización de cámaras" title="Agrega inteligencia a cámaras existentes sin partir de cero." description="SegurIA evalúa tu infraestructura actual y, cuando es compatible, incorpora analítica de video, reglas, alertas y trazabilidad sin reemplazar innecesariamente todos los equipos." highlights={['Diagnóstico de compatibilidad de cámaras y grabadores.','Migración gradual por zonas o prioridades.','Menor inversión inicial frente a un recambio completo.','Nueva capa de inteligencia sobre video existente.']} useCases={[{title:'Sistemas CCTV existentes',description:'Integra cámaras IP o flujos disponibles a una capa moderna de analítica.'},{title:'Expansión gradual',description:'Comienza por accesos y zonas críticas antes de ampliar la cobertura.'},{title:'Infraestructura mixta',description:'Combina equipos actuales con nuevas cámaras solo donde sean necesarias.'}]} faq={[{question:'¿Sirve cualquier cámara?',answer:'No todas. Revisamos resolución, codec, protocolo de video, estabilidad, ángulo, iluminación y acceso al flujo.'},{question:'¿Debo cambiar el grabador?',answer:'Depende de su compatibilidad y de cómo exponga los flujos. En algunos casos se conserva; en otros conviene integrar un equipo adicional.'},{question:'¿La IA queda dentro de la cámara?',answer:'No necesariamente. La inteligencia puede ejecutarse en infraestructura separada y analizar el video entregado por la cámara.'}]} />
}
