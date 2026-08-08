# SegurIA

**Plataforma de seguridad física inteligente, operación y visión aplicada.**

[Powered by N3uralia](https://www.n3uralia.com)

SegurIA es una solución vertical de seguridad que integra infraestructura física, gateways locales, cámaras, sensores, eventos, evidencia, incidentes y análisis visual dentro de una misma experiencia operacional.

Los motores tecnológicos reutilizables —inteligencia, automatización, análisis, orquestación y lógica diferencial— pertenecen a **N3uralia**. SegurIA los utiliza y especializa para resolver seguridad física, continuidad operacional y protección de personas, activos, infraestructura y entornos naturales.

```text
N3uralia
  -> motores tecnológicos e inteligencia reutilizable
       -> SegurIA
            -> producto vertical de seguridad física y operación
```

La arquitectura sigue un principio simple:

> procesar cerca del lugar, mover solo la información necesaria y mantener una verdad operacional segura, auditable y accionable.

---

## Qué tenemos hoy

La plataforma ya permite demostrar una operación completa de seguridad conectada:

- portal cliente multiempresa;
- organizaciones, propiedades, operaciones y roles;
- autenticación y control de acceso con Supabase Auth + RLS;
- gateways por instalación;
- inventario y estado de dispositivos;
- cámaras y sensores;
- eventos y heartbeat;
- snapshots autenticados;
- evidencia privada;
- video protegido cuando aplica;
- alertas e incidentes;
- actividad y trazabilidad operacional;
- automatizaciones sobre eventos normalizados;
- análisis visual con scope por operación;
- revisión humana de resultados de IA;
- operación local resiliente y spool offline;
- discovery técnico para buscadores y motores generativos mediante metadata, JSON-LD, sitemap, robots y `llms.txt`.

No se usan métricas simuladas para representar readiness u operación real.

---

## Los 6 módulos visibles de SegurIA

### 1. Centro de Control

Punto de entrada operacional para entender rápidamente el estado general de la operación.

Incluye:

- resumen ejecutivo;
- propiedades o espacios operativos;
- estado general de dispositivos;
- señales activas;
- casos abiertos;
- prioridades que requieren atención;
- acceso rápido a cámaras, incidentes y actividad.

El dashboard se construye desde datos persistidos y mantiene vocabulario adaptable por cliente o tipo de operación.

### 2. Infraestructura

Consolida la capa física de la operación.

Incluye:

- propiedades y sitios;
- cámaras;
- sensores y dispositivos;
- gateways locales;
- heartbeat;
- inventario;
- estado operacional;
- integración con hardware existente.

El diseño busca desacoplar la plataforma de marcas específicas de cámaras o sensores mediante contratos propios.

### 3. Incidentes

Convierte eventos técnicos en prioridades operacionales.

Incluye:

- alertas;
- incidentes;
- severidad;
- estado;
- reconocimiento y resolución;
- descarte;
- trazabilidad;
- contexto de propiedad, cámara o dispositivo.

La lógica puede combinar condiciones de infraestructura y resultados derivados de análisis visual.

### 4. Evidencia

Concentra la evidencia generada por la operación.

Incluye:

- snapshots autenticados;
- evidencia privada en Storage;
- actividad reciente;
- relación entre evento, dispositivo, propiedad y operación;
- acceso protegido;
- historial y trazabilidad;
- sesiones efímeras de video cuando corresponde.

Las credenciales RTSP y secretos de origen permanecen fuera del navegador.

### 5. Vision

SegurIA expone workflows de análisis visual sobre motores N3uralia.

Capacidades actuales:

- análisis de evidencia fotográfica;
- operación explícita mediante `operation_id`;
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

La capa local permite trabajar con cámaras existentes sin enviar video continuo al cloud.

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
- al cloud llega solo la evidencia seleccionada cuando el caso lo permite;
- diseño CPU-first para Mini PC;
- compatibilidad con cámaras que expongan RTSP local;
- spool offline;
- reintentos al recuperar conectividad;
- deduplicación para evitar procesamiento repetido;
- no se generan detecciones ficticias para completar estados vacíos.

---

## Arquitectura operacional

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
         Plataforma SegurIA
  - Centro de Control
  - Infraestructura
  - Incidentes
  - Evidencia
  - Vision
  - operación y administración
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

## Seguridad y tenancy

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

## Alertas verificadas

Actualmente existen reglas y tests para escenarios como:

- detecciones relevantes de fauna;
- presencia humana en zonas sensibles;
- fallas de inferencia;
- inactividad prolongada de cámaras.

El sistema conserva estado y trazabilidad para reconocimiento, resolución, descarte y auditoría.

---

## Powered by N3uralia

SegurIA es el producto vertical. N3uralia es la capa tecnológica reutilizable.

### N3uralia

Aporta:

- motores de inteligencia;
- automatización;
- análisis;
- orquestación;
- procesamiento de datos;
- lógica diferencial reutilizable;
- capacidades que pueden alimentar múltiples productos.

Sitio oficial: **https://www.n3uralia.com**

### SegurIA

Especializa esas capacidades en:

- seguridad física;
- cámaras y sensores;
- integración de terreno;
- gateways;
- evidencia;
- alertas;
- incidentes;
- visión operacional;
- continuidad de operación.

Esta separación evita duplicar motores dentro de cada producto y mantiene la propiedad intelectual reutilizable centralizada en N3uralia.

---

## SEO, GEO y LLMO

El sitio incorpora una capa de descubrimiento orientada tanto a buscadores tradicionales como a motores generativos.

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

SegurIA busca que la seguridad física deje de comportarse como una colección de cámaras, apps y paneles aislados.

La dirección es:

1. mantener captura y resiliencia cerca del lugar;
2. normalizar hardware y proveedores detrás de contratos propios;
3. mantener ownership, autorización y auditoría en estado canónico;
4. mover evidencia en lugar de video continuo cuando el caso lo permita;
5. utilizar motores N3uralia como una capa explicable y revisable;
6. convertir eventos en decisiones, alertas, incidentes y acciones medibles;
7. extender el mismo modelo a personas, infraestructura, activos y entornos naturales.

---

## Estado actual

`main` es la rama de producción.

La experiencia cliente ya está organizada alrededor de los seis módulos:

```text
Centro de Control
Infraestructura
Incidentes
Evidencia
Vision
Edge
```

Los cambios recientes de producto, atribución N3uralia y discovery SEO/GEO/LLMO están integrados en producción.

El roadmap detallado y los gates técnicos se mantienen en [`ROADMAP.md`](ROADMAP.md).

---

## Desarrollo con v0

El proyecto permanece conectado a v0 para iteración de interfaz y producto:

[Continue working on v0](https://v0.app/chat/projects/prj_3kTNF2QMxVmGVRjdLzfBj9mGHkEn)
