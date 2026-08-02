# SegurIA Biodiversidad — Roadmap Huilo Huilo

## Objetivo

Implementar una solución de bajo costo para apoyar a Fundación Huilo Huilo en el monitoreo y preservación de huemul, pudú, puma, zorros, guiña y otras especies mediante cámaras trampa, análisis asistido por IA y validación humana.

La primera versión reutiliza la infraestructura actual de SegurIA y el proveedor OpenAI Vision ya integrado. Las cámaras, conectividad, instalación y mantenimiento de terreno se cotizan por separado.

## Principios del proyecto

- La IA propone; el especialista confirma.
- Ninguna predicción se considera registro científico confirmado sin revisión humana.
- Las ubicaciones precisas de especies sensibles permanecen restringidas.
- Las imágenes y metadatos se almacenan en infraestructura privada y trazable.
- OpenAI se utiliza como motor inicial para reducir tiempo y costo de implementación.
- El modelo open source local se evalúa posteriormente, cuando exista suficiente dataset validado y volumen operacional.
- Cada resultado debe registrar modelo, versión, fecha, cámara, confianza y estado de revisión.

## Alcance comercial inicial

### Ingeniería

Incluye:

- adaptación del módulo Vision de SegurIA;
- carga manual o por lote de imágenes de cámaras trampa;
- análisis de imágenes mediante OpenAI Vision;
- catálogo inicial de especies prioritarias;
- almacenamiento de predicciones y observaciones;
- cola de validación científica;
- filtros por cámara, fecha, especie y estado;
- exportación CSV;
- dashboard básico;
- capacitación y soporte de puesta en marcha.

### Fuera del alcance de ingeniería

- compra de cámaras;
- instalación en terreno;
- conectividad 4G, radio o satélite;
- paneles solares y baterías;
- mantención física;
- visitas de terreno;
- entrenamiento de un modelo propio;
- identificación individual automática;
- estimaciones poblacionales científicas;
- integración con telemetría o radiocollares;
- GIS avanzado.

## Arquitectura inicial

```text
Cámara trampa
      ↓
Carga manual, SD, Wi-Fi o 4G
      ↓
Supabase Storage privado
      ↓
SegurIA Vision
      ↓
OpenAI Vision
      ↓
Predicción estructurada
      ↓
Cola de validación científica
      ↓
Registro confirmado o rechazado
      ↓
Dashboard, exportación y dataset validado
```

## Especies prioritarias

Primera configuración:

1. Huemul.
2. Pudú.
3. Puma.
4. Zorro.
5. Guiña.
6. Gato de Geoffroy.
7. Chingue.
8. Monito del monte.
9. Guanaco.
10. Animal desconocido.
11. Persona.
12. Vehículo.

La separación entre especies visualmente similares debe tratarse como una hipótesis hasta contar con validación experta y suficientes imágenes locales.

## Fase 0 — Preparación comercial y científica

Duración estimada: 3–5 días.

### Tareas

- confirmar responsable técnico y responsable científico;
- definir especies prioritarias;
- confirmar número de cámaras y formato de entrega de imágenes;
- definir reglas de privacidad y acceso;
- establecer criterios de validación;
- acordar volumen inicial de imágenes;
- seleccionar una zona piloto sin exponer coordenadas sensibles;
- definir indicadores de éxito.

### Entregables

- alcance aprobado;
- matriz de especies;
- flujo de revisión;
- criterios de aceptación;
- inventario de datos disponibles;
- plan de carga inicial.

## Fase 1 — MVP funcional

Duración estimada: 2 semanas.

### Backend y datos

- crear o ajustar tablas de trabajos de inferencia;
- asociar imágenes con cámara, fecha y zona;
- persistir resultados de OpenAI;
- registrar proveedor, modelo y versión;
- guardar confianza, bounding box, descripción y limitaciones;
- crear estados `queued`, `processing`, `completed`, `failed`;
- crear estados de revisión `pending`, `confirmed`, `corrected`, `rejected`, `unidentifiable`;
- restringir imágenes y coordenadas mediante RLS;
- añadir auditoría de decisiones humanas.

### API

- reutilizar `/api/vision/openai/infer`;
- endurecer autenticación y autorización;
- incorporar control de tamaño y formato;
- implementar reintentos controlados;
- registrar errores y latencia;
- limitar concurrencia y consumo;
- evitar duplicados mediante hash de archivo;
- añadir procesamiento por lote.

### Interfaz

- pantalla de carga de imágenes;
- historial de trabajos;
- estado de procesamiento;
- listado de detecciones;
- visualización de imagen y bounding boxes;
- confirmación, corrección o rechazo;
- filtro por cámara, especie, fecha y estado;
- exportación CSV.

### Resultado de la fase

Un usuario autorizado puede cargar imágenes, obtener una predicción, revisarla y guardar un registro validado.

## Fase 2 — Piloto con datos reales

Duración estimada: 2 semanas.

### Tareas

- cargar entre 500 y 5.000 imágenes reales;
- medir imágenes vacías, útiles y no identificables;
- revisar resultados con Fundación;
- corregir taxonomía y aliases;
- calibrar prompts y reglas de confianza;
- detectar principales confusiones;
- medir consumo por imagen;
- identificar cámaras con mala calidad;
- probar imágenes nocturnas, infrarrojas, lluvia, nieve y oclusión;
- ajustar experiencia de revisión.

### Indicadores

- porcentaje de imágenes procesadas correctamente;
- porcentaje enviado a revisión;
- tasa de confirmación por especie;
- falsos positivos y falsos negativos observados;
- tiempo promedio de revisión;
- costo promedio por imagen;
- latencia promedio;
- errores por cámara;
- proporción de imágenes no identificables.

### Resultado de la fase

Dataset inicial revisado y evidencia suficiente para decidir si OpenAI cubre el piloto o si se requiere detector local.

## Fase 3 — Entrega comercial

Duración estimada: 1 semana.

### Tareas

- corregir defectos del piloto;
- preparar perfiles y permisos;
- configurar cuotas de uso;
- documentar operación;
- capacitar usuarios;
- entregar informe de resultados;
- definir soporte y continuidad;
- establecer backlog de evolución.

### Entregables

- MVP productivo;
- usuarios configurados;
- catálogo inicial;
- dataset validado;
- exportación de resultados;
- manual operativo;
- informe de desempeño;
- propuesta de continuidad.

## Cronograma resumido

| Semana | Resultado |
|---|---|
| 1 | Alcance, datos, seguridad y flujo científico definidos |
| 2 | Ingesta, almacenamiento y análisis OpenAI funcionando |
| 3 | Cola de revisión y dashboard funcionales |
| 4 | Procesamiento de imágenes reales y calibración |
| 5 | Correcciones, métricas, capacitación y entrega |

Plazo objetivo: 5 semanas.

Margen contractual recomendado: 6 semanas.

## Presupuesto objetivo

### Ingeniería

Precio comercial sugerido:

```text
USD 6.500–8.500 + IVA
```

Punto recomendado de presentación:

```text
USD 7.500 + IVA
```

Este valor presupone que el desarrollo principal será realizado internamente por N3uralia reutilizando SegurIA.

### Forma de pago

- 50 % al iniciar.
- 30 % al entregar el flujo funcional.
- 20 % al cierre y capacitación.

### Costos separados

- cámaras y accesorios;
- instalación y visitas de terreno;
- conectividad;
- infraestructura cloud;
- almacenamiento adicional;
- consumo OpenAI;
- soporte posterior.

## Operación mensual

Propuesta inicial:

```text
Licencia y soporte: USD 350–600 mensuales + IVA
Infraestructura: consumo real
OpenAI: consumo real
```

El plan debe incluir una cuota mensual de imágenes. Los excesos se cobran según uso real y administración de plataforma.

## Reglas de confianza

- No mostrar una predicción como confirmada antes de revisión.
- Usar `probable`, `incierta` o `no identificable` según claridad.
- Priorizar recall para huemul: una posible detección debe ir a revisión aunque la confianza sea moderada.
- No inferir individuos, sexo, edad o estado sanitario sin evidencia suficiente.
- No exponer coordenadas exactas a usuarios no autorizados.
- Registrar siempre las limitaciones reportadas por el modelo.

## Riesgos principales

### Precisión taxonómica

OpenAI puede confundir especies similares o imágenes nocturnas. Mitigación: validación humana y reglas de incertidumbre.

### Costo variable

El consumo aumenta con el volumen y resolución. Mitigación: redimensionamiento, deduplicación, cuotas y procesamiento por lotes.

### Dependencia de proveedor

El MVP depende de OpenAI. Mitigación: mantener una interfaz de proveedor intercambiable y conservar la ruta ONNX.

### Privacidad y conservación

Las imágenes pueden contener personas o ubicaciones sensibles. Mitigación: almacenamiento privado, RLS, auditoría y mapas agregados.

### Calidad de cámaras

Imágenes borrosas o mal orientadas reducen la utilidad. Mitigación: reporte de calidad por cámara y guía de instalación.

## Criterios para pasar a un modelo open source local

Evaluar MegaDetector, SpeciesNet y un clasificador local cuando ocurra cualquiera de estas condiciones:

- más de 20.000–50.000 imágenes por mes;
- costo OpenAI superior al costo de operación local;
- precisión insuficiente en huemul o pudú;
- necesidad de procesar sin conexión;
- requisito de latencia baja;
- dataset local validado suficiente;
- necesidad de control completo sobre inferencia y versiones.

## Evolución tecnológica

### Etapa A — OpenAI primero

- implementación rápida;
- bajo costo inicial;
- validación del flujo;
- creación del primer dataset.

### Etapa B — Detector open source

- MegaDetector para animal, persona, vehículo y vacío;
- OpenAI solo para imágenes con animales;
- reducción de consumo.

### Etapa C — Clasificador local

- PyTorch y `timm`;
- entrenamiento con dataset Huilo Huilo;
- benchmark por especie;
- exportación ONNX.

### Etapa D — Edge y operación autónoma

- ONNX Runtime;
- procesamiento en estación local;
- sincronización diferida;
- operación con conectividad limitada.

## Backlog técnico inicial

- [ ] Diseñar `wildlife_inference_jobs`.
- [ ] Diseñar almacenamiento privado para imágenes de cámaras trampa.
- [ ] Asociar imágenes a cámara, fecha y zona.
- [ ] Persistir resultados de `/api/vision/openai/infer`.
- [ ] Añadir procesamiento por lote.
- [ ] Añadir hash y deduplicación.
- [ ] Añadir límites de cuota y consumo.
- [ ] Ampliar cola de revisión existente.
- [ ] Añadir corrección taxonómica.
- [ ] Añadir filtros y exportación CSV.
- [ ] Registrar modelo, prompt y versión.
- [ ] Añadir auditoría de revisiones.
- [ ] Proteger coordenadas sensibles.
- [ ] Crear dashboard de cámaras y especies.
- [ ] Medir costo, latencia y precisión observada.
- [ ] Preparar conjunto de evaluación local.

## Definición de terminado del MVP

El MVP se considera terminado cuando:

- un usuario autorizado puede cargar un lote de imágenes;
- cada imagen genera un trabajo trazable;
- OpenAI devuelve resultados estructurados o un error controlado;
- los resultados se guardan con modelo y versión;
- un especialista puede confirmar, corregir o rechazar;
- los registros validados pueden filtrarse y exportarse;
- las imágenes y coordenadas están protegidas;
- se dispone de métricas de consumo y desempeño;
- existe documentación básica de operación;
- el flujo ha sido validado con imágenes reales de Fundación Huilo Huilo.
