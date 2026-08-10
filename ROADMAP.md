# SegurIA Security Suite — Roadmap canónico

Actualizado: 9 de agosto de 2026.
Documento canónico: `ROADMAP.md`.

> Regla de mantenimiento: todo cambio material de producto, arquitectura, seguridad, datos, integración, posicionamiento, SEO/GEO/LLMO o release debe reflejarse también en este archivo.

## Definición de producto

**SegurIA Security Suite — Powered by N3uralia.**

SegurIA es una suite integrada de seguridad y operación que reúne seguridad física, monitoreo, infraestructura, incidentes, evidencia, Vision, Edge, automatización y continuidad operacional dentro de una misma experiencia.

N3uralia es la capa tecnológica reutilizable. Los motores de inteligencia, automatización, análisis, orquestación y lógica diferencial pertenecen a N3uralia; SegurIA los consume y especializa para seguridad y operación.

Sitio N3uralia: https://www.n3uralia.com

## Superficies principales

1. **Centro de Control** — estado general, prioridades, propiedades, dispositivos, incidentes y actividad.
2. **Infraestructura** — cámaras, sensores, gateways, inventario, heartbeat y estado operacional.
3. **Incidentes** — alertas, severidad, reconocimiento, resolución, descarte y trazabilidad.
4. **Evidencia** — snapshots, Storage privado, actividad, video protegido y relación con eventos/dispositivos.
5. **Vision** — análisis visual operation-aware, quality diagnostics, human review e inferencia derivada.
6. **Edge** — RTSP local, motion/change gate, selección de frames, spool offline y reintentos.

Estas superficies forman una sola Security Suite; no son productos separados.

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

- `operation_id` es el scope operacional canónico.
- `organization_id` se deriva desde la propiedad vinculada a la operación.
- `created_by_user_id` y `submitted_by_user_id` son actor/auditoría, no ownership.
- membership operacional mediante `user_operations`.
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

### PASS — Wildlife / Huilo Huilo

- RLS endurecida por operación;
- lookup de scope limitado;
- índices duplicados de `user_operations` limpiados;
- identidad de cámaras e inferencias protegida por operación;
- tests de acceso positivo/negativo;
- Huilo Huilo integrado a `main` mediante PR #28;
- 4 cámaras con scope operacional;
- 5 inference jobs históricos permanecen legacy sin `operation_id` por falta de evidencia canónica suficiente.

Nunca se reasigna ownership legacy por conveniencia o inferencia.

### PASS — Security Suite client experience

Portal organizado en:

```text
Centro de Control
Infraestructura
Incidentes
Evidencia
Vision
Edge
```

Se reutilizan componentes y datos reales; no se inventan métricas, volúmenes ni tasas.

### PASS — branding N3uralia

Relación canónica:

```text
N3uralia engines -> SegurIA Security Suite -> security workflows
```

SegurIA no define una familia independiente de motores. Los identificadores técnicos pueden conservar nombres de implementación, pero la propiedad tecnológica reutilizable permanece en N3uralia.

### PASS — SEO / GEO / LLMO base

Implementado:

- canonical URLs;
- metadata Next.js global y localizada;
- Open Graph;
- JSON-LD / Schema.org;
- sitemap multilenguaje;
- robots;
- `llms.txt`;
- referencias semánticas SegurIA ↔ N3uralia;
- atribución visible **Powered by N3uralia**;
- entity graph corregido;
- estrategia Brandin en `docs/marketing/BRAND_DISCOVERY_STRATEGY.md`.

### PASS — categoría Security Suite visible en homepage

Implementado en ES y EN:

- eyebrow principal `SegurIA Security Suite`;
- descripción visible que define qué es la suite;
- CTA `Ver la suite / View the suite`;
- bloque visible que explica las seis superficies canónicas;
- relación N3uralia → tecnología reutilizable → SegurIA especializada;
- `/soluciones` alineado con la categoría Security Suite;
- footer comercial alineado con `Security Suite. Powered by N3uralia.`

Commit de implementación: `98dd748a638fc484bd5518b302a78b0853a8ba3a`.

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

- Postgres/Supabase mantiene entidades y relaciones operacionales canónicas.
- Supabase Storage mantiene blobs; Storage no define ownership.
- IA, clasificaciones, confianza, dashboards y métricas son datos derivados.
- Resultados derivados no sobrescriben silenciosamente verdad operacional canónica.

## Seguridad obligatoria

- RLS y backend validan la ruta real de ownership.
- Secretos y service-role permanecen server-side.
- Ninguna ruta sensible se autoriza solo por sesión válida.
- Video e imágenes no exponen credenciales RTSP.
- Acciones críticas son deny-by-default.
- Mutaciones sensibles deben ser auditables.
- Migraciones siguen expand-migrate-contract.
- Demo, preview y producción permanecen separados.
- No se inventa ownership para reconciliar datos legacy.

## HOLD — Vision autenticado E2E

Pendiente demostrar con sesión real autenticada:

1. inferencia con `x-operation-id`;
2. creación/reuso de cámara por `(operation_id, code)`;
3. creación/reuso de job por `(operation_id, sha256, model_name)`;
4. evidencia Storage asociada al job correcto;
5. lectura autorizada;
6. caso negativo cross-operation;
7. revisión de logs Vercel/Supabase.

Gate:

```text
imagen -> storage -> cámara -> job -> resultado -> lectura autorizada
```

## P1 — Brandin: siguiente fase

La categoría ya es visible. El siguiente trabajo de mayor impacto es consolidar el grafo de contenido y conversión:

1. Reforzar internal linking entre `/soluciones`, páginas de capacidades, industrias y `/contacto`.
2. Añadir metadata específica a páginas que todavía dependan de metadata genérica.
3. Crear breadcrumbs/relaciones semánticas donde aporten contexto real.
4. Revisar intención y profundidad de cada landing para evitar páginas thin o duplicadas.
5. Mejorar rutas de conversión desde páginas de intención alta.
6. Mantener `llms.txt`, JSON-LD, README, estrategia y roadmap sincronizados.
7. Medir Search Console, branded search, conversiones por landing, backlinks relevantes y leads calificados.
8. Tratar visibilidad en motores generativos como señal complementaria, no como métrica aislada.

Modelo de contenido:

```text
N3uralia
  -> SegurIA Security Suite
      -> capacidades
          -> industrias / casos de uso
              -> evidencia / explicación
                  -> contacto / conversión
```

## P1 — observabilidad y release gates

- revisar runtime después de cambios relevantes;
- mantener build/TypeScript/tests verdes;
- verificar rutas públicas críticas;
- validar sincronía entre schema y código;
- no declarar PASS si la verificación requerida no fue ejecutada.

## P2 — datos legacy

Los 5 inference jobs sin `operation_id` permanecen legacy hasta existir evidencia canónica que permita reconciliarlos.

Opciones válidas:

- migración con fuente de verdad demostrable;
- conservación archivada;
- exportación/retiro explícito aprobado por negocio.

## P2 — gobierno, retención y recovery

Definir y documentar:

- retención de imágenes/evidencia;
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

Evolución potencial basada en requisitos reales:

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
- módulos coherentes entre sí;
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

Verificaciones relevantes ejecutadas y sin blocker material conocido.

### HOLD

Implementación mayormente correcta pero falta una verificación requerida. Vision autenticado E2E permanece aquí.

### BLOCK

Defecto conocido de seguridad, integridad, tenancy, migración o flujo primario hace inseguro avanzar.

## Política de mantenimiento

`ROADMAP.md` forma parte del Definition of Done de SegurIA.

Cada cambio material debe actualizar, cuando corresponda:

- PASS / HOLD / BLOCK;
- arquitectura canónica;
- ownership y contratos;
- módulos de la Security Suite;
- relación con N3uralia;
- posicionamiento y discoverability;
- prioridades P0/P1/P2;
- riesgos y deuda pendiente;
- release gates;
- fecha de actualización.
