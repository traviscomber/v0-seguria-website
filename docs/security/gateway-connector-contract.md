# Contrato del conector SegurIA

Este documento es interno. Define el contrato minimo entre una instalacion local y SegurIA Cloud.

## Credenciales

El panel interno genera dos valores por propiedad:

- `SEGURIA_GATEWAY_ID`: identificador publico de la instalacion.
- `SEGURIA_GATEWAY_SECRET`: secreto aleatorio mostrado una sola vez.

El secreto se envia en `x-seguria-gateway-secret`. SegurIA guarda unicamente su hash SHA-256. Nunca debe escribirse en logs, snapshots, repositorios o interfaces de cliente.

## Configuracion operativa

`POST /api/gateway/config`

El gateway usa su identidad SegurIA para solicitar la configuracion operativa de su propiedad. La respuesta puede incluir endpoint y secreto descifrado para el puente local asignado a esa propiedad. Esta respuesta es solo para el agente local autenticado; no se expone al portal del cliente.

Payload:

```json
{
  "gatewayId": "gw_example123456"
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "gateway": {
      "publicId": "gw_example123456",
      "propertyId": "property_uuid"
    },
    "connections": [
      {
        "provider": "local_bridge",
        "label": "Conector principal",
        "endpoint": "https://local.example",
        "secret": "decrypted-runtime-secret"
      }
    ]
  }
}
```

Cada entrega queda registrada en `audit_log` como `gateway.config.delivered`.

## Sincronizacion inicial

`POST /api/gateway/inventory`

Cabecera:

```text
x-seguria-gateway-secret: <secret>
content-type: application/json
```

Payload:

```json
{
  "gatewayId": "gw_example123456",
  "synchronizedAt": "2026-07-16T20:15:00Z",
  "devices": [
    {
      "deviceId": "device_entry_main",
      "name": "Acceso principal",
      "area": "Recepcion",
      "entities": [
        {
          "entityId": "binary_sensor.entry_main",
          "name": "Puerta principal",
          "state": "off",
          "deviceClass": "door",
          "attributes": {}
        }
      ]
    }
  ]
}
```

Limites: 500 dispositivos por solicitud y 80 entidades por dispositivo. La operación es idempotente por gateway, dispositivo y entidad.

## Cambios de estado

`POST /api/gateway/devices/state` recibe cambios incrementales. El cuerpo incluye `gatewayId`, `eventId`, `deviceId`, `entityId`, `deviceName`, `status`, `state` y `timestamp`.

## Eventos de seguridad

`POST /api/gateway/events` recibe alertas normalizadas. `eventId` debe ser estable para evitar duplicados.

## Heartbeat

`POST /api/gateway/heartbeat` debe ejecutarse cada 60 segundos. Después de tres periodos sin comunicación, el monitor cloud debe marcar el gateway como degradado y crear una alerta técnica.

## Continuidad offline

El gateway mantiene una cola local persistente para operaciones criticas. Si SegurIA Cloud no responde, debe encolar heartbeat, inventario y eventos ya capturados, continuar ejecutando el ciclo local y reintentar con backoff exponencial en la siguiente sincronizacion. La cola local no guarda secretos del cliente ni URLs de origen; solo payloads normalizados hacia SegurIA.

## Recuperacion de automatizaciones

Los cambios de automatizacion pasan por estado `ready` y solo se declaran activos cuando el gateway confirma el token de despliegue. Si el sitio reporta falla, el cambio queda en `error`, se limpia el token y se registra auditoria. Si el sitio no confirma dentro de 10 minutos, el monitor ejecuta rollback automatico con el mismo comportamiento. El equipo interno tambien puede ejecutar rollback manual desde el panel admin.

## Snapshots de camara

`POST /api/gateway/cameras/snapshot` recibe `multipart/form-data` con:

- `deviceId`: identificador externo de una camara ya importada.
- `capturedAt`: fecha ISO-8601 de captura.
- `file`: imagen JPEG o WebP de hasta 5 MB.

Debe incluir `x-seguria-gateway-id` y `x-seguria-gateway-secret`. La API verifica que la camara pertenezca al gateway antes de aceptar el archivo.

Las imagenes se guardan en un bucket privado. El portal obtiene una URL firmada por 60 segundos mediante `GET /api/cameras/:deviceId/snapshot`; nunca recibe la URL, token o credencial de la camara de origen.

## Sesiones de video

`POST /api/cameras/:deviceId/stream` permite al usuario autorizado solicitar una sesion efimera para una camara. SegurIA crea una sesion con vencimiento corto y la deja disponible para el gateway de esa propiedad.

La ruta aplica limites de concurrencia antes de crear sesiones:

- 1 vista activa o solicitada por camara.
- 6 vistas activas o solicitadas por propiedad.
- sesiones vencidas se marcan como `expired` antes de evaluar disponibilidad.
- si el mismo usuario ya tiene una sesion vigente para la camara, la API reutiliza esa sesion y no crea otra.

El portal consulta estado con `GET /api/cameras/:deviceId/stream`; la respuesta solo incluye identificador, estado, vencimiento de sesion y una URL interna SegurIA para consumir el medio protegido.

El primer proxy de medio disponible es:

```text
GET /api/cameras/:deviceId/stream/frame?sessionId=<session_uuid>
```

Esta ruta valida sesion, usuario, propiedad, camara y vencimiento antes de entregar bytes de imagen desde el bucket privado. El navegador nunca recibe una URL firmada de storage ni una referencia local del gateway.

El gateway consulta sesiones pendientes con:

```text
GET /api/gateway/cameras/stream-sessions
x-seguria-gateway-id: <gateway_id>
x-seguria-gateway-secret: <secret>
```

Luego reporta estado con:

```text
POST /api/gateway/cameras/stream-sessions
```

```json
{
  "sessionId": "session_uuid",
  "status": "active",
  "gatewayStreamRef": "local-session-reference"
}
```

El cliente no recibe token, URL firmada, URL local o credencial de origen. Solo ve estado de sesion y medios entregados por SegurIA. La referencia `gatewayStreamRef` queda confinada al backend y al gateway.

## Rotacion y revocacion

- Crear una credencial nueva antes de retirar la anterior.
- Confirmar un heartbeat firmado con la nueva credencial.
- Marcar el gateway anterior como `revoked`.
- Investigar cualquier intento posterior y conservarlo en auditoria.
