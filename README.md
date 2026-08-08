# SegurIA

## Distributed Security Intelligence

SegurIA es una plataforma de seguridad física y visión operacional diseñada para convertir cámaras, sensores, eventos y evidencia en decisiones claras.

No está pensada como otro dashboard de cámaras. Su arquitectura combina operación local, software cloud, seguridad multiempresa, automatización, evidencia privada e inteligencia visual dentro de un mismo modelo operacional.

La idea central es simple:

> **procesar cerca del lugar, mover solo la información necesaria y mantener en el Core una verdad operacional segura, auditable y accionable.**

---

## Qué hace diferente a SegurIA

SegurIA une capacidades que normalmente viven separadas:

- infraestructura física y gateways locales;
- cámaras y sensores de múltiples orígenes;
- operación degradada cuando Internet falla;
- portal cliente y centro de operaciones;
- eventos, alertas, incidentes y automatizaciones;
- evidencia privada y trazable;
- SegurIA Vision para análisis avanzado de imágenes;
- control de acceso multiempresa y por operación;
- revisión humana de resultados de IA;
- arquitectura Edge photo-first para reducir ancho de banda, exposición y costo de inferencia.

La plataforma distingue explícitamente entre **estado operacional canónico** y **resultados derivados por IA**. Una clasificación automática puede enriquecer la operación, pero no reemplaza silenciosamente la verdad del sistema.

---

## Principio arquitectónico

```text
Cámaras / sensores / sistemas locales
                |
                v
     SegurIA Edge / Gateway
  - RTSP y dispositivos locales
  - motion gate / frame selection
  - buffer y spool offline
  - normalización de eventos
                |
                v
         APIs protegidas
  - identidad del gateway
  - reintentos e idempotencia
  - snapshots seguros
  - media proxy cuando aplica
                |
                v
          SegurIA Core
  - Supabase / PostgreSQL
  - Auth + RLS
  - Storage privado
  - eventos e incidentes
  - automatizaciones
  - SegurIA Vision
  - auditoría
                |
        +-------+-------+
        |               |
        v               v
 Portal cliente    Operaciones / Admin
```

La arquitectura es **local-first, cloud-coordinated**: el sitio puede seguir capturando y acumulando trabajo durante una interrupción de conectividad, mientras el Core conserva identidad, ownership, políticas y estado canónico.

---

## Capacidades actuales

### Plataforma multiempresa

- Organizaciones y propiedades separadas explícitamente.
- Memberships y roles persistentes.
- Autenticación SSR con Supabase Auth.
- Row Level Security para recursos protegidos.
- Separación entre scope empresarial y scope operacional de Vision.
- Provisioning interno de clientes y propiedades.

### Gateway e infraestructura local

Cada instalación puede operar mediante una identidad de gateway propia.

Endpoints principales:

```text
POST /api/gateway/inventory
POST /api/gateway/devices/state
POST /api/gateway/events
POST /api/gateway/heartbeat
POST /api/gateway/cameras/snapshot
```

El gateway permite:

- sincronizar inventario;
- reportar estado de dispositivos;
- enviar eventos;
- reportar heartbeat;
- subir snapshots autenticados;
- mantener cola local y reintentar después de una caída de Internet.

Contrato técnico: [`docs/security/gateway-connector-contract.md`](docs/security/gateway-connector-contract.md).

### Portal operacional

La plataforma consolida:

- propiedades;
- dispositivos;
- cámaras;
- sensores;
- estado de gateways;
- eventos;
- incidentes;
- alertas;
- actividad reciente;
- evidencia;
- estado de SegurIA Vision.

Los dashboards se construyen desde datos persistidos; no se utilizan métricas simuladas para representar readiness u operación real.

### Alertas e incident response

El Core soporta alertas derivadas de condiciones operacionales y de Vision, incluyendo reglas verificadas para:

- detecciones de fauna relevantes;
- presencia humana en zonas sensibles;
- fallas de inferencia;
- inactividad prolongada de cámaras.

El sistema conserva estado y trazabilidad para reconocimiento, resolución, descarte y auditoría.

### Automatizaciones

SegurIA incluye una capa de automatización operacional con persistencia y control de cambios.

La arquitectura está diseñada para que las automatizaciones actúen sobre eventos normalizados en vez de depender directamente de una marca específica de hardware.

### Video y evidencia protegida

- Capturas almacenadas en Storage privado.
- Sesiones efímeras para acceso a video.
- Proxy protegido para HLS/WebRTC cuando corresponde.
- Las credenciales RTSP/origen permanecen fuera del navegador.
- El ownership de la evidencia se resuelve desde entidades canónicas de Postgres, no desde rutas de archivos.

---

## SegurIA Vision

SegurIA Vision es la capa de análisis visual de la plataforma.

Su modelo de ownership es explícito:

```text
Organization -> Property -> Operation -> Vision resources
```

Para Vision, `operation_id` es el scope operacional canónico.

Esto evita que una cámara, evidencia o inferencia quede autorizada simplemente porque un usuario pertenece a otra organización o conoce un UUID.

### Contratos principales

- `/api/vision/openai/infer` requiere `x-operation-id`.
- Los writes de cámaras requieren una operación explícita.
- Los writes de demo requieren una operación explícita.
- `organization_id` se deriva desde la propiedad vinculada a la operación.
- La membresía de Vision se resuelve mediante `user_operations`.

### Identidad e idempotencia

Cámaras:

```text
UNIQUE(operation_id, code)
```

Inferencias:

```text
UNIQUE(operation_id, sha256, model_name)
```

Esto permite reintentos seguros dentro de una operación y evita colisiones artificiales entre operaciones distintas.

### Quality diagnostics y human review

El dominio Wildlife/Vision incluye lógica para:

- diagnosticar evidencia oscura o borrosa;
- distinguir limitaciones de calidad de una captura infrarroja válida;
- detectar inactividad prolongada de cámaras;
- mantener estados de revisión humana;
- confirmar, corregir, rechazar o marcar evidencia como no identificable;
- limitar precisión de coordenadas según el rol operacional.

---

## SegurIA Edge Vision v1

[`edge/seguria-edge-vision`](edge/seguria-edge-vision) contiene un agente local photo-first para Mini PC.

Flujo actual:

```text
RTSP local
   -> muestreo liviano
   -> detección de movimiento/cambio
   -> ráfaga corta
   -> filtro de calidad
   -> deduplicación
   -> mejor fotografía
   -> snapshot autenticado
   -> SegurIA Core
```

Principios:

- el video continuo permanece en la LAN;
- al Core llega una fotografía seleccionada del evento;
- no se ejecuta identificación avanzada en cada frame;
- el agente está diseñado principalmente para CPU;
- puede trabajar con cámaras que expongan RTSP accesible localmente;
- si Internet falla, la evidencia queda en spool local y se reintenta;
- no se generan detecciones ficticias para rellenar estados vacíos.

Documentación: [`edge/seguria-edge-vision/README.md`](edge/seguria-edge-vision/README.md).

---

## Modelo de datos y seguridad

SegurIA evita tratar todos los IDs como si fueran el mismo tipo de scope.

### Portal empresarial

```text
organization -> property -> resource
```

### Vision operacional

```text
operation -> property -> organization
```

Reglas estructurales:

- conocer un UUID no concede acceso;
- los recursos protegidos tienen una ruta relacional determinística hacia su owner;
- secretos y service-role permanecen server-side;
- RLS es parte de la arquitectura, no una capa opcional;
- acciones críticas son deny-by-default;
- actor histórico y ownership son conceptos distintos;
- migraciones sensibles siguen expand -> migrate -> contract;
- datos legacy ambiguos no se reasignan sin evidencia canónica.

---

## Stack

### Application

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI

### Data & identity

- Supabase PostgreSQL
- Supabase Auth
- Row Level Security
- Supabase Storage

### Runtime

- Vercel
- SegurIA Gateway
- SegurIA Edge Vision / Python

### Observability & verification

El build productivo ejecuta automáticamente pruebas de:

- SegurIA alerts;
- Vision quality diagnostics;
- Vision access control;
- TypeScript / Next.js production build.

El repositorio también incluye verificaciones adicionales para providers, licencias Wildlife, review proxy, seguridad, database health y smoke tests operacionales.

---

## Verificación local

Instalar dependencias:

```bash
pnpm install
```

Desarrollo:

```bash
pnpm dev
```

Validación completa:

```bash
pnpm verify
```

Checks útiles:

```bash
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

## Documentos canónicos

- [`ROADMAP.md`](ROADMAP.md) — arquitectura, estado y secuencia de evolución.
- [`DESIGN.md`](DESIGN.md) — sistema visual, UX y reglas de marca.
- [`docs/security/gateway-connector-contract.md`](docs/security/gateway-connector-contract.md) — contrato del gateway.
- [`edge/seguria-edge-vision/ARCHITECTURE.md`](edge/seguria-edge-vision/ARCHITECTURE.md) — arquitectura del agente Vision local.

---

## Dirección de producto

SegurIA busca que la seguridad física deje de ser una colección de cámaras, apps y paneles aislados y se comporte como un **sistema distribuido de inteligencia operacional**.

La dirección es:

1. mantener captura y resiliencia cerca del lugar;
2. normalizar hardware y proveedores detrás de contratos propios;
3. conservar ownership, autorización y auditoría en un Core canónico;
4. mover evidencia en lugar de video continuo cuando el caso lo permita;
5. utilizar IA como una capa explicable y revisable, no como una fuente de verdad incuestionable;
6. convertir eventos en decisiones, alertas, incidentes y acciones medibles.

Ese modelo permite que SegurIA evolucione desde seguridad tradicional hacia una plataforma común para **protección de personas, infraestructura, activos y entornos naturales**, sin romper el mismo núcleo de identidad, operación y evidencia.

---

## Estado

`main` es la rama de producción y cada cambio debe completar build y verificación antes de considerarse estable.

El roadmap detallado y los gates de release se mantienen en [`ROADMAP.md`](ROADMAP.md).

---

## Desarrollo con v0

El proyecto permanece conectado a v0 para iteración de interfaz y producto:

[Continue working on v0](https://v0.app/chat/projects/prj_3kTNF2QMxVmGVRjdLzfBj9mGHkEn)
