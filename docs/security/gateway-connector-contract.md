# Contrato del conector SegurIA

Este documento es interno. Define el contrato minimo entre una instalacion local y SegurIA Cloud.

## Credenciales

El panel interno genera dos valores por propiedad:

- `SEGURIA_GATEWAY_ID`: identificador publico de la instalacion.
- `SEGURIA_GATEWAY_SECRET`: secreto aleatorio mostrado una sola vez.

El secreto se envia en `x-seguria-gateway-secret`. SegurIA guarda unicamente su hash SHA-256. Nunca debe escribirse en logs, snapshots, repositorios o interfaces de cliente.

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

## Snapshots de camara

`POST /api/gateway/cameras/snapshot` recibe `multipart/form-data` con:

- `deviceId`: identificador externo de una camara ya importada.
- `capturedAt`: fecha ISO-8601 de captura.
- `file`: imagen JPEG o WebP de hasta 5 MB.

Debe incluir `x-seguria-gateway-id` y `x-seguria-gateway-secret`. La API verifica que la camara pertenezca al gateway antes de aceptar el archivo.

Las imagenes se guardan en un bucket privado. El portal obtiene una URL firmada por 60 segundos mediante `GET /api/cameras/:deviceId/snapshot`; nunca recibe la URL, token o credencial de la camara de origen.

## Rotacion y revocacion

- Crear una credencial nueva antes de retirar la anterior.
- Confirmar un heartbeat firmado con la nueva credencial.
- Marcar el gateway anterior como `revoked`.
- Investigar cualquier intento posterior y conservarlo en auditoria.
