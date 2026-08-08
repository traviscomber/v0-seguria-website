# SegurIA: roadmap de seguridad integral

Actualizado: 7 de agosto de 2026.
Documento canónico: `ROADMAP.md`.

> Nota de mantenimiento: existe además un `roadmap.md` histórico en minúsculas. Debe consolidarse y eliminarse después de verificar que no sea consumido por automatizaciones o documentación externa.

## Visión

SegurIA será un centro de seguridad simple para clientes y potente para operadores. Unirá cámaras, sensores, alarmas, accesos, automatizaciones y SegurIA Vision en una sola experiencia, sin exponer al cliente las marcas, cuentas o herramientas técnicas que operan por debajo.

La plataforma debe convertir señales dispersas en decisiones claras:

- qué está ocurriendo,
- dónde está ocurriendo,
- a qué operación y propiedad pertenece,
- qué nivel de riesgo tiene,
- qué evidencia existe,
- qué respuesta fue ejecutada,
- y quién debe actuar ahora.

## Objetivo principal

Dejar una versión Pro capaz de operar clientes reales con:

- acceso seguro y aislamiento multiempresa,
- separación estricta entre organizaciones, propiedades y operaciones,
- alta guiada de cuentas, sitios y gateways,
- inventario sincronizado de cámaras y sensores,
- eventos y estados casi en tiempo real,
- video en vivo y capturas protegidas,
- SegurIA Vision con ownership explícito por operación,
- alertas accionables,
- automatizaciones seguras,
- trazabilidad completa,
- idempotencia en los flujos críticos,
- y operación degradada cuando internet o un proveedor externo falla.

## Estado ejecutivo

### PASS — base multiempresa y operación

Validado e implementado:

- Supabase/Postgres como sistema transaccional principal,
- organizaciones, propiedades, memberships y operaciones con relaciones explícitas,
- RLS para recursos críticos,
- autenticación SSR con Supabase Auth,
- aislamiento probado entre organizaciones,
- gateways con identidad propia y secretos hasheados,
- inventario persistente de dispositivos y entidades,
- eventos, incidentes, snapshots y auditoría persistidos,
- automatizaciones versionadas y rollback,
- cola offline del agente local,
- sesiones efímeras de video,
- proxy HLS/WebRTC protegido,
- provisioning interno de clientes,
- guardrails para impedir mutaciones productivas desde ambientes incorrectos,
- y dashboards alimentados por datos reales.

### PASS — SegurIA Vision ownership

Databasin cerró el modelo canónico de Vision:

`Organization -> Property -> Operation -> Vision resources`

Decisiones vigentes:

- `operation_id` es el scope canónico de autorización y ownership operacional de Vision.
- `organization_id` en recursos Vision es una denormalización derivada desde la propiedad vinculada a la operación; no define ownership por sí sola.
- `created_by_user_id` y `submitted_by_user_id` son auditoría/actor histórico, no límites de ownership.
- la membresía operacional se resuelve mediante `user_operations`.
- un usuario no obtiene acceso a una operación por pertenecer a otra organización u operación.

### PASS — idempotencia de cámaras

Estado canónico:

- `wildlife_cameras.operation_id` es obligatorio,
- identidad: `UNIQUE(operation_id, code)`,
- retirada la identidad legacy `UNIQUE(created_by_user_id, code)`,
- el endpoint resuelve cámaras solo dentro de la operación,
- las carreras concurrentes `select -> insert` se recuperan mediante la constraint canónica,
- 4 cámaras actuales, 0 sin `operation_id`, 0 duplicados bajo la identidad nueva.

Migraciones relevantes:

- `20260808002515_wildlife_operation_idempotency_expand.sql`
- `20260808004103_wildlife_camera_operation_identity_contract.sql`
- `20260808004209_index_wildlife_camera_creator_fk.sql`

### PASS — idempotencia de inferencias

Estado canónico:

- identidad de job: `UNIQUE(operation_id, sha256, model_name)`,
- retirada la constraint legacy por usuario,
- `persistJob()` usa la operación como parte de la identidad,
- una misma evidencia puede existir legítimamente en operaciones distintas sin colisión entre tenants,
- nuevos writes de inferencia requieren scope operacional explícito.

Migraciones relevantes:

- `20260808002515_wildlife_operation_idempotency_expand.sql`
- `20260808003331_wildlife_inference_idempotency_contract.sql`

Existen 5 inference jobs históricos sin `operation_id`. No tienen evidencia canónica suficiente para asignarlos a una operación. Deben permanecer identificados como legacy hasta que exista una fuente de verdad que permita reconciliarlos sin inferencia inventada.

### PASS — contrato HTTP operation-explicit

Los write paths de Vision ya no seleccionan silenciosamente “la primera operación” o “la primera organización”.

Reglas actuales:

- `/api/vision/openai/infer` requiere `x-operation-id`,
- el servidor valida que la operación exista,
- valida membership/rol en esa operación,
- deriva `organization_id` desde la propiedad vinculada,
- cámaras y jobs persisten el mismo `operation_id`,
- `/api/vision/cameras` requiere operación explícita para writes,
- `/api/vision/demo` requiere operación explícita,
- `infer-with-metadata` no puede reescribir ownership después de crear el job.

## Arquitectura canónica

```text
Dispositivos / cámaras / sensores
        |
        v
Home Assistant / SegurIA Edge / Gateway local
  - integraciones oficiales
  - automatizaciones locales
  - motion gate / frame selection cuando aplique
  - buffer y cola offline
        |
        v
SegurIA Gateway / APIs protegidas
  - identidad de instalación
  - normalización
  - reintentos e idempotencia
  - proxy seguro de media
        |
        v
SegurIA Cloud
  - Supabase/Postgres: estado canónico
  - Auth + RLS
  - Storage: evidencia binaria
  - APIs y jobs
  - alertas e incidentes
        |
        +-------------------+
        |                   |
        v                   v
Portal cliente         Centro de operaciones
```

## Mapa de ownership de datos

### Estado canónico

Postgres/Supabase mantiene:

- organizaciones,
- propiedades,
- operaciones,
- memberships y `user_operations`,
- gateways,
- dispositivos y entidades,
- estado operacional,
- incidentes,
- cámaras de fauna,
- inference jobs,
- reviews,
- reglas/automatizaciones,
- auditoría.

### Evidencia binaria

Supabase Storage mantiene imágenes y otros blobs asociados por IDs canónicos. Storage no define ownership; el ownership se deriva desde el registro canónico en Postgres.

### Datos derivados

Resultados de IA, clasificaciones, confianza, embeddings futuros, dashboards y métricas son derivados. Nunca deben sobrescribir silenciosamente la verdad operacional o taxonómica canónica.

## Regla de aislamiento

No existe un scope universal único para todas las tablas. Cada dominio debe declarar su tenant root y su ruta de ownership.

Reglas principales:

- Portal empresarial: `organization -> property -> resource`.
- Vision operacional: `operation -> property -> organization`.
- un recurso Vision protegido debe poder trazarse a una operación concreta,
- RLS y backend deben validar exactamente esa relación,
- conocer un UUID no concede acceso,
- ningún array genérico de IDs puede mezclar organizaciones, propiedades y operaciones.

## Seguridad obligatoria

- Ninguna ruta de ingestión queda abierta cuando falta configuración.
- Secretos de servicio permanecen server-side.
- Supabase Auth administra identidad; Postgres/RLS administra autorización.
- APIs sensibles validan scope concreto, no solo “usuario autenticado”.
- Video e imágenes no exponen credenciales de origen.
- Acciones críticas son deny-by-default.
- Toda mutación operacional importante deja auditoría.
- Las migraciones siguen expand-migrate-contract.
- No se inventan organizaciones, operaciones ni ownership para reconciliar datos legacy.
- Datos demo, previews y producción deben permanecer claramente separados.

## Próximos pasos

### P0 — cerrar seguridad y consistencia de Wildlife

1. Auditar `wildlife_snapshot_candidates`.
   - confirmar tenant root,
   - revisar que RLS tenga políticas reales,
   - eliminar cualquier dependencia de organization/property ambiguos,
   - probar allow/deny entre operaciones distintas.

2. Auditar `wildlife_demo_profiles`.
   - hoy RLS está habilitado sin políticas,
   - decidir si debe ser accesible solo mediante RPC/admin o mediante policies explícitas,
   - mantener demo state fuera de la verdad operacional real.

3. Optimizar RLS Wildlife marcado por Supabase Advisor.
   - `wildlife_ai_audit_log`,
   - `wildlife_ai_quotas`,
   - `wildlife_evaluation_sets`,
   - `wildlife_evaluation_items`.
   - reemplazar llamadas por fila a `auth.uid()`/funciones equivalentes por el patrón `(select auth.uid())` cuando corresponda,
   - revalidar semántica antes y después del cambio.

4. Revisar las funciones `SECURITY DEFINER` expuestas a `authenticated`.
   - confirmar que cada RPC expuesta necesita realmente bypass RLS,
   - revocar `EXECUTE` o mover a schema privado cuando no sea intencional,
   - mantener chequeo explícito del actor dentro de funciones privilegiadas.

Gate P0: no deben quedar findings de seguridad relevantes sin decisión explícita y prueba de acceso negativa.

### P1 — prueba end-to-end de Vision

1. Ejecutar una inferencia autenticada real contra preview usando `x-operation-id`.
2. Verificar creación/reuso de cámara bajo `(operation_id, code)`.
3. Verificar creación/reuso de inference job bajo `(operation_id, sha256, model_name)`.
4. Repetir la misma imagen en otra operación autorizada y confirmar que no colisiona.
5. Intentar la misma operación con usuario no miembro y confirmar `403`/deny.
6. Confirmar evidencia en Storage y asociación al job correcto.
7. Revisar logs Vercel y Supabase después de la prueba.

Gate P1: flujo completo imagen -> storage -> cámara -> job -> resultado -> lectura autorizada debe ser PASS, incluyendo caso negativo cross-operation.

### P1 — limpiar estructura de `user_operations`

Supabase Advisor reporta índices equivalentes:

- `user_operations_user_id_operation_id_key`
- `user_operations_user_id_operation_id_uidx`

Acciones:

1. confirmar cuál constraint/index es canónico,
2. revisar dependencias,
3. retirar el duplicado sin perder enforcement,
4. verificar planes de las queries RLS más frecuentes.

Gate: una sola garantía de unicidad para `(user_id, operation_id)` y sin degradación de autorización.

### P1 — release gate del PR #28

PR activo: `#28 feat(vision): add Huilo Huilo wildlife preservation`.

Antes de merge:

- P0 Wildlife security cerrado,
- inferencia real preview PASS,
- pruebas cross-operation PASS,
- build/TypeScript PASS,
- runtime scan sin errores nuevos,
- migraciones GitHub == historial Supabase,
- review del diff completo,
- verificar que no haya simulated data presentado como real.

Solo después decidir merge a `main` y promoción.

### P2 — datos legacy

Los 5 jobs sin `operation_id` no se corrigen automáticamente.

Opciones aceptables:

- encontrar evidencia externa/canónica que demuestre su operación y migrarlos con trazabilidad,
- conservarlos como legacy personal/archivado,
- exportarlos y retirarlos del flujo operacional mediante una migración explícita si el negocio lo aprueba.

Nunca asignarlos a Huilo Huilo u otra operación solo por proximidad temporal, usuario o conveniencia.

### P2 — gobierno, retención y recovery

Definir y documentar:

- retención de imágenes originales,
- retención de inference jobs,
- lifecycle de datos rechazados o no identificables,
- auditoría de reviews/correcciones,
- eliminación de datos por operación/cliente,
- PITR/backup esperado,
- restauración probada,
- reconciliación de Storage contra registros Postgres.

### P2 — performance y costos

Medir antes de optimizar:

- volumen de inferencias por operación,
- crecimiento de Storage,
- egress por evidencia,
- tiempos de inferencia,
- queries del dashboard,
- scans por `operation_id`, status, review y fecha,
- uso real de índices existentes.

No eliminar índices marcados como “unused” únicamente por el advisor; primero confirmar ventana estadística y access patterns reales.

### P2 — primera operación real

Después del release gate:

1. provisionar propiedad/operación real,
2. conectar primer gateway/SegurIA Edge,
3. confirmar heartbeat,
4. registrar cámara real,
5. procesar evidencia real,
6. validar alertas y revisión humana,
7. medir latencia, costo y tasa de fallo,
8. documentar runbook de soporte.

## Backlog de plataforma

### Primer piloto útil

- importación desde Home Assistant,
- WebSocket de estados,
- dashboard por propiedad,
- sensores y alertas normalizados,
- snapshots seguros,
- incidentes básicos,
- salud del Gateway,
- notificaciones operativas,
- Vision operation-aware.

### Experiencia Pro

- stream en vivo protegido,
- correlación de eventos,
- automatizaciones versionadas,
- clips/NVR cuando exista requisito real,
- reportes,
- escalamiento multicanal,
- PWA/móvil,
- analítica de falsas alarmas.

### Diferenciación futura

- clasificación local en SegurIA Edge,
- mapas y planos interactivos,
- rondas virtuales,
- predicción de fallas,
- puntuación de riesgo por propiedad,
- despacho coordinado,
- integraciones con centrales de monitoreo,
- API para partners e instaladores.

## Indicadores de éxito

Producto:

- estado general entendible en menos de 10 segundos,
- activación de cliente repetible sin desarrollo,
- eventos críticos visibles dentro del SLA definido,
- flujo Vision comprensible y revisable por humanos.

Datos y seguridad:

- cero lecturas cruzadas entre tenants/scopes,
- cero writes Vision sin `operation_id`,
- cero ownership inferido silenciosamente,
- cero secretos de origen expuestos al navegador,
- 100% de mutaciones sensibles trazables,
- idempotencia verificada para reintentos de cámara e inferencia.

Operación:

- recuperación automática después de desconexiones,
- jobs fallidos observables y reintentables,
- storage reconciliable con estado canónico,
- rollback o forward-fix disponible para migraciones críticas.

Negocio:

- costo mensual medible por propiedad/operación,
- latencia y costo por inferencia medibles,
- onboarding repetible,
- reducción de falsas alarmas,
- tiempo medio de resolución de incidentes.

## Criterio de release

### PASS

Puede avanzar a merge/promoción cuando:

- ownership canónico está probado,
- RLS positiva y negativa está probada,
- migraciones y repo están sincronizados,
- build y runtime están verdes,
- la inferencia real preview funciona end-to-end,
- no existe defecto conocido capaz de mezclar tenants, perder evidencia o reasignar ownership.

### HOLD

Mantener PR sin merge cuando:

- falta una prueba end-to-end material,
- un advisor de seguridad relevante no ha sido clasificado,
- existe drift entre GitHub y Supabase,
- falta validar un consumidor externo del contrato `x-operation-id`.

### BLOCK

No promover cuando:

- una operación puede leer o modificar datos de otra,
- un write puede crear recursos sin scope canónico,
- una migración puede destruir o reasignar datos sin evidencia,
- storage/job/camera ownership no reconcilia,
- un flujo crítico pierde idempotencia.

## Decisiones pendientes de producto/infraestructura

1. política de retención de evidencia, eventos y auditoría,
2. staging formal separado de producción,
3. proveedores reales de email/SMS/push,
4. estrategia de clips/grabación continua vs snapshots + live,
5. modelo estándar de Home Assistant por cliente o por propiedad,
6. mecanismo administrado de actualización remota del Gateway/SegurIA Edge.

## Fuentes técnicas oficiales

- [Home Assistant Core](https://github.com/home-assistant/core)
- [API REST de Home Assistant](https://developers.home-assistant.io/docs/api/rest/)
- [API WebSocket de Home Assistant](https://developers.home-assistant.io/docs/api/websocket/)
- [Supabase](https://supabase.com/docs)
- [Vercel](https://vercel.com/docs)
