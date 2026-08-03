# SegurIA Design System

Documento maestro de UI, UX y brandbook para `seguria.tech`, el portal de clientes y la administración interna.

Este archivo define cómo debe verse, sentirse y comportarse la interfaz. No documenta backend, infraestructura, despliegues ni procesos operativos.

## 1. Nivel de autoridad

El sistema separa cuatro tipos de decisión:

- **Norma obligatoria:** regla aprobada que debe cumplirse.
- **Token implementado:** valor existente en el código y reutilizable.
- **Dirección provisional:** decisión vigente pendiente de brandbook corporativo o activo final.
- **Pendiente de validación:** regla que requiere revisión visual o de producto antes de consolidarse.

Cuando exista contradicción, prevalece en este orden:

1. brandbook o activo maestro aprobado;
2. decisión explícita de dirección;
3. este documento;
4. implementación actual.

Una inconsistencia entre código y documento debe resolverse conscientemente; no debe normalizarse por accidente.

## 2. Principios de diseño

SegurIA debe comunicar seguridad, control, precisión y calma. No debe parecer una plantilla genérica, una interfaz gamer ni un dashboard excesivamente técnico.

Normas obligatorias:

1. Claridad antes que ornamentación.
2. Información operacional comprensible en pocos segundos.
3. Una jerarquía visual fuerte y pocas acciones prioritarias por pantalla.
4. Apariencia tecnológica sobria y premium.
5. Consistencia entre sitio público, portal y administración.
6. Uso controlado de transparencias, brillos, sombras y gradientes.
7. Densidad solo cuando la tarea la requiere.
8. Funcionamiento correcto en móvil, escritorio, teclado y lectura asistida.
9. Cada elemento debe tener una razón funcional.
10. La marca debe reconocerse sin depender exclusivamente del logotipo.

## 3. Personalidad de marca

La marca debe sentirse confiable, moderna, precisa, discreta, profesional, tecnológica sin ser fría y premium sin ser ostentosa.

No debe sentirse futurista de ciencia ficción, militarizada, agresiva, saturada de neón, infantil, burocrática ni visualmente ruidosa.

## 4. Logotipo y favicon

Normas obligatorias:

- Conservar proporción original.
- No deformar, estirar ni comprimir.
- No aplicar sombras, biseles, bordes luminosos ni efectos 3D.
- No recolorear salvo que exista una versión aprobada para ese fondo.
- Mantener espacio libre alrededor.
- En navegación, usar aproximadamente `32px` de alto y `142px` de ancho, con `object-contain`.
- No colocar fondos negros o cajas visibles alrededor de recursos transparentes.
- El favicon debe conservar el círculo limpio y las esquinas transparentes.

## 5. Paleta institucional vigente

Estos colores están implementados actualmente en el producto. Se consideran la paleta institucional vigente, no un brandbook corporativo definitivo mientras no exista una fuente oficial adicional.

| Token | Valor | Uso |
|---|---:|---|
| SegurIA Deep | `#0A1B2E` | Fondo principal y base institucional |
| SegurIA Medium | `#123A5A` | Navegación, paneles y superficies secundarias |
| SegurIA Steel | `#2B5C7E` | Apoyo visual y estados intermedios |
| SegurIA Sky | `#4DA3D9` | Acento, foco y acciones principales |
| SegurIA Ice | `#E6F1F8` | Fondos claros y superficies informativas |
| White | `#FFFFFF` | Texto de alto contraste |
| Gray Dark | `#1F2937` | Texto oscuro sobre fondo claro |
| Gray Medium | `#6B7280` | Texto secundario |
| Gray Light | `#E5E7EB` | Bordes y separadores claros |
| Destructive | `#EF4444` | Error, peligro y acciones destructivas |

No introducir colores nuevos para resolver casos aislados sin definir primero su función semántica.

## 6. Tokens implementados

### Color

- `background`: `#0A1B2E`
- `foreground`: `#FFFFFF`
- `card`: `rgba(18, 58, 90, 0.42)`
- `popover`: `#123A5A`
- `primary`: `rgba(77, 163, 217, 0.85)`
- `secondary`: `rgba(255, 255, 255, 0.10)`
- `border`: `rgba(255, 255, 255, 0.10)`
- `input`: `rgba(255, 255, 255, 0.10)`
- `ring`: `#4DA3D9`

### Geometría

- `radius-brand`: `5px`
- `radius-control`: `8px`
- `radius-panel`: `12px`

No usar radios fuera de esta escala sin justificación explícita.

### Movimiento

- rápido: `150ms`
- estándar: `200ms`
- lento: `250ms`

## 7. Tipografía

Tipografía vigente: **Montserrat**.

Pesos activos:

- `300`: display, hero y títulos editoriales grandes;
- `400`: títulos operativos, navegación, controles, tablas y cuerpo.

Normas obligatorias:

- No usar `300` en texto inferior a `20px`.
- H1 y H2 pueden usar `300` cuando su escala y contraste lo permitan.
- H3–H6, encabezados de tarjetas, tablas, filtros y módulos deben usar `400`.
- No usar bold masivo para compensar una jerarquía débil.
- No usar mayúsculas extensas salvo microetiquetas, estados o eyebrows.
- Tracking en mayúsculas: normalmente `0.18em–0.24em`.
- Longitud editorial recomendada: `45–75` caracteres por línea.

Escala normativa:

| Nivel | Tamaño / interlínea |
|---|---|
| Display | `64 / 72px` |
| Hero móvil | `40 / 46px` |
| H1 | `48 / 56px` |
| H1 móvil | `36 / 44px` |
| H2 | `36 / 44px` |
| H3 | `24 / 32px` |
| H4 | `18 / 26px` |
| Body large | `18 / 28px` |
| Body | `16 / 25px` |
| Functional | `14 / 21px` |
| Caption | `12 / 18px` |
| Eyebrow | `10 / 14px` |

Las excepciones deben responder a una necesidad de composición, no a preferencias locales.

## 8. Jerarquía visual

Cada pantalla debe tener:

1. un título principal claro;
2. un resumen breve;
3. una acción principal visible;
4. acciones secundarias discretas;
5. contenido agrupado por intención;
6. estados y prioridades distinguibles en menos de cinco segundos.

Evitar cinco o más botones con el mismo peso, tarjetas repetidas sin jerarquía, títulos redundantes, bloques densos sin separación y dashboards donde todo parezca igualmente urgente.

## 9. Espaciado, contenedores y densidad

La retícula usa múltiplos de 4.

Escala base:

- `4px`: microajustes;
- `8px`: icono y texto;
- `12px`: controles compactos;
- `16px`: padding denso;
- `24px`: padding estándar de tarjeta;
- `32px`: grupos;
- `48–64px`: secciones de producto;
- `80–120px`: landing pages.

Anchos:

- texto editorial: `640–760px`;
- contenedor general: `1200–1440px`;
- formularios: `560–720px`;
- administración: ancho disponible con márgenes consistentes.

Densidad por contexto:

- marketing: baja densidad y alta respiración;
- portal: densidad media y lectura ejecutiva;
- administración: densidad media-alta;
- filas de tabla: `48–56px`;
- controles: `44–48px`;
- tarjetas ejecutivas: `24px` de padding;
- tarjetas densas: `16px` de padding.

## 10. Superficies

Jerarquía obligatoria:

1. fondo de página;
2. superficie sólida;
3. superficie translúcida;
4. elemento interactivo.

Glassmorphism no es la identidad completa. Solo debe usarse cuando exista una imagen, textura o capa ambiental detrás. En administración se prefieren superficies sólidas o casi sólidas.

Tarjeta oscura vigente:

```css
background: rgba(18, 58, 90, 0.42);
backdrop-filter: blur(14px);
border: 1px solid rgba(255, 255, 255, 0.10);
border-radius: 5px;
```

No apilar tarjetas dentro de tarjetas salvo necesidad funcional. Evitar que cada sección parezca una caja independiente.

## 11. Componentes y estados

Todo componente interactivo debe definir:

- default;
- hover;
- focus-visible;
- active o selected;
- disabled;
- loading;
- error cuando corresponda.

### Botones

- altura mínima: `44px`;
- radio: `5px`;
- icono: `16–20px` antes del texto;
- separación icono-texto: `8px`;
- una acción primaria dominante por bloque;
- disabled con opacidad reducida y cursor no interactivo;
- loading debe mantener ancho y reemplazar claramente la acción;
- destructive requiere confirmación cuando no sea reversible.

### Inputs, selects y textareas

- altura mínima de controles simples: `44px`;
- radio: `8px`;
- etiqueta visible;
- error junto al campo;
- valores preservados después del error;
- foco visible con SegurIA Sky;
- placeholder no reemplaza label.

### Cards y paneles

- card institucional: `5px`;
- panel contextual o inmersivo: máximo `12px`;
- selected mediante borde, fondo y texto; no solo color;
- loading con skeleton o texto breve;
- empty state con explicación y siguiente acción.

### Tablas y filas

- altura `48–56px`;
- encabezado `400`;
- hover discreto;
- fila seleccionada visible sin depender solo del color;
- acciones secundarias de bajo contraste hasta hover o foco, pero siempre accesibles por teclado.

### Badges y filtros

- píldoras solo para estados, filtros y etiquetas breves;
- color semántico reservado para estados reales;
- siempre acompañar estados críticos con texto.

### Navegación

- estado activo visible mediante fondo, texto y/o indicador;
- foco visible;
- iconos del mismo grosor y tamaño;
- no mostrar opciones restringidas inutilizables salvo necesidad explicativa.

### Modales

- título claro;
- acción principal y cierre inequívocos;
- foco inicial y retorno de foco;
- cierre por `Escape` cuando sea seguro;
- no ocultar información crítica detrás de modales sucesivos.

## 12. Accesibilidad

Requisitos verificables:

- texto normal: contraste mínimo `4.5:1`;
- texto grande: mínimo `3:1`;
- bordes y controles funcionales: mínimo `3:1`;
- foco visible de al menos `2px` con separación perceptible;
- navegación completa por teclado;
- orden de tabulación lógico;
- tamaño táctil objetivo: `44x44px`;
- labels asociados a inputs;
- errores vinculados semánticamente al campo;
- estados no dependientes solo de color;
- jerarquía de headings correcta;
- mensajes dinámicos anunciables;
- imágenes informativas con `alt` descriptivo;
- imágenes decorativas con `alt=""`;
- respeto a `prefers-reduced-motion`.

## 13. Iconografía

- familia vigente: Lucide;
- grosor habitual: `1.5`;
- tamaños: `16`, `20`, `24px`;
- no mezclar familias;
- no usar iconos brillantes o decorativos en exceso;
- un icono apoya el significado, no reemplaza etiquetas críticas.

## 14. Imágenes y fotografía

Normas obligatorias:

- No mejorar, estilizar, enfocar, recolorear ni dramatizar automáticamente una imagen de referencia.
- Conservar composición, iluminación, suavidad, textura, realismo y encuadre aprobados.
- Modificar solo los elementos solicitados.
- No usar HDR, sharpen, contraste agresivo o estética generativa sin aprobación.
- Priorizar fotografía específica y creíble.
- Recortar preservando sujeto e intención narrativa.
- Usar overlays para legibilidad, no para ocultar una mala selección.

Las imágenes remotas actuales de los temas de cliente son **provisionales**. Deben sustituirse por material aprobado y contar con fallback local antes de considerarse activos maestros.

## 15. Temas del portal

Los temas cambian ambiente y lenguaje, no estructura ni interacción.

### Invariantes

No cambian por cliente:

- logotipo;
- Montserrat;
- escala tipográfica;
- spacing;
- geometría;
- iconografía;
- estados semánticos;
- navegación;
- tamaños de controles;
- patrones de interacción.

### Variables permitidas

Pueden cambiar:

- fondo;
- fotografía;
- acento contextual;
- copy;
- vocabulario;
- overlays.

### Huilo Huilo

- fondo: `#07140F`;
- acento: esmeralda suave;
- sensación: bosque, reserva, hospitalidad y protección discreta;
- vocabulario: espacios, reserva, protección del entorno.

### Santa Elena

- fondo: `#171108`;
- acento: ámbar cálido;
- sensación: campo, continuidad y operación permanente;
- vocabulario: predios, operación lechera, continuidad productiva.

### General

- fondo: `#081725`;
- acento: azul cielo;
- sensación: control operacional, claridad y tecnología.

## 16. Sitio público

Debe explicar la propuesta de valor rápidamente, demostrar capacidad sin saturar, separar soluciones, proyectos, evidencia y contacto, mantener CTAs consistentes y conservar continuidad entre idiomas.

El hero debe contener una promesa concreta, explicación breve, CTA primario, CTA secundario solo cuando sea necesario y una imagen que refuerce la promesa.

## 17. Portal de clientes

Debe priorizar estado general, prioridades del día, incidentes abiertos, cámaras relevantes, evidencia y soporte contextual.

Normas:

- no convertir cada dato en tarjeta;
- distinguir alertas críticas sin dominar toda la interfaz;
- colocar acciones de reporte cerca del elemento afectado;
- preservar contexto al navegar a Ayuda;
- explicar estados vacíos;
- mostrar datos disponibles ante fallos parciales.

## 18. Administración y CRM

Puede ser más densa, pero debe conservar orden, escaneabilidad y foco.

Normas:

- navegación lateral fija en escritorio y colapsable en móvil;
- fondo SegurIA Deep;
- sidebar SegurIA Medium;
- estado activo con SegurIA Sky moderado;
- tablas legibles y acciones discretas;
- filtros visibles sin competir con el contenido;
- SLA, estado y responsable escaneables rápidamente;
- evidencia diferenciada entre acción, historial y metadatos;
- sin previews innecesarias de información sensible.

## 19. Estados del sistema

Todo componente de datos debe contemplar loading, éxito, vacío, error, sin permisos y dato parcial.

- Loading: skeleton o texto corto.
- Vacío: explicar qué falta y la siguiente acción.
- Error: indicar qué ocurrió y cómo recuperarse.
- Sin permisos: explicar restricción sin lenguaje técnico.
- Dato parcial: mostrar lo disponible y declarar la limitación.

## 20. Movimiento

- duración: `150–250ms`;
- curvas suaves;
- animar solo feedback, cambios de estado y paneles;
- no usar parallax intenso, rebotes o transiciones largas en operación;
- respetar `prefers-reduced-motion`.

## 21. Responsive

Móvil:

- una columna;
- padding lateral mínimo `16px`;
- navegación colapsable;
- acciones principales visibles;
- tablas adaptadas o con scroll horizontal controlado;
- objetivos táctiles de `44px`;
- no reducir tipografía hasta comprometer lectura.

Escritorio:

- usar espacio adicional para jerarquía;
- mantener límites de lectura;
- evitar tarjetas excesivamente anchas;
- no depender de hover para funciones esenciales.

## 22. Escritura UX

El lenguaje debe ser directo, breve, específico, comprensible para usuarios no técnicos y coherente con el contexto del cliente.

- usar verbos claros;
- evitar jerga innecesaria;
- no usar marketing dentro de tareas operativas;
- indicar en errores qué ocurrió y qué hacer;
- mantener nombres de estado consistentes;
- resumir primero y permitir detalle después.

## 23. Prohibiciones

No hacer:

- restyling general sin aprobación;
- cambiar tipografía global;
- agregar colores arbitrarios;
- usar gradientes neón o estética cyberpunk;
- introducir radios fuera de `5/8/12px` sin justificación;
- aplicar sombras fuertes a todos los paneles;
- abusar de glassmorphism;
- usar iconos decorativos o demasiado brillantes;
- ocultar acciones esenciales;
- usar `300` en títulos pequeños u operativos;
- saturar dashboards con métricas sin prioridad;
- alterar imágenes más allá de lo solicitado;
- declarar una pantalla terminada sin verla en móvil y escritorio.

## 24. Fuente de verdad

Implementaciones principales:

- `app/globals.css`: tokens, tipografía, geometría, foco, superficies, botones y campos.
- `app/layout.tsx`: carga de Montserrat.
- `lib/client-theme.ts`: temas contextuales.
- componentes compartidos: comportamiento real de UI.

## 25. Criterio de aprobación

Una entrega no se considera completa hasta validar:

- escritorio y móvil;
- jerarquía;
- contraste;
- teclado y foco;
- estados interactivos;
- contenido realista;
- consistencia de marca;
- ausencia de overflow;
- fidelidad a referencias;
- accesibilidad básica;
- ausencia de regresiones visibles.

Este archivo se actualiza cuando se aprueba un cambio real del sistema visual, no por cada ajuste menor.
