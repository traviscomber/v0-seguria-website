# SegurIA Security Suite — Roadmap canónico

Actualizado: 9 de agosto de 2026.
Documento canónico: `ROADMAP.md`.

> Regla de mantenimiento: todo cambio material de producto, arquitectura, seguridad, datos, integración, posicionamiento, SEO/GEO/LLMO o release debe reflejarse también en este archivo.

## Definición de producto

**SegurIA Security Suite — Powered by N3uralia.**

SegurIA es una suite integrada de seguridad y operación que reúne seguridad física, monitoreo, infraestructura, incidentes, evidencia, Vision, Edge, automatización y continuidad operacional dentro de una misma experiencia.

N3uralia es la capa tecnológica reutilizable. Los motores de inteligencia, automatización, análisis, orquestación y lógica diferencial pertenecen a N3uralia; SegurIA los consume y especializa para seguridad y operación.

Sitio de N3uralia: https://www.n3uralia.com

## Superficies principales de la suite

La experiencia cliente está organizada alrededor de seis módulos visibles:

1. **Centro de Control** — estado general, prioridades, propiedades, dispositivos, incidentes y actividad.
2. **Infraestructura** — cámaras, sensores, gateways, inventario, heartbeat y estado operacional.
3. **Incidentes** — alertas, severidad, reconocimiento, resolución, descarte y trazabilidad.
4. **Evidencia** — snapshots, Storage privado, actividad, video protegido y relación con eventos/dispositivos.
5. **Vision** — análisis visual operation-aware, quality diagnostics, human review e inferencia derivada.
6. **Edge** — RTSP local, motion/change gate, selección de frames, spool offline y reintentos.

Estos módulos no son productos aislados: son superficies de una misma Security Suite.

## Estado ejecutivo

### PASS — base multiempresa y operación

Implementado y validado:

- Supabase/Postgres como sistema transaccional principal;
- organizaciones, propiedades, memberships y operaciones con relaciones explícitas;
- Supabase Auth SSR + RLS;
- aislamiento multiempresa;
- gateways con identidad propia;
- inventario persistente de dispositivos;
- eventos, incidentes, snapshots y auditoría;
- sesiones efímeras de video y proxy protegido cuando aplica;
- provisioning interno;
- dashboards alimentados por datos reales;
- guardrails entre preview y producción.

### PASS — ownership canónico de Vision

Modelo vigente:

```text
Organization -> Property -> Operation -> Vision resources
```

Reglas:

- `operation_id` es el scope operacional canónico;
- `organization_id` se deriva desde la propiedad vinculada a la operación;
- `created_by_user_id` y `submitted_by_user_id` son actor/auditoría, no ownership;
- membership operacional mediante `user_operations`;
- conocer un UUID no concede acceso.

### PASS — identidad e idempotencia

Cámaras:

```text
UNIQUE(operation_id, code)
```

Inferencias:

```text
UNIQUE(operation_id, sha256, model_name)
```

Los write paths relevantes exigen operación explícita y evitan colisiones entre operaciones distintas.

### PASS — Wildlife security hardening

Completado:

- RLS endurecida por operación;
- lookup de scope permitido solo donde corresponde;
- cleanup de índices duplicados de `user_operations`;
- constraint de identidad de cámaras por operación;
- idempotencia de inference jobs por operación;
- tests de acceso positivo/negativo.

### PASS — Huilo Huilo wildlife preservation

El trabajo de Wildlife fue integrado a `main` mediante PR #28.

Estado canónico conocido:

- propiedad Huilo Huilo asociada a una operación canónica;
- 4 cámaras con scope operacional;
- inference jobs scoped y legacy separados;
- 5 jobs históricos permanecen sin `operation_id` por falta de evidencia canónica suficiente;
- no se reasignan datos legacy por conveniencia o inferencia.

### PASS — Security Suite client experience

La experiencia del portal fue reorganizada en seis módulos:

```text
Centro de Control
Infraestructura
Incidentes
Evidencia
Vision
Edge
```

Se reutilizan componentes y datos reales existentes; no se inventan métricas, volúmenes ni tasas para presentación.

### PASS — branding N3uralia

Relación canónica:

```text
N3uralia engines -> SegurIA Security Suite -> security workflows
```

SegurIA no define una familia independiente de motores. Los identificadores técnicos del repositorio pueden mantener nombres de implementación, pero no deben presentarse como motores propios de SegurIA.

### PASS — SEO / GEO / LLMO base

Implementado:

- canonical URLs;
- metadata Next.js;
- Open Graph;
- JSON-LD / Schema.org;
- sitemap;
- robots;
- `llms.txt`;
- referencias semánticas SegurIA ↔ N3uralia;
- atribución visible **Powered by N3uralia**;
- posicionamiento principal como **SegurIA Security Suite**;
- metadata localizada alineada con Security Suite;
- entity graph corregido para evitar relaciones semánticas engañosas;
- estrategia Brandin documentada en `docs/marketing/BRAND_DISCOVERY_STRATEGY.md`.

## Arquitectura canónica

```text
Cámaras / sensores / sistemas locales
                |
                v
       Gateway / agente local
  - RTSP y dispositivos locales
  - inventario / heartbeat
  - motion/change gate
  - frame selection
  - buffer y spool offline
                |
                v
          APIs protegidas
  - identidad de gateway
  - autorización
  - reintentos
  - idempotencia
  - snapshots seguros
  - media proxy cuando aplica
                |
                v
      SegurIA Security Suite
  - Centro de Control
  - Infraestructura
  - Incidentes
  - Evidencia
  - Vision
  - Edge
                |
                v
          Motores N3uralia
  - inteligencia
  - automatización
  - análisis
  - orquestación
  - procesamiento
                |
                v
       Supabase / PostgreSQL
  - estado canónico
  - Auth + RLS
  - Storage privado
  - auditoría
```

Principio: **procesar cerca del lugar, mover solo la información necesaria y mantener una verdad operacional segura, auditable y accionable.**

## Ownership y verdad canónica

### Estado canónico

Postgres/Supabase mantiene las entidades y relaciones operacionales: organizaciones, propiedades, operaciones, memberships, gateways, dispositivos, incidentes, cámaras, inference jobs, reviews, reglas y auditoría.

### Evidencia binaria

Supabase Storage mantiene blobs. Storage no define ownership; la semántica y ownership se resuelven desde Postgres.

### Datos derivados

Resultados de IA, clasificaciones, confianza, dashboards y métricas son derivados. No pueden sobrescribir silenciosamente la verdad operacional canónica.

## Seguridad obligatoria

- RLS y backend deben validar la ruta real de ownership.
- Secretos y service-role permanecen server-side.
- Ninguna ruta sensible se autoriza solo por sesión válida.
- Video e imágenes no exponen credenciales RTSP.
- Acciones críticas son deny-by-default.
- Mutaciones sensibles deben ser auditables.
- Migraciones siguen expand-migrate-contract.
- Demo, preview y producción permanecen separados.
- No se inventa ownership para reconciliar datos legacy.

## HOLD — verificación autenticada end-to-end de Vision

Sigue pendiente demostrar con una sesión real autenticada el flujo completo:

1. inferencia real con `x-operation-id`;
2. creación/reuso de cámara por `(operation_id, code)`;
3. creación/reuso de job por `(operation_id, sha256, model_name)`;
4. evidencia en Storage asociada al job correcto;
5. lectura autorizada;
6. caso negativo cross-operation;
7. revisión de logs Vercel/Supabase.

Gate: `imagen -> storage -> cámara -> job -> resultado -> lectura autorizada` debe quedar verificado de extremo a extremo.

## P1 — consolidar Security Suite

- mantener navegación y copy alineados con la categoría Security Suite;
- conectar cada módulo con flujos operacionales reales y evidencia canónica;
- mejorar correlación entre infraestructura, eventos, incidentes y evidencia;
- evitar duplicación conceptual entre páginas comerciales, portal y documentación;
- mantener `Powered by N3uralia` consistente en UI, metadata y documentación;
- actualizar este roadmap en cada cambio material.

## P1 — Brandin: posicionamiento y discoverability

Objetivo: convertir **SegurIA Security Suite** en una entidad de mercado clara para compradores, buscadores y motores generativos sin depender de keyword stuffing ni claims no verificables.

Acciones prioritarias:

1. Reescribir el hero/home visible para declarar **Security Suite** explícitamente sin perder el mensaje emocional actual.
2. Incorporar una sección visible y citable “Qué incluye la SegurIA Security Suite” con los seis módulos.
3. Mantener una arquitectura de contenido en tres capas: categoría -> capacidades -> industrias/casos de uso.
4. Reforzar internal linking entre landings de intención alta, `/soluciones`, capacidades relacionadas y contacto.
5. Añadir metadata específica a páginas que todavía dependan de metadata genérica.
6. Mantener `llms.txt`, JSON-LD, README, estrategia y roadmap sincronizados.
7. Medir Search Console, branded search, conversiones por landing, backlinks relevantes y leads calificados; la visibilidad en motores generativos es una señal complementaria.
8. Evitar páginas thin/doorway, fake FAQs, fake reviews y contenido masivo sin valor original.

Documento de estrategia: `docs/marketing/BRAND_DISCOVERY_STRATEGY.md`.

Gate P1 Brandin: la categoría, relaciones de entidad, metadata y copy visible deben ser coherentes; las páginas principales deben poder explicar qué es SegurIA, qué incluye y cómo se relaciona con N3uralia sin depender del README o de `llms.txt`.

## P1 — observabilidad y release gates

- revisar runtime después de cambios relevantes;
- mantener build/TypeScript/tests verdes;
- verificar rutas públicas críticas;
- validar que cambios de schema y código permanezcan sincronizados;
- no declarar PASS si la verificación requerida no fue ejecutada.

## P2 — datos legacy

Los 5 inference jobs sin `operation_id` permanecen legacy hasta existir evidencia canónica que permita reconciliarlos.

Opciones válidas:

- migración con fuente de verdad demostrable;
- conservación archivada;
- exportación/retiro explícito aprobado por negocio.

Nunca asignarlos automáticamente a Huilo Huilo u otra operación.

## P2 — gobierno, retención y recovery

Definir y documentar:

- retención de imágenes y evidencia;
- retención de inference jobs;
- lifecycle de resultados rechazados/no identificables;
- auditoría de correcciones humanas;
- eliminación por operación/cliente;
- backup/PITR;
- restauración probada;
- reconciliación Storage ↔ Postgres.

## P2 — performance y costos

Medir antes de optimizar:

- inferencias por operación;
- crecimiento de Storage;
- egress;
- latencia de inferencia;
- queries del dashboard;
- scans por operación/status/review/fecha;
- uso real de índices.

## P2 — expansión de la suite

Evolución potencial, siempre basada en requisitos reales:

- correlación avanzada de eventos;
- mapas y planos interactivos;
- rondas virtuales;
- predicción de fallas;
- puntuación de riesgo por propiedad;
- despacho coordinado;
- integraciones con centrales de monitoreo;
- API para partners e instaladores;
- PWA/móvil;
- reporting operacional;
- analítica de falsas alarmas.

## Indicadores de éxito

Producto:

- estado operacional entendible rápidamente;
- onboarding repetible;
- módulos de la suite coherentes entre sí;
- incidentes y evidencia conectados al contexto correcto.

Datos y seguridad:

- cero lecturas cruzadas entre scopes;
- cero writes Vision nuevos sin `operation_id`;
- cero ownership inferido silenciosamente;
- cero secretos de origen expuestos al navegador;
- mutaciones sensibles trazables;
- idempotencia verificable.

Operación:

- recuperación después de desconexiones;
- jobs fallidos observables y reintentables;
- Storage reconciliable con estado canónico;
- rollback o forward-fix para cambios críticos.

Negocio:

- costo medible por operación;
- latencia y costo por inferencia medibles;
- activación de clientes repetible;
- reducción de falsas alarmas;
- reducción del tiempo de resolución de incidentes.

Marketing y discoverability:

- crecimiento de consultas no-brand relevantes;
- crecimiento de branded search de SegurIA;
- páginas de entrada que generan contacto;
- conversiones medibles por landing;
- backlinks/referrals relevantes;
- cobertura e indexación saludables;
- menciones/citas en motores generativos solo cuando puedan verificarse;
- leads calificados atribuibles a superficies orgánicas.

## Criterio de release

### PASS

Un cambio puede considerarse listo cuando las verificaciones relevantes están ejecutadas y no existe un blocker material conocido.

### HOLD

El diseño o implementación está mayormente correcto, pero falta una verificación requerida. El estado autenticado E2E de Vision permanece aquí.

### BLOCK

Existe un defecto conocido de seguridad, integridad, tenancy, migración o flujo primario que hace inseguro avanzar.

## Política de mantenimiento del roadmap

`ROADMAP.md` forma parte del Definition of Done de SegurIA.

Cada cambio material debe actualizar, cuando corresponda:

- estado PASS / HOLD / BLOCK;
- arquitectura canónica;
- ownership y contratos;
- módulos de la Security Suite;
- relación con N3uralia;
- posicionamiento y discoverability;
- prioridades P0/P1/P2;
- riesgos y deuda pendiente;
- release gates;
- fecha de actualización.
