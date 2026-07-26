import type { Metadata } from 'next'
import { CapabilityPage } from '@/components/capability-page'

export const metadata: Metadata = {
  title: 'Analítica de video con inteligencia artificial en Chile',
  description: 'Transforma video continuo en eventos, alertas y evidencia con analítica de video SegurIA para seguridad integral en Chile.',
  alternates: { canonical: '/analitica-video' },
}

export default function Page() {
  return <CapabilityPage eyebrow="Analítica de video" title="Deja de revisar horas de grabación y encuentra los eventos que realmente importan." description="SegurIA analiza video compatible para clasificar objetos, detectar comportamientos definidos y convertir imágenes continuas en alertas, evidencia y trazabilidad." highlights={['Búsqueda y revisión basada en eventos.','Clasificación de personas, vehículos, animales y objetos.','Reglas visuales adaptadas a cada sitio.','Evidencia centralizada para respuesta e investigación.']} useCases={[{title:'Monitoreo operativo',description:'Prioriza eventos relevantes y reduce la revisión manual de múltiples cámaras.'},{title:'Investigación',description:'Ubica momentos importantes con mayor rapidez mediante categorías y reglas.'},{title:'Automatización',description:'Activa notificaciones o integraciones cuando se cumple una condición visual.'}]} faq={[{question:'¿Qué es la analítica de video?',answer:'Es el procesamiento automatizado de imágenes para detectar, clasificar y contextualizar eventos sin depender únicamente de observación humana continua.'},{question:'¿Puede trabajar con varias cámaras?',answer:'Sí. La arquitectura se diseña según cantidad de cámaras, resolución, conectividad y nivel de procesamiento requerido.'},{question:'¿Dónde se procesan las imágenes?',answer:'La arquitectura puede variar según el proyecto, incluyendo procesamiento local, en el borde o mediante infraestructura conectada, sujeto a requisitos técnicos y de privacidad.'}]} />
}
