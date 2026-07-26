# SegurIA Puma Detection — Plan de trabajo

## Objetivo

Construir una plataforma de visión artificial capaz de usar cámaras RTSP nuevas o existentes para detectar, clasificar y seguir pumas en condiciones reales de terreno, generar evidencia verificable y activar alertas operativas por WhatsApp.

OpenAI se usará como capa de interpretación y conversación, no como detector primario de video. La detección en tiempo real se ejecutará con un modelo especializado y optimizado para edge.

## Principios técnicos

1. Inferencia local o edge siempre que sea posible.
2. No transmitir video completo a la nube salvo diagnóstico autorizado.
3. Separar detección, clasificación, tracking, reglas y comunicación.
4. No generar una alerta con una sola predicción aislada.
5. Registrar evidencia, versión de modelo, confianza y trazabilidad.
6. OpenAI solo revisará eventos dudosos o generará explicaciones operativas.
7. Medir precisión con datos reales de cámara diurna, nocturna e infrarroja.

## Arquitectura objetivo

Cámara RTSP -> Ingesta -> Detector -> Tracker -> Clasificador de especie -> Agregador temporal -> Motor de riesgo -> Evidencia -> Alertas/WhatsApp -> Dashboard

### Componentes

- Ingesta RTSP: OpenCV o GStreamer.
- Detector base: modelo YOLO exportable a ONNX.
- Clasificación fina: puma, perro, zorro, gato, ganado y desconocido.
- Tracking: ByteTrack o BoT-SORT.
- Runtime de edge: ONNX Runtime inicialmente; TensorRT para NVIDIA Jetson/GPU.
- Backend de eventos: API de SegurIA + Supabase/PostgreSQL.
- Notificaciones: agente Green API ya integrado.
- Segunda opinión: OpenAI Responses con recorte de imagen únicamente cuando la confianza sea ambigua.

## Fases

### Fase 0 — Definición y base técnica

Entregables:

- Arquitectura y contratos de datos.
- Servicio Python independiente del sitio Next.js.
- Configuración mediante variables de entorno.
- Esquema de evento y detección.
- Simulador local de eventos.
- Criterios de aceptación del piloto.

Salida: repositorio preparado para comenzar integración de cámara sin depender todavía de un modelo entrenado.

### Fase 1 — Prueba de cámaras existentes

Objetivo: determinar qué cámaras pueden reutilizarse.

Trabajo:

- Inventario de cámaras, marcas, modelos, resolución, FPS, óptica, IR y ubicación.
- Confirmar acceso RTSP/ONVIF.
- Capturar muestras de día, noche, lluvia, niebla e IR.
- Medir latencia, bitrate, pérdida de cuadros y tamaño aparente del animal.
- Clasificar cada cámara: reutilizable, reutilizable con ajuste, reemplazar.

Criterios mínimos sugeridos para piloto:

- Flujo RTSP estable.
- Resolución efectiva de al menos 1080p.
- Animal objetivo con tamaño suficiente en cuadro.
- Iluminación o IR utilizable en la zona de interés.
- Ángulo sin vegetación u obstáculos dominantes.

Salida: informe por cámara y diseño del primer punto piloto.

### Fase 2 — Dataset y etiquetado

Objetivo: crear un dataset representativo del entorno chileno y reducir falsos positivos.

Clases iniciales:

- puma
- perro
- zorro
- gato
- ganado
- persona
- vehículo
- animal_desconocido

Trabajo:

- Reunir imágenes públicas con licencias compatibles.
- Incorporar capturas propias de las cámaras piloto.
- Extraer cuadros de video sin duplicados excesivos.
- Etiquetar bounding boxes, condiciones y origen.
- Separar train/validation/test por ubicación y secuencia, no por cuadros aleatorios.
- Crear un conjunto de negativos difíciles: sombras, ramas, lluvia, perros grandes e IR.

Salida: dataset versionado y tarjeta de datos.

### Fase 3 — Baseline de detección y tracking

Objetivo: tener un pipeline reproducible antes de especializar el modelo.

Trabajo:

- Ejecutar detector preentrenado para animal/persona/vehículo.
- Integrar tracking persistente.
- Aplicar zonas de interés y exclusión.
- Agrupar múltiples cuadros en un evento único.
- Guardar snapshot, clip corto y metadatos.

Salida: eventos consistentes aunque la especie todavía sea genérica.

### Fase 4 — Modelo especializado de puma

Objetivo: distinguir puma de especies visualmente similares.

Trabajo:

- Fine-tuning del detector o detector + clasificador de recortes.
- Evaluación por día, noche, IR, distancia y oclusión.
- Calibración de confianza.
- Umbrales separados para alerta, revisión y descarte.
- Exportación ONNX.

Métricas principales:

- Recall de puma.
- Precisión de puma.
- Falsas alertas por cámara por noche.
- Latencia de detección.
- Tasa de eventos no identificados.

Salida: versión candidata del modelo con informe de evaluación.

### Fase 5 — Edge y rendimiento

Objetivo: ejecutar continuamente cerca de las cámaras.

Trabajo:

- Perfilado en CPU, GPU y Jetson.
- Conversión ONNX -> TensorRT cuando corresponda.
- FP16 inicialmente; INT8 solo después de calibración.
- Gestión de reconexión RTSP y watchdog.
- Buffer local si se pierde internet.
- Actualización segura de modelos.

Salida: imagen Docker y perfil recomendado por cantidad de cámaras.

### Fase 6 — Alertas inteligentes y OpenAI

Objetivo: convertir una detección en una acción útil.

Reglas:

- Confirmar presencia en varios cuadros.
- Usar duración, trayectoria, zona y hora.
- Elevar riesgo cerca de viviendas, corrales o personas.
- Enviar a revisión visual los eventos ambiguos.
- No usar OpenAI en cada cuadro ni en cada evento de alta confianza.

OpenAI podrá:

- Revisar un recorte ambiguo como segunda opinión.
- Resumir el evento en lenguaje operativo.
- Explicar nivel de riesgo y acciones recomendadas.
- Permitir consultas por WhatsApp sobre historial y cámaras.

Salida: alerta Green API con evidencia y escalamiento humano.

### Fase 7 — Dashboard y operación

- Estado de cámaras y edge devices.
- Timeline de eventos.
- Mapa y zonas de riesgo.
- Búsqueda por especie, cámara y fecha.
- Confirmación humana: puma/no puma/dudoso.
- Métricas de precisión en producción.
- Flujo de reentrenamiento con casos confirmados.

### Fase 8 — Piloto controlado

Duración sugerida: 4 a 8 semanas.

Criterios de éxito:

- Flujo estable de las cámaras seleccionadas.
- Evidencia suficiente en cada alerta.
- Reducción progresiva de falsos positivos.
- Alertas dentro del tiempo operativo acordado.
- Proceso claro de confirmación y escalamiento.
- Informe final con recomendación de expansión.

## Backlog inmediato

1. Crear contratos de configuración, detección y evento.
2. Crear servicio Python con health check.
3. Implementar lector RTSP resiliente.
4. Implementar detector intercambiable con modo simulado.
5. Implementar agregación temporal y tracking.
6. Publicar eventos hacia el backend SegurIA.
7. Conectar eventos confirmados con Green API.
8. Preparar protocolo de levantamiento de cámaras.

## Variables previstas

```env
VISION_DEVICE=cpu
VISION_MODEL_PATH=models/puma-detector.onnx
VISION_CONFIDENCE_THRESHOLD=0.45
VISION_ALERT_THRESHOLD=0.80
VISION_REVIEW_THRESHOLD=0.55
VISION_EVENT_MIN_FRAMES=3
VISION_EVENT_WINDOW_SECONDS=8
VISION_BACKEND_URL=https://seguria.tech/api/vision/events
VISION_BACKEND_TOKEN=
OPENAI_API_KEY=
OPENAI_VISION_REVIEW_MODEL=gpt-5-mini
```

## Decisiones pendientes

- Ubicación exacta del piloto.
- Número y modelos de cámaras disponibles.
- Acceso RTSP y credenciales técnicas.
- Hardware edge disponible.
- Política de almacenamiento de clips.
- Tiempo máximo requerido para una alerta.
- Quién confirma eventos y durante qué horario.
