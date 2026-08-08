# SegurIA

**Security Suite integral para seguridad física, operación, evidencia, inteligencia visual y continuidad operacional.**

[Powered by N3uralia](https://www.n3uralia.com)

SegurIA es una **Security Suite** diseñada para unificar en una sola plataforma las capas que normalmente están fragmentadas entre CCTV, alarmas, sensores, control operacional, incidentes, evidencia, analítica visual, edge computing y administración multiempresa.

No es solo un portal de cámaras ni una aplicación de monitoreo. SegurIA conecta infraestructura física, software, operación, evidencia e inteligencia para convertir señales de terreno en contexto, decisiones, alertas, incidentes y acciones trazables.

Los motores tecnológicos reutilizables —inteligencia, automatización, análisis, orquestación y lógica diferencial— pertenecen a **N3uralia**. SegurIA los utiliza para construir una suite especializada en seguridad y continuidad operacional.

```text
N3uralia
  -> motores tecnológicos e inteligencia reutilizable
       -> SegurIA Security Suite
            -> seguridad física + operación + evidencia + Vision + Edge
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
- discovery SEO, GEO y LLMO;
- integración tecnológica explícita con N3uralia.

La suite está diseñada para proteger **personas, instalaciones, activos, infraestructura crítica y entornos naturales** sin depender de una única marca de hardware.

No se utilizan métricas simuladas para representar readiness u operación real.

---

## Las 6 superficies principales de la suite

### 1. Centro de Control

Visión ejecutiva y operacional del estado de la seguridad.

Incluye:

- resumen general;
- propiedades o espacios operativos;
- estado de dispositivos;
- señales activas;
- casos abiertos;
- prioridades;
- acceso rápido a cámaras, incidentes y actividad.

El dashboard se construye desde datos persistidos y adapta vocabulario y contexto según el cliente u operación.

### 2. Infraestructura

Consolida la capa física y conectada de la operación.

Incluye:

- propiedades y sitios;
- cámaras;
- sensores;
- dispositivos;
- gateways locales;
- heartbeat;
- inventario;
- estado operacional;
- integración con infraestructura existente.

SegurIA busca desacoplar la experiencia de marcas específicas mediante contratos propios de integración.

### 3. Incidentes

Convierte eventos técnicos en gestión operacional.

Incluye:

- alertas;
- incidentes;
- severidad;
- estado;
- reconocimiento;
- resolución;
- descarte;
- trazabilidad;
- contexto de propiedad, cámara o dispositivo.

Las reglas pueden combinar señales de infraestructura, actividad operacional y resultados derivados de Vision.

### 4. Evidencia

Centraliza evidencia y contexto de seguridad.

Incluye:

- snapshots autenticados;
- evidencia privada en Storage;
- actividad reciente;
- relación entre evento, dispositivo, propiedad y operación;
- acceso protegido;
- historial;
- trazabilidad;
- sesiones efímeras de video cuando corresponde.

Las credenciales RTSP y secretos de origen permanecen fuera del navegador.

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

La suite extiende inteligencia y resiliencia hacia terreno.

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

El gateway puede:

- sincronizar inventario;
- reportar estado de dispositivos;
- enviar eventos;
- reportar heartbeat;
- subir snapshots autenticados;
- mantener cola local y reintentar después de una caída de Internet.

Contrato técnico: [`docs/security/gateway-connector-contract.md`](docs/security/gateway-connector-contract.md).

---

## Seguridad, tenancy y control de acceso

SegurIA mantiene separados los scopes empresariales y operacionales.

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

## Alertas e inteligencia operacional

Actualmente existen reglas y tests para escenarios como:

- detecciones relevantes de fauna;
- presencia humana en zonas sensibles;
- fallas de inferencia;
- inactividad prolongada de cámaras.

El sistema conserva estado y trazabilidad para reconocimiento, resolución, descarte y auditoría.

El objetivo de la suite es que una señal no termine simplemente como una notificación: debe poder convertirse en contexto, prioridad, incidente y acción operacional.

---

## Powered by N3uralia

**SegurIA es la Security Suite. N3uralia es la capa tecnológica que la impulsa.**

N3uralia aporta:

- motores de inteligencia;
- automatización;
- análisis;
- orquestación;
- procesamiento de datos;
- lógica diferencial reutilizable;
- capacidades compartidas entre productos.

Sitio oficial: **https://www.n3uralia.com**

SegurIA especializa esas capacidades en:

- seguridad física;
- seguridad operacional;
- monitoreo;
- infraestructura conectada;
- cámaras y sensores;
- gateways;
- incidentes;
- evidencia;
- Vision;
- Edge;
- continuidad operacional.

Esta separación mantiene la propiedad intelectual reusable centralizada en N3uralia sin reducir SegurIA a un único módulo o vertical técnico.

---

## SEO, GEO y LLMO

El sitio incorpora una capa de descubrimiento orientada a buscadores tradicionales y motores generativos.

Incluye:

- canonical URLs;
- metadata por Next.js;
- Open Graph;
- Twitter metadata;
- JSON-LD / Schema.org;
- referencias semánticas SegurIA ↔ N3uralia;
- sitemap multilenguaje;
- `robots.txt`;
- `llms.txt`;
- keywords relacionadas con seguridad, cámaras, IA, conectividad y operaciones;
- `Powered by N3uralia` como relación tecnológica explícita.

Archivos principales:

- [`app/layout.tsx`](app/layout.tsx)
- [`app/sitemap.ts`](app/sitemap.ts)
- [`app/robots.ts`](app/robots.ts)
- [`public/llms.txt`](public/llms.txt)

---

## Stack

Aplicación:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI

Datos e identidad:

- Supabase PostgreSQL
- Supabase Auth
- Row Level Security
- Supabase Storage

Runtime:

- Vercel
- gateways locales
- agente Python photo-first
- motores N3uralia mediante contratos internos y APIs del producto

---

## Verificación

El build productivo ejecuta automáticamente pruebas de:

- alertas;
- quality diagnostics;
- access control;
- producción Next.js.

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

- [`ROADMAP.md`](ROADMAP.md) — arquitectura, estado y secuencia de evolución.
- [`DESIGN.md`](DESIGN.md) — sistema visual, UX y reglas de marca.
- [`docs/security/gateway-connector-contract.md`](docs/security/gateway-connector-contract.md) — contrato del gateway.
- [`edge/seguria-edge-vision/ARCHITECTURE.md`](edge/seguria-edge-vision/ARCHITECTURE.md) — arquitectura técnica del agente local.
- [`edge/seguria-edge-vision/README.md`](edge/seguria-edge-vision/README.md) — despliegue y operación Edge.

---

## Dirección de producto

SegurIA busca que la seguridad deje de comportarse como una colección de cámaras, alarmas, apps, sistemas de acceso y paneles aislados.

La dirección es construir una **Security Suite integrada** capaz de:

1. conectar infraestructura física heterogénea;
2. mantener captura y resiliencia cerca del lugar;
3. normalizar hardware y proveedores detrás de contratos propios;
4. centralizar evidencia, incidentes y operación;
5. mantener ownership, autorización y auditoría en estado canónico;
6. mover evidencia en lugar de video continuo cuando el caso lo permita;
7. aplicar motores N3uralia como capa inteligente, explicable y revisable;
8. convertir eventos en decisiones, alertas, incidentes y acciones medibles;
9. extender el mismo modelo a personas, infraestructura, activos y entornos naturales.

---

## Estado actual

`main` es la rama de producción.

La experiencia cliente está organizada alrededor de seis superficies principales:

```text
Centro de Control
Infraestructura
Incidentes
Evidencia
Vision
Edge
```

Estas superficies forman parte de una única **SegurIA Security Suite**, no productos separados.

Los cambios recientes de producto, atribución N3uralia y discovery SEO/GEO/LLMO están integrados en `main`.

El roadmap detallado y los gates técnicos se mantienen en [`ROADMAP.md`](ROADMAP.md).

---

## Desarrollo con v0

El proyecto permanece conectado a v0 para iteración de interfaz y producto:

[Continue working on v0](https://v0.app/chat/projects/prj_3kTNF2QMxVmGVRjdLzfBj9mGHkEn)
