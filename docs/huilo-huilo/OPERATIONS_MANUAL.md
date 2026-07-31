# SegurIA Biodiversidad — Manual operativo del piloto

## 1. Preparación

1. Crear las cámaras en **SegurIA Vision > Registro de cámaras**.
2. Usar códigos estables y no reutilizarlos para otra ubicación.
3. Registrar solo una zona general. Las coordenadas exactas deben permanecer restringidas.
4. Confirmar la cuota mensual antes de iniciar una carga masiva.

## 2. Carga de imágenes

1. Seleccionar una cámara activa.
2. Indicar la fecha de captura cuando esté disponible.
3. Cargar lotes de hasta 20 imágenes JPEG, PNG o WebP.
4. No cerrar la página hasta que el lote termine.
5. Los archivos repetidos se detectan mediante hash.

## 3. Revisión científica

Cada predicción debe quedar en uno de estos estados:

- **Confirmado:** especie correcta y evidencia suficiente.
- **Corregido:** la predicción requiere ajuste taxonómico.
- **Rechazado:** detección incorrecta.
- **No identificable:** evidencia insuficiente.

La imagen original se abre desde **Ver evidencia**. El acceso es privado y temporal. Los bounding boxes sirven como referencia y no sustituyen la revisión humana.

## 4. Conjunto de evaluación

Para el piloto se debe crear un conjunto de 500 a 5.000 imágenes reales. Cada imagen revisada debe registrar:

- resultado observado: verdadero positivo, falso positivo, falso negativo, verdadero negativo o no identificable;
- calidad: buena, borrosa, oscura, infrarroja, lluvia, nieve, ocluida, vacía u otra;
- especie esperada cuando exista confirmación experta;
- notas del revisor.

No deben calcularse métricas científicas finales hasta contar con una muestra suficiente y revisión experta.

## 5. Indicadores de control

- imágenes procesadas correctamente;
- tasa de confirmación;
- falsos positivos y falsos negativos observados;
- proporción no identificable;
- latencia promedio;
- costo promedio por imagen;
- errores y calidad por cámara;
- tiempo promedio de revisión.

## 6. Incidentes

- **Error temporal del proveedor:** el sistema reintenta de forma controlada.
- **Cuota agotada:** detener la carga y ajustar la cuota autorizada.
- **Imagen sin evidencia almacenada:** conservar el trabajo, registrar el incidente y no validarlo como registro científico.
- **Cámara con alta tasa de imágenes inútiles:** revisar posición, enfoque, energía y configuración de terreno.

## 7. Cierre del piloto

El piloto se cierra cuando:

1. todas las imágenes seleccionadas fueron procesadas;
2. la muestra acordada fue revisada;
3. las confusiones principales están documentadas;
4. se dispone de costo y latencia reales;
5. se decide continuar con OpenAI, incorporar MegaDetector o preparar un clasificador local;
6. se entrega el informe de desempeño y el backlog de continuidad.
