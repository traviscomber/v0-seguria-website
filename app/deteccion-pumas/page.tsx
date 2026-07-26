import type { Metadata } from 'next'
import { CapabilityPage } from '@/components/capability-page'

export const metadata: Metadata = {
  title: 'Detección de pumas con cámaras e inteligencia artificial en Chile',
  description: 'Solución de detección de pumas y fauna para campos, predios y zonas rurales mediante cámaras compatibles, visión artificial y alertas SegurIA.',
  alternates: { canonical: '/deteccion-pumas' },
}

export default function Page() {
  return <CapabilityPage eyebrow="Detección de pumas" title="Detecta presencia de pumas y activa alertas antes de que el riesgo avance." description="SegurIA puede configurar analítica visual para identificar fauna relevante en zonas rurales, generar evidencia y activar protocolos de respuesta según cada predio." highlights={['Monitoreo de corrales, caminos y zonas de pastoreo.','Alertas con evidencia visual y ubicación.','Reglas diferenciadas por horario y sector.','Integración posible con iluminación, sirenas o notificaciones.']} useCases={[{title:'Ganadería',description:'Vigila sectores cercanos al ganado y prioriza eventos compatibles con presencia de depredadores.'},{title:'Predios rurales',description:'Supervisa caminos, quebradas y límites con cámaras ubicadas estratégicamente.'},{title:'Conservación',description:'Registra actividad de fauna sin depender de revisión manual continua.'}]} faq={[{question:'¿La detección de pumas es infalible?',answer:'No. Como toda visión artificial, depende de imagen, distancia, iluminación, oclusión y datos del modelo. Se valida en terreno y se ajustan umbrales.'},{question:'¿Puede funcionar de noche?',answer:'Sí, si la cámara y la iluminación nocturna entregan imágenes utilizables para el análisis.'},{question:'¿Qué ocurre cuando detecta un evento?',answer:'Puede generar una alerta con imagen o video y activar el protocolo configurado, como notificación, revisión o automatización compatible.'}]} />
}
