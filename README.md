# SegurIA

**SegurIA Security Suite — seguridad física, operación, evidencia, Vision, Edge y continuidad operacional.**

[Powered by N3uralia](https://www.n3uralia.com)

SegurIA es una **Security Suite** diseñada para unificar en una sola plataforma las capas que normalmente están fragmentadas entre CCTV, alarmas, sensores, control operacional, incidentes, evidencia, analítica visual, edge computing y administración multiempresa.

No es solo un portal de cámaras ni una aplicación de monitoreo. SegurIA conecta infraestructura física, software, operación, evidencia e inteligencia para convertir señales de terreno en contexto, decisiones, alertas, incidentes y acciones trazables.

Los motores tecnológicos reutilizables —inteligencia, automatización, análisis, orquestación y lógica diferencial— pertenecen a **N3uralia**. SegurIA los utiliza para construir una suite especializada en seguridad y continuidad operacional.

```text
N3uralia
  -> motores tecnológicos e inteligencia reutilizable
       -> SegurIA Security Suite
            -> capacidades
                 -> industrias y casos de uso
                      -> operación y conversión
```

Principio de arquitectura:

> procesar cerca del lugar, mover solo la información necesaria y mantener una verdad operacional segura, auditable y accionable.

---

## Qué es la SegurIA Security Suite

La suite reúne actualmente:

- Centro de Control operacional;
- infraestructura de seguridad;
- cámaras, sensores y dispositivos;
- gateways por instalación;
- inventario y estado de hardware;
- heartbeat y continuidad de conectividad;
- eventos normalizados;
- alertas e incidentes;
- evidencia privada y trazable;
- snapshots autenticados;
- video protegido cuando aplica;
- automatizaciones sobre eventos;
- Vision y análisis inteligente;
- revisión humana de resultados de IA;
- Edge local para RTSP y procesamiento photo-first;
- operación resiliente con spool offline y reintentos;
- tenancy multiempresa;
- organizaciones, propiedades, operaciones y roles;
- Supabase Auth + Row Level Security;
- discovery SEO, GEO, LLMO y AEO;
- integración tecnológica explícita con N3uralia.

La suite está diseñada para proteger **personas, instalaciones, activos, infraestructura crítica y entornos naturales** sin depender de una única marca de hardware.

No se utilizan métricas simuladas para representar readiness u operación real.

---

## Las 6 superficies principales de la suite

### 1. Centro de Control

Visión ejecutiva y operacional del estado de la seguridad.

Incluye resumen general, propiedades o espacios operativos, estado de dispositivos, señales activas, casos abiertos, prioridades y acceso rápido a cámaras, incidentes y actividad.

### 2. Infraestructura

Consolida propiedades, cámaras, sensores, dispositivos, gateways, heartbeat, inventario y estado operacional. SegurIA busca desacoplar la experiencia de marcas específicas mediante contratos propios de integración.

### 3. Incidentes

Convierte eventos técnicos en gestión operacional con alertas, severidad, estado, reconocimiento, resolución, descarte, trazabilidad y contexto de propiedad, cámara o dispositivo.

### 4. Evidencia

Centraliza snapshots autenticados, evidencia privada en Storage, actividad reciente, historial, trazabilidad y sesiones efímeras de video cuando corresponde. Las credenciales RTSP y secretos de origen permanecen fuera del navegador.

### 5. Vision

SegurIA expone workflows de inteligencia visual sobre motores N3uralia.

Capacidades actuales:

- análisis de evidencia fotográfica;
- scope explícito por `operation_id`;
- identidad de cámaras por operación;
- idempotencia de inferencias;
- quality diagnostics;
- detección de evidencia oscura o borrosa;
- tratamiento correcto de capturas infrarrojas;
- detección de inactividad prolongada;
- revisión humana;
- confirmación, corrección, rechazo o evidencia no identificable;
- control de precisión de coordenadas según rol;
- alertas derivadas de detecciones o fallas de inferencia.

Modelo de ownership:

```text
Organization -> Property -> Operation -> Vision resources
```

Para Vision, `operation_id` es el scope operacional canónico.

Identidad de cámaras:

```text
UNIQUE(operation_id, code)
```

Idempotencia de inferencias:

```text
UNIQUE(operation_id, sha256, model_name)
```

Endpoint principal:

```text
POST /api/vision/openai/infer
x-operation-id: <operation UUID>
```

### 6. Edge

El agente actual vive en [`edge/seguria-edge-vision`](edge/seguria-edge-vision). El nombre del directorio es una referencia técnica del repositorio y no representa un motor independiente de N3uralia.

Flujo:

```text
RTSP local
  -> muestreo liviano
  -> motion/change gate
  -> ráfaga corta
  -> filtro de calidad
  -> deduplicación
  -> selección de mejor frame
  -> snapshot autenticado
  -> SegurIA
  -> motores N3uralia cuando corresponde
```

Principios:

- video continuo permanece en la LAN;
- al cloud llega solo evidencia seleccionada cuando el caso lo permite;
- diseño CPU-first para Mini PC;
- compatibilidad con cámaras que expongan RTSP local;
- spool offline;
- reintentos al recuperar conectividad;
- deduplicación para evitar procesamiento repetido;
- no se generan detecciones ficticias para completar estados vacíos.

---

## Posicionamiento y discovery — Brandin

La estrategia de mercado y descubrimiento se mantiene como una capa permanente del producto.

Modelo canónico:

```text
N3uralia
  -> SegurIA Security Suite
       -> categoría
            -> capacidades
                 -> industrias / casos de uso
                      -> evidencia y páginas públicas
                           -> conversión
```

Objetivos:

- fijar **SegurIA Security Suite** como categoría principal;
- mantener una definición consistente para personas, buscadores y motores generativos;
- conectar cada capability con evidencia real y páginas públicas;
- preservar siempre la relación tecnológica correcta con N3uralia;
- evitar keyword stuffing, páginas thin, doorway pages y claims no verificables;
- optimizar para SEO técnico, GEO, LLMO/AEO, branded search, internal linking y conversión;
- medir resultados mediante Search Console, conversiones por landing, backlinks/referrals y leads calificados.

La arquitectura de contenido se organiza en tres niveles:

1. **Categoría:** SegurIA Security Suite.
2. **Capacidades:** Centro de Control, Infraestructura, Incidentes, Evidencia, Vision, Edge, IA para cámaras, protección perimetral e integraciones.
3. **Industrias/casos de uso:** campos, hotelería, propiedades, personas, vehículos, animales y operaciones remotas.

Documento canónico de estrategia:

- [`docs/marketing/BRAND_DISCOVERY_STRATEGY.md`](docs/marketing/BRAND_DISCOVERY_STRATEGY.md)

---

## Arquitectura de la Security Suite

```text
Cámaras / sensores / sistemas locales
                |
                v
       Gateway / agente local
  - RTSP y dispositivos locales
  - inventario / heartbeat
  - motion gate / frame selection
  - buffer y spool offline
  - normalización de eventos
                |
                v
          APIs protegidas
  - identidad del gateway
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
  - administración y operación
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

La arquitectura es **local-first, cloud-coordinated**: una instalación puede continuar capturando y acumulando trabajo durante interrupciones de conectividad mientras la plataforma conserva ownership, autorización, políticas y estado canónico.

---

## Gateway e integración de terreno

Endpoints principales:

```text
POST /api/gateway/inventory
POST /api/gateway/devices/state
POST /api/gateway/events
POST /api/gateway/heartbeat
POST /api/gateway/cameras/snapshot
```

El gateway puede sincronizar inventario, reportar estado, enviar eventos, reportar heartbeat, subir snapshots autenticados y mantener cola local con reintentos después de una caída de Internet.

Contrato técnico: [`docs/security/gateway-connector-contract.md`](docs/security/gateway-connector-contract.md).

---

## Seguridad, tenancy y control de acceso

Portal empresarial:

```text
organization -> property -> resource
```

Operación Vision:

```text
operation -> property -> organization
```

Reglas estructurales:

- conocer un UUID no concede acceso;
- recursos protegidos tienen una ruta relacional determinística hacia su owner;
- secretos y service-role permanecen server-side;
- RLS es parte de la arquitectura;
- acciones sensibles siguen deny-by-default;
- actor histórico y ownership son conceptos distintos;
- datos legacy ambiguos no se reasignan sin evidencia canónica;
- migraciones sensibles siguen expand -> migrate -> contract.

---

## Powered by N3uralia

**SegurIA es la Security Suite. N3uralia es la capa tecnológica que la impulsa.**

N3uralia aporta motores de inteligencia, automatización, análisis, orquestación, procesamiento de datos, lógica diferencial reutilizable y capacidades compartidas entre productos.

Sitio oficial: **https://www.n3uralia.com**

SegurIA especializa esas capacidades en seguridad física, seguridad operacional, monitoreo, infraestructura conectada, cámaras y sensores, gateways, incidentes, evidencia, Vision, Edge y continuidad operacional.

---

## SEO, GEO, LLMO y AEO

La capa de descubrimiento incorpora:

- canonical URLs;
- metadata global y localizada por Next.js;
- Open Graph y Twitter metadata;
- JSON-LD / Schema.org con entity graph coherente;
- referencias semánticas SegurIA ↔ N3uralia;
- sitemap multilenguaje;
- `robots.txt`;
- `llms.txt`;
- hreflang y `x-default`;
- internal linking por categoría, capability e industria;
- definición explícita de `SegurIA Security Suite`;
- `Powered by N3uralia` como relación tecnológica explícita.

Archivos principales:

- [`app/layout.tsx`](app/layout.tsx)
- [`app/[locale]/layout.tsx`](app/[locale]/layout.tsx)
- [`app/sitemap.ts`](app/sitemap.ts)
- [`app/robots.ts`](app/robots.ts)
- [`public/llms.txt`](public/llms.txt)
- [`docs/marketing/BRAND_DISCOVERY_STRATEGY.md`](docs/marketing/BRAND_DISCOVERY_STRATEGY.md)

---

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
- Supabase PostgreSQL
- Supabase Auth
- Row Level Security
- Supabase Storage
- Vercel
- gateways locales
- agente Python photo-first
- motores N3uralia mediante contratos internos y APIs del producto

---

## Verificación

Comandos útiles:

```bash
pnpm install
pnpm dev
pnpm verify
pnpm typecheck
pnpm test:vision-access
pnpm test:vision-quality
pnpm test:seguria-alerts
pnpm db:health
pnpm security:contracts
pnpm smoke:client-portal
pnpm smoke:operational
```

---

## Documentación canónica

- [`ROADMAP.md`](ROADMAP.md) — arquitectura, estado, prioridades y Definition of Done.
- [`DESIGN.md`](DESIGN.md) — sistema visual, UX y reglas de marca.
- [`docs/marketing/BRAND_DISCOVERY_STRATEGY.md`](docs/marketing/BRAND_DISCOVERY_STRATEGY.md) — posicionamiento, SEO, GEO, LLMO/AEO y discovery.
- [`docs/security/gateway-connector-contract.md`](docs/security/gateway-connector-contract.md) — contrato del gateway.
- [`edge/seguria-edge-vision/ARCHITECTURE.md`](edge/seguria-edge-vision/ARCHITECTURE.md) — arquitectura técnica del agente local.
- [`edge/seguria-edge-vision/README.md`](edge/seguria-edge-vision/README.md) — despliegue y operación Edge.

---

## Estado actual

`main` es la rama de producción.

La experiencia cliente está organizada alrededor de seis superficies de una única **SegurIA Security Suite**:

```text
Centro de Control
Infraestructura
Incidentes
Evidencia
Vision
Edge
```

Estado del bloque Brandin / discovery:

- metadata localizada alineada con **Security Suite**;
- entity graph JSON-LD corregido;
- `llms.txt` sincronizado;
- estrategia Brandin documentada;
- `ROADMAP.md` sincronizado;
- deployments recientes verificados `READY` en Vercel;
- sin errores runtime detectados en la última verificación del bloque.

El siguiente P1 es llevar esta misma claridad de categoría al copy visible de la homepage y reforzar la arquitectura semántica entre categoría, capacidades e industrias.

---

## Desarrollo con v0

[Continue working on v0](https://v0.app/chat/projects/prj_3kTNF2QMxVmGVRjdLzfBj9mGHkEn)
