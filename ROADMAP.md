# SegurIA Roadmap

Objetivo: dejar lista una plataforma interna simple para que nuestro equipo configure la cuenta del cliente, traiga sus dispositivos y muestre sus datos en un portal claro.

## Ruta recomendada para la conexion real

Para simplificar la operacion, la conexion real de la marca debe pasar primero por Home Assistant y no directo a SegurIA.

Flujo recomendado:

- El cliente conecta sus equipos en Home Assistant usando la integracion oficial de Tuya.
- Home Assistant expone camaras, sensores, escenas y estados como entidades normalizadas.
- SegurIA consume esas entidades desde Home Assistant y las presenta en el portal.
- Si una funcion no queda expuesta por Home Assistant, se evalua como excepcion y no como camino principal.

Resultado:

- una sola capa tecnica para operar,
- menos dependencia directa de la marca,
- mejor control de estados, alertas y soporte,
- una base mas simple para escalar a version pro.

## Objetivo autonomo de 8 horas

Construir el portal operativo base en una sola jornada de trabajo enfocada:

- Hora 1: revisar estado actual y cerrar el modelo de cuenta del cliente.
- Hora 2: terminar el alta persistente y la confirmacion visual.
- Hora 3: importar dispositivos y normalizar tipos.
- Hora 4: mostrar eventos recientes y estados.
- Hora 5: afinar el dashboard para lectura rapida.
- Hora 6: limpiar textos, flujos y estados vacios.
- Hora 7: validar que recarga y persistencia funcionen.
- Hora 8: revisar, corregir detalles y dejar listo para siguiente fase.

Resultado esperado al cierre de las 8 horas:

- cuenta del cliente lista y persistente,
- dispositivos visibles,
- alertas comprensibles,
- portal simple y util para operacion interna.

## Modo de trabajo autonomo

- Avanzar por etapas, en orden.
- Si una etapa no bloquea, seguir sin detenerse.
- Si una dependencia externa falta, dejarla documentada y continuar con la siguiente parte util.
- Mantener la interfaz simple para operacion interna.
- Priorizar el cierre del portal antes de agregar mas complejidad.
- Validar cada cambio contra el agente de compliance de marca en [`.agents/brandbook-compliance.md`](.agents/brandbook-compliance.md).

## Regla de prioridad

1. Configurar la cuenta del cliente.
2. Traer dispositivos y eventos.
3. Mostrar dashboard claro.
4. Preparar la capa pro.

## Fase 1. Seteo de cuenta

Meta:

- Registrar la cuenta del cliente.
- Guardar el estado del vinculo.
- Confirmar que la cuenta quedo lista para operar.

Tareas:

- Crear formulario interno de alta.
- Guardar nombre de cuenta, sitio y alcance.
- Persistir el estado entre recargas.
- Mostrar un resumen visible en el panel.
- Dejar un mensaje claro de cuenta lista.

Hecho cuando:

- La cuenta queda guardada.
- El panel la muestra despues de recargar.
- El equipo puede verla sin repetir el alta.

## Fase 2. Traer dispositivos

Meta:

- Importar equipos del cliente desde Home Assistant.
- Normalizar camaras, sensores, cerraduras, switches y alertas.
- Guardar el estado de cada dispositivo.

Tareas:

- Leer dispositivos desde la fuente conectada en Home Assistant.
- Mapear cada equipo a un tipo interno.
- Guardar estado, ubicacion y ultimo evento.
- Registrar eventos de sincronizacion.
- Preparar soporte para lectura inicial y actualizaciones.

Hecho cuando:

- Los dispositivos aparecen en el panel.
- Los estados quedan clasificados.
- Los eventos recientes se ven en la linea de tiempo.

## Fase 3. Dashboard operativo

Meta:

- Mostrar lo importante sin ruido.
- Hacer visible lo que esta activo, lo que requiere revision y lo que esta fallando.
- Separar bien camaras, sensores y alertas.

Tareas:

- Vista de estado general.
- Vista de dispositivos por tipo.
- Vista de alertas recientes.
- Tarjetas claras para operacion interna.
- Busqueda y filtros simples.

Hecho cuando:

- Se entiende el estado general en pocos segundos.
- Las camaras y sensores se distinguen rapido.
- Las alertas criticas quedan visibles.

## Fase 4. Capa pro

Meta:

- Escalar a varios clientes y propiedades.
- Sumar roles.
- Mejorar reportes y alertas.
- Dejar lista una base para puente local y automatizacion.

Tareas:

- Soporte multi-cliente.
- Soporte multi-propiedad.
- Roles internos y externos.
- Reportes basicos.
- Integracion local opcional.

Hecho cuando:

- El sistema soporta mas de una cuenta.
- Se entiende quien ve que.
- La base queda lista para vender una version pro.

## Entregables por etapa

### Entregable 1

- Cuenta guardada y visible.
- Estado persistente.
- Mensaje claro de alta exitosa.

### Entregable 2

- Dispositivos importados.
- Tipos internos definidos.
- Eventos registrados.

### Entregable 3

- Dashboard simple.
- Estado general.
- Alertas y detalles utiles.

### Entregable 4

- Base preparada para clientes multiples.
- Base preparada para soporte avanzado.

## Criterio de exito

El sistema esta bien resuelto cuando nuestro equipo puede:

- dejar una cuenta operativa rapido,
- ver sus dispositivos sin friccion,
- entender que esta bien y que esta mal,
- y saber que hacer despues.

## Regla de producto

La marca no debe depender del camino directo a la nube del fabricante para el MVP. Home Assistant es el puente operativo recomendado.
