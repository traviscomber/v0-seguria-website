# SegurIA Security Suite — Roadmap canónico

Actualizado: 9 de agosto de 2026.
Documento canónico: `ROADMAP.md`.

> Regla de mantenimiento: todo cambio material de producto, arquitectura, seguridad, datos, integración, posicionamiento, SEO/GEO/LLMO o release debe reflejarse también en este archivo.

## Definición de producto

**SegurIA Security Suite — Powered by N3uralia.**

SegurIA es una suite integrada de seguridad y operación que reúne seguridad física, monitoreo, infraestructura, incidentes, evidencia, Vision, Edge, automatización y continuidad operacional dentro de una misma experiencia.

N3uralia es la capa tecnológica reutilizable. Los motores de inteligencia, automatización, análisis, orquestación y lógica diferencial pertenecen a N3uralia; SegurIA los consume y especializa para seguridad y operación.

Sitio N3uralia: https://www.n3uralia.com

## Posicionamiento geográfico canónico

La estrategia de SegurIA en Chile se define así:

```text
Chile
  -> base operacional nacional: Santiago / Vitacura
  -> sucursal sur de Chile: Valdivia / Los Ríos
  -> foco regional de proyectos
      -> La Araucanía
      -> Los Ríos
      -> Los Lagos
  -> otras zonas de Chile según factibilidad
```

Reglas:

- **Santiago no se elimina ni se relega**: Vitacura, Santiago, sigue siendo la base operacional nacional para coordinación comercial, arquitectura, soporte y gestión de proyectos.
- **Valdivia es la sucursal de SegurIA para el sur de Chile**, con presencia regional en la Región de Los Ríos.
- La sucursal de Valdivia refuerza el desarrollo de proyectos en La Araucanía, Los Ríos y Los Lagos, especialmente en operaciones rurales, remotas, hoteleras, productivas y patrimoniales.
- No se crean páginas doorway por ciudad ni se inventan sedes adicionales.
- La factibilidad de cada proyecto se valida por alcance, infraestructura, logística, conectividad y condiciones del sitio.
- El posicionamiento regional debe reforzar integración de infraestructura existente, Edge, continuidad ante conectividad degradada, evidencia, incidentes y Vision.

Página pilar implementada:

- `/es/seguridad-inteligente-chile`
- `/en/seguridad-inteligente-chile`

## Política de dominio canónico

La identidad web de largo plazo de SegurIA es:

```text
https://seguria.tech
```

`https://segur-ia.cl` pertenece a la misma organización SegurIA y se trata como **dominio legacy de la misma empresa**, no como entidad o producto separado.

Reglas:

- `seguria.tech` es el único dominio canónico para contenido nuevo, metadata, sitemap, structured data, `llms.txt`, campañas y referencias controladas.
- `segur-ia.cl` puede permanecer temporalmente en `sameAs` mientras siga aportando señal histórica de identidad.
- no se publica contenido canónico nuevo duplicado en ambos dominios;
- el cutover final deberá usar redirects server-side permanentes (`301` o `308`) URL-a-URL hacia el equivalente más cercano en `seguria.tech`;
- evitar redirect chains y redirects masivos irrelevantes hacia homepage;
- mantener redirects al menos un año y preferiblemente de forma indefinida cuando sea viable;
- actualizar Search Console, perfiles, campañas, directorios y backlinks controlables hacia `seguria.tech`;
- tras estabilizar la migración se podrá retirar `segur-ia.cl` de `sameAs` si deja de aportar evidencia útil.

Plan operativo: `docs/marketing/DOMAIN_CONSOLIDATION_PLAN.md`.

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
- sitemap;
- robots;
- `llms.txt`;
- referencias semánticas SegurIA ↔ N3uralia;
- atribución visible **Powered by N3uralia**;
- entity graph corregido;
- estrategia Brandin en `docs/marketing/BRAND_DISCOVERY_STRATEGY.md`;
- `seguria.tech` definido como identidad web canónica de largo plazo;
- `segur-ia.cl` documentado como dominio legacy de la misma organización;
- corrección de títulos localizados para evitar duplicar `SegurIA Security Suite`;
- schema corregido para usar `/seguria-logo.png` y `/es/contacto`;
- structured data geográfico ampliado con Santiago, Valdivia, La Araucanía, Los Ríos y Los Lagos sin inventar nuevas sedes.

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

### PASS — sitemap canónico y metadata de landings

Brandin detectó que el sitemap trataba todas las rutas como localizadas aunque varias capacidades existen como páginas canónicas no localizadas. Se corrigió la arquitectura para evitar anunciar URLs `/es/...` y `/en/...` inexistentes para esas capacidades.

Implementado:

- sitemap separado entre rutas localizadas reales y rutas canónicas de capacidades;
- hreflang solamente en páginas que efectivamente tienen variantes ES/EN;
- metadata específica para `/soluciones`;
- metadata específica para campos, propiedades y hotelería;
- metadata específica para `/integraciones`;
- metadata específica para `/contacto`;
- helper central `lib/marketing-page-metadata.ts` para mantener canonical, hreflang y Open Graph consistentes.

Commits principales:

- `123b36507ff18778b08a06880285ec04ad81c9a7` — sitemap alineado con rutas canónicas;
- `cd7d013b2ef5d2708c8003edb6b78a8a4c80211c` — metadata centralizada para landings.

### PASS — arquitectura geográfica Santiago + Valdivia + sur de Chile

Implementado:

- Santiago preservado explícitamente como base operacional nacional;
- Valdivia definida como sucursal del sur de Chile;
- página pilar ES/EN para `seguridad-inteligente-chile`;
- foco regional explícito en La Araucanía, Los Ríos y Los Lagos;
- contenido orientado a operaciones rurales, remotas, hoteleras, productivas y patrimoniales;
- explicación visible de Edge, conectividad degradada e integración de infraestructura existente como ventajas relevantes para terreno;
- footer global con Santiago y Valdivia visibles;
- sitemap actualizado;
- `llms.txt` actualizado con geografía canónica y URLs reales;
- README sincronizado.

Commits principales:

- `be6735d43e8ebf952149fd04c55778b20af6f207` — página pilar Chile/Santiago/sur;
- `4ce6c69895926d08ae7e89153a85ce625ec7f99f` — Valdivia visible como sucursal sur en footer;
- `51bff9bd5503ad6500f4846d157ecbe59b6944c6` — página pilar alineada con Santiago + Valdivia;
- `13e4d043ec17bd6a7134c751f89bca0e9c483586` — LLMO/geografía Valdivia;
- `b22244bb9b7a8f8561902e6bf63b365cd8589dee` — README.

### HOLD — cutover final de segur-ia.cl

La política y el destino canónico están definidos, pero el traslado del dominio legacy todavía requiere ejecutar cambios sobre `segur-ia.cl`:

1. inventario de URLs legacy;
2. mapping URL-a-URL a `seguria.tech`;
3. redirects `301`/`308`;
4. actualización de Search Console / Change of Address cuando aplique;
5. actualización de enlaces externos controlados;
6. monitoreo de 404, cobertura, impresiones, branded queries y conversiones.

No declarar PASS del traslado hasta verificar redirects y señales de indexación reales.

### HOLD — posicionamiento orgánico regional medible

La implementación técnica y de contenido no equivale a ranking real.

Para declarar PASS de posicionamiento regional se requiere evidencia real de:

- indexación de la página pilar;
- impresiones y consultas en Google Search Console;
- branded search de SegurIA;
- consultas geográficas relacionadas con Santiago, Valdivia, Los Ríos y sur de Chile;
- consultas no-brand relacionadas con seguridad inteligente, cámaras/IA, campos, hotelería y operaciones remotas;
- tráfico por región/landing;
- conversiones y leads calificados;
- backlinks/referrals regionales reales;
- menciones/citas verificables en motores generativos.

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

Completado:

- categoría visible en homepage;
- sitemap corregido contra la arquitectura real de rutas;
- metadata específica de las principales landings localizadas;
- arquitectura geográfica Santiago + Valdivia + sur de Chile;
- página pilar geográfica;
- internal link global inicial;
- `seguria.tech` definido como dominio canónico único de largo plazo;
- plan de consolidación de `segur-ia.cl` documentado;
- schema geográfico y rutas de identidad corregidos;
- `llms.txt`, README y roadmap sincronizados.

Siguiente trabajo de mayor impacto:

1. Ejecutar el cutover de `segur-ia.cl` cuando exista acceso/control operativo del dominio legacy.
2. Reforzar internal linking entre `/soluciones`, capacidades, industrias, página geográfica y `/contacto`.
3. Crear breadcrumbs/relaciones semánticas donde aporten contexto real.
4. Revisar intención y profundidad de cada landing para evitar páginas thin o duplicadas.
5. Decidir si las páginas de capacidades deben permanecer canónicas no localizadas o migrar a una arquitectura ES/EN completa antes de publicar hreflang para ellas.
6. Mejorar rutas de conversión desde páginas de intención alta.
7. Construir autoridad regional alrededor de Valdivia y sur de Chile con casos, referencias, partners y evidencia real cuando existan.
8. Mantener `llms.txt`, JSON-LD, README, estrategia y roadmap sincronizados.
9. Medir Search Console, branded search, conversiones por landing, backlinks relevantes y leads calificados.
10. Tratar visibilidad en motores generativos como señal complementaria, no como métrica aislada.

Modelo de contenido:

```text
N3uralia
  -> SegurIA Security Suite
      -> canonical web identity: seguria.tech
      -> Chile
          -> Santiago = base operacional nacional
          -> Valdivia = sucursal sur de Chile
              -> La Araucanía / Los Ríos / Los Lagos
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
- `seguria.tech` como dominio predominante en resultados y referencias controladas;
- crecimiento de consultas geográficas Santiago/Valdivia/Los Ríos/sur de Chile cuando correspondan a demanda real;
- páginas de entrada que generan contacto;
- conversiones medibles por landing;
- backlinks/referrals relevantes;
- cobertura e indexación saludables;
- sitemap sin URLs inexistentes o variantes falsas;
- menciones/citas en motores generativos solo cuando puedan verificarse;
- leads calificados atribuibles a superficies orgánicas.

## Criterio de release

### PASS

Verificaciones relevantes ejecutadas y sin blocker material conocido.

### HOLD

Implementación mayormente correcta pero falta una verificación requerida. Vision autenticado E2E, cutover final de `segur-ia.cl` y posicionamiento orgánico regional medible permanecen aquí hasta existir evidencia suficiente.

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