# SegurIA Edge Vision v1

Agente local photo-first para Mini PC. Su objetivo es reutilizar cámaras existentes con acceso RTSP y reducir el costo del Core: el video permanece en la red local y solo se envían fotografías seleccionadas cuando hay un evento relevante.

## Flujo

RTSP local -> muestreo liviano -> detección de cambio/movimiento -> ráfaga corta -> descarte por calidad/duplicado -> mejor foto -> `/api/gateway/cameras/snapshot` -> SegurIA Core.

El endpoint del Core ya autentica el Mini PC mediante `x-seguria-gateway-id` y `x-seguria-gateway-secret`, valida que la cámara pertenezca al gateway y guarda la evidencia en el bucket privado de SegurIA.

## Principios

- No se transmite video continuo al Core.
- No se ejecuta identificación de especie en cada frame.
- El Mini PC trabaja principalmente con CPU.
- Cada cámara puede ser de cualquier marca mientras entregue RTSP accesible localmente.
- El stream se mantiene local; al Core llega una fotografía de evento.
- Si Internet se cae, la foto queda en spool local y se reintenta posteriormente.
- No hay datos ficticios ni detecciones simuladas.

## Instalación rápida

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp config.example.yaml config.yaml
python main.py --config config.yaml
```

Editar `config.yaml` con el `gateway_id`, `gateway_secret`, `device_id` real registrado en SegurIA y la URL RTSP de cada cámara.

## Parámetros principales

`sample_fps`: frecuencia con que se calcula movimiento. No es la frecuencia de inferencia.

`min_changed_ratio`: proporción mínima de píxeles modificados para abrir un evento.

`cooldown_seconds`: evita generar múltiples eventos por el mismo movimiento continuo.

`burst.frames`: cantidad de imágenes candidatas capturadas después del trigger.

`duplicate_hamming_distance`: evita enviar fotografías casi idénticas.

`min_blur_score`: descarta frames demasiado borrosos cuando existe una alternativa mejor.

## Siguiente fase

Añadir L1 local `animal/no-animal` con un modelo pequeño opcional. Esa etapa debe correr después del motion gate y antes del upload. El Core seguirá siendo responsable de la identificación avanzada, persistencia canónica, revisión humana y análisis de biodiversidad.
