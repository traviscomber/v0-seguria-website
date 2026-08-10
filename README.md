# SegurIA Security Suite

**Security Suite integral para seguridad física, operación, evidencia, inteligencia visual y continuidad operacional.**

[Powered by N3uralia](https://www.n3uralia.com)

SegurIA unifica infraestructura física, software, monitoreo, incidentes, evidencia, Vision, Edge y operación multiempresa dentro de una sola suite.

No es solo CCTV, un dashboard de cámaras ni una herramienta aislada de IA. SegurIA convierte señales de terreno en contexto, decisiones, alertas, incidentes y acciones trazables.

Los motores tecnológicos reutilizables —inteligencia, automatización, análisis, orquestación y lógica diferencial— pertenecen a **N3uralia**. SegurIA los especializa para seguridad y continuidad operacional.

```text
N3uralia
  -> tecnología y motores reutilizables
      -> SegurIA Security Suite
          -> capacidades
              -> industrias / casos de uso
                  -> evidencia / explicación
                      -> conversión
```

## Dominio e identidad web canónica

**`https://seguria.tech` es la identidad web canónica de SegurIA Security Suite.**

`https://segur-ia.cl` pertenece a la misma organización SegurIA y se mantiene únicamente como dominio legado durante el período de consolidación. No debe recibir contenido canónico nuevo ni competir con `seguria.tech` como fuente principal.

Política:

- todo contenido nuevo, metadata, sitemap, structured data, `llms.txt`, campañas y enlaces controlados deben apuntar a `seguria.tech`;
- `segur-ia.cl` puede mantenerse temporalmente como señal `sameAs` mientras siga aportando identidad o enlaces históricos;
- en el cutover final, cada URL legacy debe redirigir mediante `301` o `308` directamente a su equivalente más cercano en `seguria.tech`;
- después de estabilizar la migración, `segur-ia.cl` podrá eliminarse de `sameAs` si deja de aportar evidencia útil de identidad.

Plan detallado: [`docs/marketing/DOMAIN_CONSOLIDATION_PLAN.md`](docs/marketing/DOMAIN_CONSOLIDATION_PLAN.md).

## Posicionamiento geográfico en Chile

SegurIA mantiene su **base operacional en Vitacura, Santiago**. Santiago concentra coordinación comercial, arquitectura, soporte y gestión nacional de proyectos, y sigue siendo el centro operacional de la estrategia chilena.

SegurIA cuenta además con **sucursal para el sur de Chile en Valdivia, Región de Los Ríos**. Valdivia funciona como presencia regional para reforzar el desarrollo de proyectos en el centro-sur y sur, especialmente en operaciones rurales, remotas, hoteleras, productivas y patrimoniales.

Estructura geográfica canónica:

- **Santiago / Vitacura** — base operacional nacional;
- **Valdivia / Los Ríos** — sucursal sur de Chile;
- **La Araucanía, Los Ríos y Los Lagos** — foco regional de desarrollo comercial y proyectos;
- otras zonas de Chile — sujetas a factibilidad técnica, logística y comercial.

Página pilar: [`/es/seguridad-inteligente-chile`](https://seguria.tech/es/seguridad-inteligente-chile).

No se crean páginas doorway por ciudad ni se inventan sedes adicionales.

## Las 6 superficies de la suite

### 1. Centro de Control

Estado general, prioridades, propiedades, dispositivos, incidentes y actividad operacional.

### 2. Infraestructura

Cámaras, sensores, gateways, inventario, heartbeat, dispositivos y estado operacional.

### 3. Incidentes

Alertas, severidad, reconocimiento, resolución, descarte y trazabilidad.

### 4. Evidencia

Snapshots autenticados, Storage privado, media protegida, actividad y contexto operacional.

### 5. Vision

Análisis visual con scope por operación, quality diagnostics, human review e inferencia derivada.

### 6. Edge

RTSP local, motion/change gate, selección de frames, deduplicación, spool offline y reintentos.

Estas superficies forman una única **SegurIA Security Suite**; no son productos independientes.

## Arquitectura

```text
Cámaras / sensores / sistemas locales
                |
                v
       Gateway / agente local
  - RTSP
  - inventario / heartbeat
  - motion/change gate
  - frame selection
  - buffer / spool offline
                |
                v
          APIs protegidas
  - identidad de gateway
  - autorización
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

Principio:

> procesar cerca del lugar, mover solo la información necesaria y mantener una verdad operacional segura, auditable y accionable.

## Vision: ownership e idempotencia

Modelo canónico:

```text
Organization -> Property -> Operation -> Vision resources
```

- `operation_id` es el scope operacional canónico.
- Actor histórico y ownership son conceptos distintos.
- Conocer un UUID no concede acceso.

Cámaras:

```text
UNIQUE(operation_id, code)
```

Inferencias:

```text
UNIQUE(operation_id, sha256, model_name)
```

Endpoint principal:

```text
POST /api/vision/openai/infer
x-operation-id: <operation UUID>
```

## Edge local

El agente actual vive en [`edge/seguria-edge-vision`](edge/seguria-edge-vision). El nombre es un identificador técnico del repositorio; no representa un motor independiente de N3uralia.

```text
RTSP local
  -> muestreo
  -> motion/change gate
  -> burst
  -> quality filter
  -> deduplicación
  -> best frame
  -> snapshot autenticado
  -> SegurIA
  -> motores N3uralia cuando corresponde
```

Principios:

- video continuo permanece en LAN;
- al cloud llega evidencia seleccionada cuando el caso lo permite;
- CPU-first para Mini PC;
- spool offline y reintentos;
- no se generan detecciones ficticias.

## Gateway

Endpoints principales:

```text
POST /api/gateway/inventory
POST /api/gateway/devices/state
POST /api/gateway/events
POST /api/gateway/heartbeat
POST /api/gateway/cameras/snapshot
```

Contrato: [`docs/security/gateway-connector-contract.md`](docs/security/gateway-connector-contract.md).

## Seguridad y tenancy

Portal:

```text
organization -> property -> resource
```

Vision:

```text
operation -> property -> organization
```

Reglas:

- RLS forma parte de la arquitectura;
- secretos/service-role permanecen server-side;
- acciones sensibles son deny-by-default;
- RTSP credentials no llegan al navegador;
- datos legacy ambiguos no se reasignan sin evidencia canónica;
- migraciones sensibles siguen expand -> migrate -> contract.

## Powered by N3uralia

**SegurIA es la Security Suite. N3uralia es la capa tecnológica que la impulsa.**

N3uralia aporta tecnología reutilizable para inteligencia, automatización, análisis, orquestación, procesamiento y lógica diferencial. SegurIA aplica esas capacidades a seguridad física y operación.

Sitio oficial: https://www.n3uralia.com

## Brandin: SEO, GEO, LLMO y posicionamiento

La estrategia de discovery no se limita a metadata. La arquitectura de posicionamiento es:

```text
Categoría
  SegurIA Security Suite

Mercado
  Chile
    -> Santiago = base operacional nacional
    -> Valdivia = sucursal sur de Chile
    -> La Araucanía / Los Ríos / Los Lagos = foco regional

Capacidades
  Centro de Control
  Infraestructura
  Incidentes
  Evidencia
  Vision
  Edge
  IA para cámaras
  analítica de video
  protección perimetral
  integraciones

Industrias / casos de uso
  campos
  propiedades
  hotelería
  personas
  vehículos
  animales
  operaciones remotas
```

Implementado:

- categoría **Security Suite** visible en homepage ES/EN;
- Santiago preservado como base operacional nacional;
- Valdivia definida como sucursal del sur de Chile;
- página pilar Chile + Santiago + Valdivia + sur de Chile;
- foco regional explícito en La Araucanía, Los Ríos y Los Lagos;
- las seis superficies visibles y explicadas;
- metadata global y localizada;
- canonical + hreflang;
- Open Graph;
- JSON-LD / Schema.org;
- entity graph SegurIA ↔ N3uralia;
- `seguria.tech` definido como dominio canónico único de largo plazo;
- plan de consolidación desde `segur-ia.cl` documentado;
- sitemap alineado con rutas canónicas;
- `robots.txt`;
- [`public/llms.txt`](public/llms.txt) alineado con la arquitectura de rutas, geografía y dominio canónico;
- `Powered by N3uralia` visible;
- estrategia canónica en [`docs/marketing/BRAND_DISCOVERY_STRATEGY.md`](docs/marketing/BRAND_DISCOVERY_STRATEGY.md).

Próxima fase Brandin:

1. internal linking capacidad -> industria -> geografía -> conversión;
2. breadcrumbs y relaciones semánticas donde correspondan;
3. revisión de thin/duplicate intent;
4. optimización de conversión en páginas de intención alta;
5. ejecutar el cutover de `segur-ia.cl` cuando tengamos acceso/control del dominio legacy;
6. medición mediante Search Console, branded search, conversiones, backlinks y leads calificados;
7. construir autoridad regional con evidencia real, casos y referencias cuando existan.

Evitar keyword stuffing, doorway pages, fake FAQs, fake reviews y contenido masivo sin valor original.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
- Supabase PostgreSQL
- Supabase Auth + RLS
- Supabase Storage
- Vercel
- gateways locales
- agente Python photo-first

## Verificación

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

## Estado actual

`main` es la rama de producción.

PASS:

- base multiempresa;
- ownership Vision;
- idempotencia por operación;
- Wildlife/Huilo Huilo hardening;
- seis superficies del portal;
- branding N3uralia;
- SEO/GEO/LLMO base;
- categoría Security Suite visible en homepage ES/EN;
- arquitectura geográfica Santiago + Valdivia + sur de Chile implementada en contenido y discovery;
- `seguria.tech` establecido como identidad web canónica y preparado para consolidar el dominio legacy.

HOLD:

- verificación autenticada end-to-end de Vision con sesión real;
- posicionamiento orgánico regional medible: requiere indexación y datos reales de Search Console/consultas, no se infiere desde implementación;
- cutover final de `segur-ia.cl`: requiere control del dominio legacy para aplicar redirects y Change of Address.

El estado, prioridades y gates completos se mantienen en [`ROADMAP.md`](ROADMAP.md), que forma parte del Definition of Done del proyecto.

## Documentación canónica

- [`ROADMAP.md`](ROADMAP.md)
- [`DESIGN.md`](DESIGN.md)
- [`docs/marketing/BRAND_DISCOVERY_STRATEGY.md`](docs/marketing/BRAND_DISCOVERY_STRATEGY.md)
- [`docs/marketing/DOMAIN_CONSOLIDATION_PLAN.md`](docs/marketing/DOMAIN_CONSOLIDATION_PLAN.md)
- [`docs/security/gateway-connector-contract.md`](docs/security/gateway-connector-contract.md)
- [`edge/seguria-edge-vision/ARCHITECTURE.md`](edge/seguria-edge-vision/ARCHITECTURE.md)
- [`edge/seguria-edge-vision/README.md`](edge/seguria-edge-vision/README.md)

## Desarrollo con v0

[Continue working on v0](https://v0.app/chat/projects/prj_3kTNF2QMxVmGVRjdLzfBj9mGHkEn)
