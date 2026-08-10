# SegurIA Brand & Discovery Strategy

Actualizado: 9 de agosto de 2026.

## Posicionamiento canónico

**SegurIA Security Suite — Powered by N3uralia.**

SegurIA es una Security Suite para seguridad física y operación que unifica infraestructura, cámaras, sensores, gateways, incidentes, evidencia, Vision, Edge, automatización y continuidad operacional dentro de una misma experiencia.

N3uralia aporta los motores tecnológicos reutilizables de inteligencia, automatización, análisis, orquestación y lógica diferencial. SegurIA los especializa para seguridad y operación.

## Objetivo de mercado

Construir una categoría clara y defendible alrededor de **Security Suite**, evitando quedar reducidos a CCTV, video analytics, alarmas, monitoreo o una sola herramienta de IA.

Modelo semántico:

```text
N3uralia
  -> motores tecnológicos reutilizables
       -> SegurIA Security Suite
            -> seguridad física + operación
                 -> Centro de Control
                 -> Infraestructura
                 -> Incidentes
                 -> Evidencia
                 -> Vision
                 -> Edge
```

## Audiencias prioritarias

1. Empresas y operaciones con infraestructura física distribuida.
2. Hotelería y hospitality.
3. Campos, agroindustria y operaciones remotas.
4. Propiedades, condominios y recintos multi-sitio.
5. Integradores o partners que necesitan una capa operacional por encima del hardware existente.

## Arquitectura de descubrimiento

### Capa 1 — entidad y categoría

Toda superficie principal debe responder con claridad:

- qué es SegurIA;
- qué incluye la Security Suite;
- qué problema operacional resuelve;
- cómo aprovecha infraestructura existente;
- cómo se relaciona con N3uralia.

### Capa 2 — capacidades

Clusters principales:

- Centro de Control
- Infraestructura
- Incidentes
- Evidencia
- Vision
- Edge
- IA para cámaras
- Analítica de video
- Protección perimetral
- Modernización de cámaras existentes
- Integraciones

### Capa 3 — industrias y casos de uso

- Campos inteligentes
- Propiedades inteligentes
- Hotelería inteligente
- Detección de personas
- Detección de vehículos
- Detección de animales
- Detección de pumas

Cada página debe tener intención propia, contenido útil y enlaces internos hacia la suite, capacidades relacionadas y contacto. Evitar páginas doorway o variaciones thin.

## SEO técnico

Mantener:

- canonical URLs por idioma;
- hreflang `es-CL`, `en` y `x-default`;
- sitemap multilenguaje;
- robots accesible;
- metadata específica por página;
- Open Graph consistente;
- HTML crawlable;
- performance y Core Web Vitals observables;
- Search Console como fuente principal para indexación y consultas reales.

## GEO / LLMO / AEO

Priorizar comprensión y evidencia, no trucos.

- mantener `llms.txt` sincronizado;
- usar definiciones cortas y answer-ready en páginas públicas;
- mantener nombres de entidad estables;
- explicitar N3uralia -> SegurIA sin transferir propiedad intelectual;
- conectar páginas por relaciones semánticas reales;
- publicar FAQs factuales cuando respondan preguntas reales;
- usar structured data solo cuando represente contenido visible/canónico;
- reforzar páginas first-party que expliquen arquitectura, capacidades e integraciones;
- evitar afirmar que un archivo o schema garantiza citas o rankings en LLMs.

## Structured data

Entidades principales:

- `Organization`: N3uralia
- `Organization` / `ProfessionalService`: SegurIA cuando corresponda a la entidad comercial
- `WebSite`: seguria.tech
- `SoftwareApplication`: SegurIA Security Suite
- `Service`: oferta de seguridad y operación
- `Brand`: SegurIA

Reglas:

- reutilizar `@id` canónicos;
- no usar `subjectOf` para enlaces que solo expresan relación comercial/tecnológica;
- no usar `sameAs` para páginas simplemente relacionadas;
- mantener schema y contenido visible alineados;
- validar después de cada cambio relevante.

## Conversión

CTA principal recomendado:

**Diseñar mi operación** / **Solicitar asesoría**

El recorrido debe llevar de:

```text
Problema / industria
  -> capacidad de la suite
  -> evidencia / explicación
  -> contacto / diagnóstico
```

Evitar múltiples CTAs competitivos sin jerarquía.

## Distribución y autoridad

P1:

- reforzar perfiles corporativos de SegurIA y N3uralia con naming consistente;
- obtener menciones y enlaces desde partners, integradores, casos reales y ecosistema tecnológico;
- producir contenido técnico/editorial first-party con evidencia real;
- documentar integraciones y arquitectura con páginas públicas cuando aporten valor comercial.

P2:

- comparativas honestas por categoría cuando exista evidencia suficiente;
- casos de uso documentados con datos aprobados;
- digital PR y thought leadership sobre operación de seguridad, Edge AI y modernización de infraestructura;
- newsletter o captura de demanda si existe capacidad comercial para nutrirla.

## Medición

No medir solo tráfico.

KPIs recomendados:

- impresiones y consultas no-brand en Search Console;
- consultas de categoría (`security suite`, seguridad operacional, IA para cámaras, etc.);
- crecimiento de branded search de SegurIA;
- páginas que generan contacto;
- tasa de conversión por landing;
- rutas de navegación hacia contacto;
- referrals y backlinks relevantes;
- indexación/cobertura;
- apariciones/citas observadas en motores generativos cuando puedan verificarse manualmente;
- leads calificados y pipeline atribuible.

## Prioridades

### P0

- Mantener una sola categoría principal: **SegurIA Security Suite**.
- Eliminar definiciones contradictorias en metadata, schema, README, `llms.txt` y páginas principales.
- No publicar claims no sustentados.

### P1

- Reescribir el hero/home visible para declarar Security Suite explícitamente sin perder el mensaje emocional actual.
- Incorporar una sección visible y citable “Qué incluye la SegurIA Security Suite” con los seis módulos.
- Enlazar todas las landings principales hacia `/soluciones` y páginas de capacidades relacionadas.
- Añadir metadata específica a cada landing de intención alta cuando aún dependa de metadata genérica.
- Definir eventos de conversión y medir contacto por página origen.

### P2

- Expandir autoridad editorial y casos reales.
- Construir comparativas solo donde exista evidencia suficiente.
- Crear contenido de integración/arquitectura útil para compradores técnicos y partners.
- Medir visibilidad en AI search como señal complementaria, no como único KPI.

## Definition of Done

Todo cambio material de posicionamiento o discoverability debe:

1. mantener la jerarquía N3uralia -> SegurIA;
2. mantener Security Suite como categoría principal;
3. actualizar `ROADMAP.md` cuando corresponda;
4. validar build/deployment;
5. verificar metadata y superficies públicas relevantes;
6. evitar claims, métricas o evidencia inventada.
