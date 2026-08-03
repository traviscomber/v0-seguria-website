# SegurIA Design System

Documento maestro de UI, UX y brandbook para `seguria.tech`, el portal de clientes y la administración interna.

Este archivo define cómo debe verse, sentirse y comportarse la interfaz. No documenta arquitectura backend, infraestructura, despliegues ni procesos operativos.

## 1. Principios de diseño

SegurIA debe comunicar seguridad, control, precisión y calma. La experiencia visual no debe parecer una plantilla genérica, una interfaz gamer ni un dashboard excesivamente técnico.

Principios obligatorios:

1. Claridad antes que ornamentación.
2. Información operacional comprensible en pocos segundos.
3. Jerarquía visual fuerte, con pocas acciones prioritarias por pantalla.
4. Apariencia tecnológica sobria y premium.
5. Consistencia entre sitio público, portal y administración.
6. Uso controlado de transparencias, brillos y efectos.
7. Interfaces densas solo cuando la tarea realmente lo requiere.
8. Cada pantalla debe funcionar correctamente en móvil y escritorio.

## 2. Personalidad de marca

La marca debe sentirse:

- confiable;
- moderna;
- precisa;
- discreta;
- profesional;
- tecnológica sin ser fría;
- premium sin ser ostentosa.

No debe sentirse:

- futurista de ciencia ficción;
- militarizada;
- agresiva;
- saturada de neón;
- infantil;
- demasiado corporativa o burocrática;
- visualmente ruidosa.

## 3. Logotipo

El logotipo SegurIA debe conservar siempre su proporción original.

Reglas:

- No deformar, estirar ni comprimir.
- No aplicar sombras, biseles, bordes luminosos ni efectos 3D.
- No recolorear salvo que exista una versión oficial preparada para ese fondo.
- Mantener espacio libre alrededor del logotipo.
- En navegación, usar una altura aproximada de `32px` y un ancho cercano a `142px`, con `object-contain` y alineación izquierda.
- No colocar fondos negros o cajas visibles alrededor del símbolo cuando el recurso tenga transparencia.
- El favicon debe conservar el círculo limpio y las esquinas transparentes.

## 4. Paleta principal

Paleta oficial implementada:

| Token | Valor | Uso |
|---|---:|---|
| SegurIA Deep | `#0A1B2E` | Fondo principal, páginas oscuras, base institucional |
| SegurIA Medium | `#123A5A` | Navegación, paneles, popovers, superficies secundarias |
| SegurIA Steel | `#2B5C7E` | Estados intermedios, elementos secundarios, apoyos visuales |
| SegurIA Sky | `#4DA3D9` | Acento principal, acciones, foco, estados activos |
| SegurIA Ice | `#E6F1F8` | Fondos claros, contraste suave, superficies informativas |
| White | `#FFFFFF` | Texto principal y alto contraste |
| Gray Dark | `#1F2937` | Texto oscuro sobre fondos claros |
| Gray Medium | `#6B7280` | Texto secundario |
| Gray Light | `#E5E7EB` | Bordes y separadores claros |
| Destructive | `#EF4444` | Error, peligro y acciones destructivas |

## 5. Tokens semánticos

- `background`: `#0A1B2E`
- `foreground`: `#FFFFFF`
- `card`: `rgba(18, 58, 90, 0.42)`
- `popover`: `#123A5A`
- `primary`: `rgba(77, 163, 217, 0.85)`
- `secondary`: `rgba(255, 255, 255, 0.10)`
- `border`: `rgba(255, 255, 255, 0.10)`
- `input`: `rgba(255, 255, 255, 0.10)`
- `ring`: `#4DA3D9`
- radio base: `5px`

Los tokens deben reutilizarse. No introducir colores nuevos para resolver casos aislados sin justificar primero su función semántica.

## 6. Tipografía

Tipografía oficial: **Montserrat**.

Pesos activos:

- `300` para encabezados amplios y títulos editoriales;
- `400` para cuerpo, controles, navegación y textos funcionales.

Reglas:

- No usar pesos extremadamente finos en interfaces operativas.
- No usar bold de forma masiva.
- Los títulos deben respirar y conservar una jerarquía clara.
- El cuerpo debe priorizar legibilidad, especialmente en tablas y paneles.
- Evitar textos completamente en mayúsculas salvo microetiquetas, estados o eyebrows.
- Las mayúsculas deben tener tracking moderado, normalmente entre `0.18em` y `0.24em`.

Escala recomendada:

- Hero principal: `48–72px` escritorio, `36–48px` móvil.
- H1 de sección: `36–52px` escritorio, `30–38px` móvil.
- H2: `28–38px`.
- H3: `20–26px`.
- Cuerpo principal: `16–18px`.
- Texto funcional: `14–15px`.
- Microtexto: `10–12px`.

## 7. Jerarquía visual

Cada pantalla debe tener:

1. Un título principal claro.
2. Un resumen o contexto breve.
3. Una acción principal visible.
4. Acciones secundarias discretas.
5. Contenido agrupado por intención, no solo por tipo de dato.

Evitar:

- cinco o más botones con el mismo peso visual;
- tarjetas repetidas sin jerarquía;
- títulos largos que expliquen lo mismo que el párrafo inferior;
- bloques excesivamente densos sin separación;
- dashboards donde todo parezca igualmente urgente.

## 8. Espaciado y composición

Usar una retícula consistente basada en múltiplos de 4.

Escala recomendada:

- `4px`: microajustes.
- `8px`: separación mínima entre icono y texto.
- `12px`: controles compactos.
- `16px`: separación interna estándar.
- `24px`: padding de tarjetas y bloques.
- `32px`: separación entre grupos.
- `48–64px`: separación entre secciones.
- `80–120px`: respiración vertical en landing pages.

Anchos:

- Texto editorial: máximo `640–760px`.
- Contenedor general: `1200–1440px` según pantalla.
- Formularios: `560–720px`.
- Paneles administrativos: utilizar todo el ancho disponible, manteniendo márgenes laterales consistentes.

## 9. Bordes y radios

Radio institucional base: `5px`.

Uso:

- Botones principales y secundarios: `5px`.
- Tarjetas institucionales: `5px` o una variación mínima.
- Controles operativos densos pueden usar `8–12px` cuando mejora la lectura táctil.
- No mezclar indiscriminadamente `5px`, `16px`, `24px` y formas tipo píldora en una misma pantalla.
- Las píldoras deben reservarse para estados, filtros y etiquetas breves.

## 10. Superficies y glassmorphism

El lenguaje visual usa superficies oscuras y transparencias controladas.

Tarjeta oscura recomendada:

```css
background: rgba(18, 58, 90, 0.42);
backdrop-filter: blur(14px);
border: 1px solid rgba(255, 255, 255, 0.10);
border-radius: 5px;
```

Tarjeta clara recomendada:

```css
background: rgba(230, 241, 248, 0.78);
box-shadow: 0 18px 45px rgba(10, 27, 46, 0.08);
border-radius: 5px;
```

Reglas:

- No usar blur intenso en todos los elementos.
- No apilar múltiples capas translúcidas sin necesidad.
- El contenido debe conservar contraste aun si la imagen de fondo cambia.
- Las tarjetas no deben parecer flotantes sin relación con la composición.

## 11. Botones

### Primario

- Fondo: SegurIA Sky con opacidad aproximada de `0.85`.
- Texto blanco.
- Hover a opacidad completa.
- Una sola acción primaria dominante por bloque.

### Secundario

- Fondo blanco al `10%`.
- Texto blanco.
- Hover blanco al `15%`.

### Ghost

- Fondo blanco al `6%`.
- Hover blanco al `12%`.
- Para acciones de bajo riesgo o navegación contextual.

Reglas generales:

- Altura mínima recomendada: `40–44px`.
- Área táctil mínima: `44x44px` cuando sea posible.
- Icono antes del texto, separado por `8px`.
- No usar botones solo con color para indicar significado.
- Estados de carga deben reemplazar la acción de manera clara.
- Acciones destructivas deben exigir confirmación cuando el impacto no sea reversible.

## 12. Formularios

Controles base:

- ancho completo;
- borde blanco al `10%`;
- fondo blanco al `5%`;
- texto blanco;
- tamaño mínimo `14px`;
- padding aproximado `12px 16px`;
- foco con SegurIA Sky;
- transición de `200ms`.

Reglas UX:

- Etiqueta siempre visible; no depender solo del placeholder.
- Mensaje de error junto al campo afectado.
- Mantener los valores ingresados después de un error.
- Mostrar claramente carga, éxito y fallo.
- No solicitar datos que no se utilizan.
- Los formularios largos deben agruparse en secciones.
- El envío debe bloquear dobles clics.

## 13. Iconografía

La iconografía debe ser lineal, sobria y consistente.

Estándar actual:

- familia Lucide;
- grosor habitual `1.5`;
- tamaños frecuentes `16`, `20` y `24px`.

Reglas:

- No mezclar familias de iconos.
- No usar iconos excesivamente brillantes.
- El icono apoya el significado; no reemplaza etiquetas críticas.
- Evitar iconos decorativos sin función.
- Los iconos de estado deben acompañarse de texto.

## 14. Imágenes y fotografía

La imagen debe sentirse real, específica y creíble.

Reglas obligatorias:

- No “mejorar” o estilizar automáticamente imágenes de referencia.
- Conservar composición, iluminación, suavidad, textura y realismo cuando exista una referencia aprobada.
- Modificar únicamente los elementos solicitados.
- No aplicar sharpen, recolor, HDR, dramatización o contraste agresivo sin instrucción explícita.
- Evitar imágenes genéricas de bancos que contradigan el contexto operativo.
- Recortar para preservar el sujeto y la intención narrativa.
- Mantener calidad suficiente para pantallas retina.
- Usar overlays para garantizar legibilidad, no para ocultar una mala selección de imagen.

## 15. Temas del portal de clientes

El portal conserva la estructura SegurIA, pero adapta ambiente, vocabulario y acento al cliente.

### Huilo Huilo

- Fondo base: `#07140F`.
- Acentos: esmeralda suave.
- Sensación: bosque, reserva, hospitalidad y protección discreta.
- Texto de acento: `emerald-200`.
- Acción principal: `emerald-400` con texto oscuro.
- Vocabulario: espacios, reserva, protección del entorno.

### Santa Elena

- Fondo base: `#171108`.
- Acentos: ámbar cálido.
- Sensación: campo, producción, continuidad y operación permanente.
- Texto de acento: `amber-200`.
- Acción principal: `amber-300` con texto oscuro.
- Vocabulario: predios, operación lechera, continuidad productiva.

### Tema general

- Fondo base: `#081725`.
- Acentos: azul cielo.
- Sensación: control operacional, claridad y tecnología.
- Texto de acento: `sky-200`.
- Acción principal: `sky-300` con texto oscuro.

Regla principal: los temas cambian ambiente y lenguaje, pero no alteran la estructura, patrones de interacción ni jerarquía del producto.

## 16. Sitio público

El sitio público debe:

- explicar la propuesta de valor rápidamente;
- demostrar capacidad técnica sin saturar;
- usar narrativa visual clara;
- separar soluciones, proyectos, evidencia y contacto;
- mantener CTAs consistentes;
- usar imágenes reales o visuales aprobados;
- conservar continuidad entre páginas en español e inglés.

El hero debe contener:

- una promesa concreta;
- una explicación breve;
- un CTA primario;
- un CTA secundario solo cuando sea necesario;
- una imagen o fondo que refuerce la promesa.

## 17. Portal de clientes

El portal debe priorizar:

- estado general;
- prioridades del día;
- incidentes abiertos;
- cámaras y dispositivos relevantes;
- evidencia;
- acciones de soporte contextual.

Reglas:

- No convertir cada dato en una tarjeta.
- Las alertas críticas deben distinguirse sin dominar toda la interfaz.
- Las acciones “Reportar” deben estar cerca del elemento afectado.
- El contexto del usuario debe preservarse al navegar a Ayuda.
- Los estados vacíos deben explicar qué significa la ausencia de datos.
- Los fallos parciales no deben romper toda la página.

## 18. Administración y CRM

La administración puede ser más densa, pero debe mantener orden y legibilidad.

Reglas:

- Navegación lateral fija en escritorio y panel desplegable en móvil.
- Fondo principal SegurIA Deep.
- Sidebar SegurIA Medium.
- Estado activo con SegurIA Sky al `20%`.
- Tablas con jerarquía clara y acciones discretas.
- Filtros visibles, pero no más prominentes que el contenido.
- Estados, SLA y responsables deben poder escanearse rápidamente.
- La evidencia privada debe diferenciar visualmente acción, historial y metadatos.
- No mostrar información sensible en previews innecesarias.

## 19. Estados del sistema

Todo componente de datos debe contemplar:

- loading;
- éxito;
- vacío;
- error;
- sin permisos;
- dato parcial o degradado.

Reglas:

- Loading: skeleton o texto corto, no spinners permanentes.
- Vacío: explicar qué falta y qué acción corresponde.
- Error: describir el problema en lenguaje claro y ofrecer recuperación.
- Sin permisos: no parecer un error técnico.
- Dato parcial: mostrar lo disponible y señalar la limitación.

## 20. Movimiento y transición

Movimiento sobrio y funcional.

- Duración habitual: `150–250ms`.
- Usar `ease` o curvas suaves.
- Animar cambios de estado, paneles y feedback inmediato.
- No usar parallax intenso, rebotes o transiciones largas en interfaces operativas.
- Respetar `prefers-reduced-motion`.

## 21. Responsive

Breakpoints deben seguir la lógica de Tailwind, pero la composición debe validarse visualmente.

Móvil:

- una columna;
- acciones principales visibles;
- navegación colapsable;
- tablas transformadas o con scroll horizontal controlado;
- padding lateral mínimo de `16px`;
- tipografía sin reducción excesiva;
- objetivos táctiles suficientes.

Escritorio:

- usar el espacio adicional para jerarquía, no para llenar con más elementos;
- mantener límites de lectura;
- evitar tarjetas excesivamente anchas;
- no depender de hover para funciones esenciales.

## 22. Accesibilidad

Requisitos mínimos:

- contraste WCAG AA para texto funcional;
- foco visible en todos los controles;
- navegación completa por teclado;
- labels asociados a inputs;
- botones con nombres accesibles;
- imágenes informativas con `alt` descriptivo;
- imágenes decorativas con `alt=""`;
- no depender solo del color para estados;
- orden de encabezados correcto;
- mensajes dinámicos anunciables cuando afecten el flujo;
- controles táctiles de tamaño suficiente.

## 23. Escritura UX

El lenguaje debe ser:

- directo;
- breve;
- específico;
- comprensible para usuarios no técnicos;
- consistente con el contexto del cliente.

Reglas:

- Usar verbos de acción claros.
- Evitar jerga técnica cuando no aporta.
- No usar frases promocionales dentro de tareas operativas.
- Los errores deben indicar qué ocurrió y qué hacer.
- Los estados deben ser consistentes en todas las pantallas.
- En interfaces ejecutivas, resumir primero y permitir detalle después.

## 24. Reglas para nuevas pantallas

Antes de crear una pantalla o componente nuevo:

1. Revisar si ya existe un patrón equivalente.
2. Reutilizar tokens y componentes.
3. Definir el objetivo principal de la pantalla.
4. Limitar acciones de primer nivel.
5. Diseñar estados loading, vacío y error.
6. Validar móvil y escritorio.
7. Comprobar contraste y navegación por teclado.
8. Evitar introducir colores, radios o sombras nuevos sin necesidad.

## 25. Prohibiciones

No hacer:

- restyling general sin aprobación;
- cambiar tipografía global;
- agregar nuevos colores de marca de forma arbitraria;
- usar gradientes neón o efectos cyberpunk;
- combinar demasiados radios;
- aplicar sombras fuertes a todos los paneles;
- usar iconos brillantes o decorativos en exceso;
- ocultar acciones importantes dentro de menús sin necesidad;
- usar texto demasiado fino en paneles operativos;
- saturar dashboards con métricas sin prioridad;
- alterar imágenes de referencia más allá de lo solicitado;
- declarar una pantalla terminada sin revisión visual real en móvil y escritorio.

## 26. Fuente de verdad

Las implementaciones principales se encuentran en:

- `app/globals.css`: tokens globales, tipografía, superficies, botones y campos.
- `app/layout.tsx`: carga oficial de Montserrat.
- `lib/client-theme.ts`: temas contextuales del portal.
- componentes compartidos del sitio, portal y administración.

Cuando el código y este documento difieran, debe revisarse cuál refleja la decisión aprobada más reciente. No se debe normalizar una inconsistencia sin validación visual y funcional.

## 27. Criterio de aprobación visual

Una entrega de UI no se considera completa hasta validar:

- escritorio;
- móvil;
- jerarquía;
- contraste;
- estados interactivos;
- contenido realista;
- consistencia con marca;
- ausencia de overflow o cortes;
- fidelidad a imágenes de referencia;
- accesibilidad básica.

Este archivo debe actualizarse cuando se apruebe un cambio real en el sistema visual, no por cada ajuste menor de implementación.
