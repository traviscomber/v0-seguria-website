# SegurIA: roadmap de seguridad integral

## Vision

SegurIA sera un centro de seguridad simple para clientes y potente para operadores. Unira camaras, sensores, alarmas, accesos y automatizaciones en una sola experiencia, sin exponer al cliente las marcas, cuentas o herramientas tecnicas que operan por debajo.

La propuesta no es construir otro dashboard domotico. Es convertir senales dispersas en decisiones claras:

- que esta ocurriendo,
- donde esta ocurriendo,
- que nivel de riesgo tiene,
- que respuesta fue ejecutada,
- y quien debe actuar ahora.

## Objetivo principal

En 90 dias, dejar una version Pro lista para operar el primer grupo de clientes reales con:

- acceso seguro por cliente,
- separacion estricta entre empresas y propiedades,
- alta guiada de cuentas y sitios,
- inventario sincronizado de camaras y sensores,
- eventos en tiempo real,
- video en vivo y capturas protegidas,
- alertas accionables,
- automatizaciones de seguridad,
- trazabilidad completa de acciones,
- y operacion degradada cuando internet o un proveedor externo falla.

## Estado de ejecucion

Objetivo autonomo activo desde el 17 de julio de 2026.

Completado y validado en produccion:

- arquitectura y roadmap de 90 dias,
- migracion inicial multiempresa con organizaciones, propiedades, gateways, dispositivos, eventos e incidentes,
- politicas RLS basadas en membresias,
- relaciones de base de datos que impiden asociaciones cruzadas entre empresas,
- autenticacion SSR de Supabase con renovacion de sesion,
- eliminacion de usuarios y contrasenas demo del codigo,
- rutas administrativas protegidas por rol,
- webhooks cerrados cuando falta configuracion,
- secretos maquina-a-maquina movidos a encabezados,
- alta transaccional de usuario, empresa y propiedad,
- referencias tecnicas retiradas del portal del cliente.
- proyecto Supabase dedicado vinculado desde Vercel,
- 11 migraciones aplicadas con historial,
- 20 tablas multiempresa con RLS y permisos de minimo privilegio,
- prueba RLS real con dos organizaciones y cero lecturas cruzadas,
- identidad y secreto hasheado individual por Gateway,
- inventario, estados, eventos, incidentes y snapshots persistidos,
- formulario comercial y onboarding de cuenta persistidos,
- login, registro, redireccion de rutas y aislamiento validados,
- centro interno para asignar, comentar, cambiar estado y cerrar incidentes,
- bitacora inmutable y auditoria para cada accion sobre incidentes,
- plantillas versionadas de automatizacion por empresa y propiedad,
- simulacion segura y bloqueo de activacion sin Gateway operativo,
- entrega versionada al Gateway y confirmacion firmada antes de declarar una regla activa,
- preservacion de la identidad historica del actor al eliminar una cuenta,
- notificaciones al cliente con confirmacion, vencimiento y escalamiento por SLA,
- monitor programado para marcar Gateways obsoletos y escalar confirmaciones vencidas,
- alta interna de cliente desde admin con Supabase Auth, empresa, sitio inicial, espacios base e inventario portal listo para enlace,
- cierre del signup publico para que las cuentas de clientes sean creadas por el equipo interno,
- registro interno de credenciales cifradas por propiedad para preparar conexiones reales,
- migracion de credenciales internas aplicada y validada con insercion cifrada reversible,
- entrega autenticada de configuracion operativa al Gateway local,
- agente local capaz de arrancar solo con identidad SegurIA y sincronizar inventario desde configuracion recibida,
- sesiones efimeras de video solicitadas por cliente y atendidas por Gateway autenticado,
- migracion de sesiones de video aplicada y validada con prueba reversible contra Supabase,
- control de vista de camara en portal cliente con limite de concurrencia por camara y propiedad,
- proxy inicial de frames seguros desde evidencia privada hacia el portal sin URL firmada visible,
- proxy HLS privado con ingesta autenticada del Gateway, manifest reescrito y segmentos protegidos,
- reproductor HLS del portal compatible con navegadores sin soporte nativo y fallback a frame seguro,
- cola offline persistente del agente local con reintentos para heartbeat, inventario y eventos,
- rollback manual y automatico de automatizaciones sin confirmacion del sitio,
- y dashboard administrativo conectado exclusivamente a datos reales.

Siguiente bloque activo:

- agregar WebRTC para baja latencia sobre las sesiones de video ya modeladas,
- y formalizar staging separado de produccion.

## Principio de producto

El cliente solo ve SegurIA. Los nombres Home Assistant y Tuya son internos y no deben aparecer en el sitio comercial, portal del cliente, correos, alertas ni documentos comerciales.

Home Assistant sera la capa de compatibilidad y operacion. La integracion oficial de Tuya sera uno de sus conectores de dispositivos. El acceso directo a la nube del fabricante quedara reservado para funciones que no esten disponibles a traves del puente.

## Lo que ya permiten los proyectos oficiales

La integracion oficial disponible en Home Assistant usa autorizacion por QR, actualizacion cloud push y expone entidades normalizadas. Actualmente contempla, entre otras, estas plataformas:

- paneles de alarma,
- sensores binarios y sensores numericos,
- camaras,
- sirenas,
- cerraduras y accesos representados por entidades compatibles,
- interruptores, botones, escenas y selectores,
- valvulas, climatizacion y otros equipos auxiliares.

Para seguridad, las capacidades mas valiosas son:

- camaras con fuente de stream y captura de imagen,
- deteccion de movimiento y estado de grabacion,
- sensores de movimiento, apertura, humo, gas, agua, vibracion y sabotaje,
- paneles con armado, desarmado, modos y disparo,
- sirenas y actuadores para respuestas automaticas,
- estados push que evitan depender solo de consultas periodicas.

Home Assistant aporta las APIs REST y WebSocket, el registro de dispositivos, entidades, areas, servicios, automatizaciones, historial y una capa local que puede seguir operando aunque SegurIA o internet no esten disponibles temporalmente.

## Arquitectura objetivo

```text
Dispositivos del sitio
        |
        v
Home Assistant por cliente o propiedad
  - integraciones oficiales
  - automatizaciones locales
  - buffer de eventos
  - acceso a video
        |
        | REST inicial + WebSocket + webhooks firmados
        v
SegurIA Gateway
  - identidad unica por instalacion
  - normalizacion
  - reintentos y cola offline
  - proxy de imagen/video
        |
        v
SegurIA Cloud
  - API de ingestion
  - motor de eventos y reglas
  - Supabase/Postgres con RLS
  - almacenamiento protegido
  - notificaciones
        |
        +-------------------+
        |                   |
        v                   v
Portal cliente         Centro de operaciones
```

### Por que esta arquitectura

- Home Assistant resuelve la diversidad de equipos y mantiene control local.
- El Gateway evita exponer una instalacion domestica directamente a internet.
- SegurIA Cloud concentra identidad, clientes, reglas, incidentes y auditoria.
- El portal muestra una experiencia uniforme aunque cambie el fabricante.
- La separacion por cliente reduce el riesgo de mezclar propiedades de una cuenta maestra.

## Regla de aislamiento

La cuenta maestra actual puede utilizarse para un piloto controlado, pero no debe convertirse en el limite de seguridad entre clientes.

Modelo recomendado:

- una organizacion de SegurIA por empresa,
- una o mas propiedades por organizacion,
- un Gateway con credenciales unicas por instalacion,
- un puente Home Assistant por cliente o por propiedad,
- un mapeo explicito de cada dispositivo a una propiedad,
- y politicas RLS que impidan cualquier lectura cruzada.

Si durante el piloto varios clientes comparten una cuenta externa, ningun dispositivo se publica automaticamente. Un operador debe asignarlo a una propiedad y una segunda validacion debe confirmar el alcance antes de hacerlo visible.

## Dominios funcionales

### 1. Estado de seguridad

La portada del portal responde en menos de cinco segundos:

- estado general: protegido, atencion o incidente,
- propiedades vigiladas,
- equipos conectados y desconectados,
- ultima actividad relevante,
- incidentes abiertos,
- y acciones recomendadas.

### 2. Camaras

- mosaico por propiedad y espacio,
- imagen reciente con hora de captura,
- transmision en vivo bajo demanda,
- indicador de conexion, grabacion y movimiento,
- captura asociada a una alerta,
- vista de pantalla completa,
- permisos por usuario,
- y registro de quien abrio una transmision.

El stream entregado por el conector es una fuente temporal. SegurIA debe consumirlo mediante un proxy de medios; nunca debe enviar credenciales, tokens o URL privadas al navegador. La grabacion continua y retencion de clips requieren un NVR o servicio de almacenamiento separado.

### 3. Sensores

- apertura de puertas y ventanas,
- movimiento y presencia,
- humo, monoxido, gas y calidad de aire,
- fuga de agua,
- vibracion, golpe y sabotaje,
- bateria baja,
- perdida de comunicacion,
- temperatura y humedad cuando afecten el riesgo.

Cada sensor se normaliza en un modelo comun con estado, severidad, propiedad, espacio, ultima lectura, ultima comunicacion y calidad de senal cuando exista.

### 4. Alarmas y accesos

- armado total, perimetral y nocturno,
- desarmado con confirmacion reforzada,
- disparo de sirena,
- estado de puertas y cerraduras,
- bitacora de cambios,
- responsable de cada accion,
- y reglas que eviten comandos peligrosos por error.

Las acciones sensibles requieren permisos especificos, reautenticacion y registro de auditoria. Un cliente no debe ejecutar comandos sobre otra propiedad aunque conozca un identificador interno.

### 5. Incidentes

Una alerta aislada se convierte en un incidente cuando cumple una regla. El incidente agrupa:

- senal inicial,
- eventos correlacionados,
- imagen o clip disponible,
- propiedad y espacio,
- nivel de riesgo,
- estado de atencion,
- responsable,
- acciones ejecutadas,
- comentarios y cierre.

Estados: `nuevo`, `validando`, `confirmado`, `en_respuesta`, `resuelto`, `falsa_alarma`.

### 6. Automatizaciones de seguridad

Las respuestas que deben sobrevivir una caida de internet se ejecutan localmente en Home Assistant. SegurIA administra plantillas, parametros y auditoria.

Primeras automatizaciones:

- movimiento fuera de horario + propiedad armada -> alerta prioritaria y captura,
- puerta abierta por tiempo excesivo -> aviso escalonado,
- humo o gas -> sirena local y alerta critica inmediata,
- sensor de agua -> alerta y cierre de valvula si existe,
- camara o gateway offline -> incidente tecnico,
- bateria baja -> tarea preventiva,
- desarme fuera de horario -> validacion de responsable,
- multiples senales en una zona -> elevar severidad.

## Modelo de datos minimo

- `organizations`: cliente o empresa.
- `memberships`: usuario, organizacion y rol.
- `properties`: propiedad, instalacion o faena.
- `spaces`: accesos, bodegas, patios, oficinas y zonas.
- `gateways`: identidad, version, salud y ultima conexion.
- `integrations`: puente, estado y referencia cifrada a secretos.
- `devices`: equipo fisico y procedencia tecnica.
- `entities`: capacidad normalizada expuesta por el puente.
- `entity_states`: estado actual y ultima comunicacion.
- `events`: registro inmutable de senales recibidas.
- `incidents`: correlacion, severidad y flujo de respuesta.
- `incident_evidence`: capturas, clips y documentos.
- `automation_templates`: reglas versionadas.
- `notifications`: canal, entrega, lectura y escalamiento.
- `audit_log`: accesos, cambios y comandos sensibles.

Toda tabla operativa debe incluir `organization_id`. Las politicas RLS se prueban con usuarios de dos organizaciones antes de habilitar produccion.

## Contrato normalizado de eventos

```json
{
  "eventId": "evt_...",
  "occurredAt": "2026-07-16T20:15:00Z",
  "organizationId": "org_...",
  "propertyId": "prop_...",
  "gatewayId": "gw_...",
  "deviceId": "dev_...",
  "entityId": "binary_sensor.puerta_bodega",
  "type": "security.entry.opened",
  "severity": "warning",
  "state": "open",
  "source": "home_assistant",
  "evidence": [],
  "deduplicationKey": "...",
  "payloadVersion": 1
}
```

Requisitos del contrato:

- identificadores estables y no reutilizables,
- version de payload,
- fecha del origen y fecha de recepcion,
- idempotencia para evitar eventos duplicados,
- severidad calculada por reglas de SegurIA,
- payload original conservado para diagnostico,
- y rechazo de eventos sin una relacion valida gateway-propiedad.

## Seguridad obligatoria

- Ninguna ruta de ingestion puede quedar abierta cuando falta una variable de entorno.
- Cada Gateway usa una identidad propia, firma HMAC o certificado, timestamp y nonce.
- Los secretos se guardan cifrados y nunca en JSON local, logs o respuestas del portal.
- Supabase Auth administra sesiones; Postgres y RLS administran autorizacion multiempresa.
- El backend valida organizacion y propiedad en cada consulta y comando.
- Video, imagenes y clips usan URL firmadas de corta duracion.
- Los comandos de alarma, cerradura y sirena son deny-by-default.
- Toda accion sensible queda en `audit_log`.
- Se definen retencion, exportacion y eliminacion de datos conforme a la operacion en Chile.
- Se monitorean intentos fallidos, gateways silenciosos y cambios de credenciales.
- Backups y restauracion se prueban, no solo se configuran.

## Fases de ejecucion

### Fase 0: cerrar riesgos del prototipo - Semana 1

Objetivo: transformar el esqueleto actual en una base segura.

Entregables:

- eliminar persistencia operativa en archivos locales,
- crear esquema Supabase multiempresa,
- activar RLS y pruebas de aislamiento,
- hacer fail-closed todos los secretos de ingestion,
- separar datos demo de datos reales,
- crear ambientes desarrollo, staging y produccion,
- documentar gestion y rotacion de secretos.

Hecho cuando:

- reiniciar o redeployar no elimina datos,
- una peticion sin credenciales siempre falla,
- un usuario de Cliente A no puede leer ningun dato de Cliente B,
- y el portal funciona solo con datos persistidos.

### Fase 1: onboarding real - Semanas 2 y 3

Objetivo: conectar un cliente sin editar codigo.

Entregables:

- asistente interno para crear organizacion, propiedad y espacios,
- registro de Gateway con codigo de activacion de un solo uso,
- vinculacion por QR en el puente Home Assistant,
- importacion de registro de dispositivos, entidades y areas,
- pantalla de asignacion dispositivo -> propiedad -> espacio,
- lista de compatibilidad y excepciones,
- prueba de conexion y checklist de puesta en marcha.

Hecho cuando:

- un tecnico puede activar una instalacion en menos de 30 minutos,
- ningun dato externo aparece al cliente sin asignacion,
- y reconectar credenciales no requiere soporte de desarrollo.

### Fase 2: sincronizacion confiable - Semanas 3 y 4

Objetivo: mantener estado e historial casi en tiempo real.

Entregables:

- sincronizacion inicial por REST,
- consumidor persistente de WebSocket para cambios de estado,
- webhook firmado para eventos priorizados,
- heartbeat, health score y version del Gateway,
- cola offline con reintentos exponenciales,
- deduplicacion e idempotencia,
- reconciliacion periodica del inventario,
- metricas de retraso y perdida de eventos.

Hecho cuando:

- 95% de eventos llega al portal en menos de 3 segundos,
- duplicados visibles son cero,
- una desconexion temporal se recupera sin perder eventos criticos,
- y un gateway offline genera una alerta tecnica.

### Fase 3: portal de seguridad - Semanas 5 y 6

Objetivo: entregar una experiencia que cualquier cliente entienda.

Entregables:

- inicio con estado general y proxima accion,
- navegacion por propiedad y espacio,
- mosaico de camaras con imagen reciente,
- sensores agrupados por riesgo, no por tecnologia,
- timeline de actividad,
- centro de incidentes,
- filtros por propiedad, severidad y estado,
- vista movil completa,
- estados vacios, degradados y sin conexion.

Hecho cuando:

- un usuario entiende el estado de su propiedad en menos de 10 segundos,
- una alerta critica se encuentra en dos interacciones o menos,
- y no aparece ningun nombre de proveedor tecnico.

### Fase 4: video seguro - Semanas 6 y 7

Objetivo: incorporar video sin filtrar secretos ni saturar la plataforma.

Entregables:

- servicio proxy para streams temporales,
- generacion de snapshots con cache corto,
- renovacion controlada de fuentes,
- limites de concurrencia y ancho de banda,
- capturas asociadas a incidentes,
- integracion opcional con NVR para clips y retencion,
- auditoria de visualizacion y exportacion.

Hecho cuando:

- ninguna URL de origen llega al navegador,
- una camara compatible abre en tiempos definidos,
- los fallos muestran estado util y no una pantalla rota,
- y la evidencia respeta permisos y retencion.

### Fase 5: motor de incidentes - Semanas 8 y 9

Objetivo: pasar de mostrar eventos a gestionar seguridad.

Entregables:

- reglas por horario, modo y propiedad,
- correlacion de multiples senales,
- severidad dinamica,
- flujo de asignacion y cierre,
- evidencia adjunta,
- alertas por canales configurables,
- escalamiento si nadie confirma,
- resumen diario y reporte mensual.

Hecho cuando:

- cada alerta critica tiene responsable y trazabilidad,
- falsas alarmas pueden clasificarse y aprenderse,
- y el operador distingue incidentes reales de ruido tecnico.

### Fase 6: automatizacion y operacion local - Semanas 10 y 11

Objetivo: responder incluso con conectividad degradada.

Entregables:

- paquete versionado de automatizaciones para Home Assistant,
- plantillas parametrizables por propiedad,
- despliegue seguro y rollback,
- estado de regla visible desde SegurIA,
- simulacion antes de activar,
- bloqueo de comandos inseguros,
- registro completo de ejecucion.

Hecho cuando:

- una regla critica funciona sin internet,
- cada cambio puede rastrearse y revertirse,
- y el portal refleja la respuesta local al recuperar conexion.

### Fase 7: SegurIA Pro - Semana 12

Objetivo: preparar venta, soporte y crecimiento.

Entregables:

- planes por numero de propiedades, camaras y retencion,
- roles `owner`, `operator`, `viewer` y `technician`,
- panel interno de salud de clientes,
- SLA y runbooks de incidentes,
- exportacion de informes,
- onboarding repetible,
- telemetria de uso y costos,
- piloto formal con tres clientes.

Hecho cuando:

- tres organizaciones operan sin mezclar datos,
- soporte puede diagnosticar sin acceder a secretos,
- el costo por instalacion es medible,
- y existe un procedimiento probado para alta, falla y baja.

## Backlog priorizado

### P0: antes de conectar cuentas reales

- esquema Supabase y RLS,
- autenticacion real y membresias,
- secretos fail-closed,
- identidad de Gateway,
- aislamiento por organizacion y propiedad,
- inventario persistente,
- auditoria de comandos,
- eliminacion de datos demo en produccion.

### P1: primer piloto util

- importacion desde Home Assistant,
- WebSocket de estados,
- dashboard por propiedad,
- sensores y alertas normalizados,
- snapshots de camaras,
- incidentes basicos,
- salud del Gateway,
- notificaciones operativas.

### P2: experiencia Pro

- stream en vivo protegido,
- correlacion de eventos,
- automatizaciones versionadas,
- clips y NVR,
- reportes,
- escalamiento multicanal,
- app movil o PWA,
- analitica de falsas alarmas.

### P3: diferenciacion futura

- deteccion inteligente en video ejecutada localmente,
- mapas y planos interactivos,
- rondas virtuales,
- prediccion de fallas,
- puntuacion de riesgo por propiedad,
- despacho coordinado de respuesta,
- integraciones con centrales de monitoreo,
- API para partners e instaladores.

## Indicadores de exito

Producto:

- tiempo para entender el estado general: menos de 10 segundos,
- tiempo de activacion de cliente: menos de 30 minutos,
- disponibilidad mensual del portal: 99.9%,
- eventos visibles en menos de 3 segundos: al menos 95%,
- alertas criticas confirmadas dentro del SLA: al menos 95%.

Tecnicos:

- cero lecturas cruzadas entre organizaciones,
- cero secretos de origen expuestos al navegador,
- cero rutas de ingestion abiertas por configuracion incompleta,
- recuperacion automatica despues de una desconexion,
- trazabilidad del 100% de comandos sensibles.

Negocio:

- costo mensual medible por propiedad,
- tasa de activacion exitosa sin desarrollo,
- reduccion de falsas alarmas por cliente,
- retencion y uso semanal del portal,
- tiempo medio de resolucion de incidentes.

## Decisiones que no deben postergarse

1. Definir si el despliegue estandar sera un Home Assistant por cliente o por propiedad.
2. Elegir el Gateway administrado y su mecanismo de actualizacion remota.
3. Definir politica de video: solo vivo y capturas, o tambien clips y grabacion continua.
4. Definir canales de alerta iniciales y SLA humano.
5. Definir retencion de eventos, imagenes, clips y auditoria.
6. Separar formalmente datos piloto, staging y produccion.

## Primer sprint recomendado

Duracion: 10 dias habiles.

Objetivo: conectar una propiedad real de N3uralia de forma segura y mostrar estados reales sin exponer tecnologia subyacente.

Entregables:

- migraciones Supabase para organizaciones, propiedades, gateways, dispositivos, entidades y eventos,
- RLS y pruebas con dos organizaciones ficticias,
- provisionamiento de un Gateway,
- importacion inicial de entidades desde Home Assistant,
- consumidor de eventos con idempotencia,
- mapeo manual a espacios,
- dashboard real de una propiedad,
- snapshots de una camara compatible,
- timeline de sensores,
- una alerta critica y una alerta tecnica,
- checklist de seguridad y evidencia de pruebas.

Fuera de alcance del primer sprint:

- grabacion continua,
- analisis avanzado de video,
- facturacion,
- aplicacion movil nativa,
- acceso directo del cliente a configuraciones tecnicas,
- soporte automatico para dispositivos no expuestos por el puente.

## Criterio final

SegurIA estara lista para venderse como solucion Pro cuando nuestro equipo pueda activar un cliente, asignar sus equipos, detectar un incidente, mostrar evidencia, ejecutar una respuesta y demostrar quien hizo cada accion, sin revelar proveedores, sin mezclar datos y sin depender de una conexion permanente a la nube para las reglas criticas.

## Estado de ejecucion

Actualizado: 17 de julio de 2026.

Completado en codigo:

- autenticacion SSR con Supabase Auth y sesiones seguras,
- esquema multiempresa para organizaciones, membresias, propiedades, espacios, gateways, integraciones, equipos, entidades, estados, eventos, incidentes y auditoria,
- politicas RLS y permisos deny-by-default para tablas operativas,
- provision de clientes mediante RPC transaccional,
- identidad y secreto independiente por gateway, almacenado unicamente como hash,
- provision de conectores desde el panel interno y entrega del secreto una sola vez,
- ingestion atomica e idempotente de eventos, estados y heartbeat,
- importacion inicial de hasta 500 dispositivos y 1000 entidades por solicitud,
- inventario y KPI administrativos alimentados por datos persistidos,
- portal cliente alimentado por propiedades y equipos autorizados,
- eliminacion del login demo y de la persistencia de integraciones en memoria,
- contrato tecnico del gateway y baseline de seguridad documentados.
- snapshots privados de camaras con carga autenticada y URL firmada de corta duracion,
- timeline de eventos reales y refresco Realtime bajo RLS,
- asignacion administrativa de equipos a espacios,
- creacion idempotente de incidentes criticos y deteccion de gateways silenciosos.
- centro operativo de incidentes con asignacion, transiciones, comentarios y auditoria,
- automatizaciones versionadas con despliegue confirmado por gateway,
- bandeja persistente de avisos por cliente con confirmacion de recepcion,
- SLA de 5 minutos para criticidad alta y 30 minutos para atencion,
- escalamiento automatico de avisos vencidos mediante monitor autenticado,
- visualizacion de confirmaciones y vencimientos en el centro de incidentes y dashboard administrativo.

Validado localmente:

- TypeScript sin errores,
- higiene de diff sin errores,
- build de produccion como puerta de salida de cada bloque,
- rutas de maquina sin credenciales globales compartidas.
- 11 migraciones aplicadas en la base productiva,
- aislamiento RLS probado con usuarios de dos organizaciones,
- solicitud de vista de camara con reutilizacion de sesion propia y bloqueo por concurrencia,
- generacion, lectura aislada, confirmacion, escalamiento, auditoria y limpieza de avisos probados contra Supabase.

Pendiente de infraestructura:

- provisionar la primera propiedad real y confirmar el primer heartbeat,
- definir proveedores y plantillas para email, SMS o push,
- acordar retencion de evidencia, eventos y auditoria,
- separar un ambiente formal de staging antes del piloto ampliado.

Siguiente bloque autonomo:

1. Incorporar entrega multicanal con reintentos y preferencias por usuario.
2. Asociar evidencia visual y eventos correlacionados a cada incidente.
3. Crear resumen diario y reporte mensual por organizacion.
4. Medir tiempos de confirmacion, respuesta y resolucion por severidad.
5. Ejecutar el piloto operativo con la primera propiedad real.

## Fuentes tecnicas oficiales

- [Home Assistant Core](https://github.com/home-assistant/core)
- [Integracion oficial en Home Assistant](https://github.com/home-assistant/core/tree/dev/homeassistant/components/tuya)
- [Implementacion oficial de camaras](https://github.com/home-assistant/core/blob/dev/homeassistant/components/tuya/camera.py)
- [API REST de Home Assistant](https://developers.home-assistant.io/docs/api/rest/)
- [API WebSocket de Home Assistant](https://developers.home-assistant.io/docs/api/websocket/)
- [Repositorio oficial Smart Life](https://github.com/tuya/tuya-smart-life)
- [Conector oficial Node.js](https://github.com/tuya/tuya-connector-nodejs)
