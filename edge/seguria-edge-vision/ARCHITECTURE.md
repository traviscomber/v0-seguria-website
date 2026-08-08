# SegurIA Edge Vision — N3uralia Intelligence Layer

## Ownership boundary

SegurIA Edge Vision is an N3uralia-owned intelligence and orchestration layer. Third-party products and open protocols are treated as replaceable infrastructure adapters, not as the product core.

The canonical flow is:

`Camera / sensor infrastructure -> adapter -> N3uralia Edge Intelligence -> SegurIA Core -> SegurIA Vision`

## Responsibilities owned by N3uralia

- camera/source normalization
- event gating and sampling policy
- burst capture policy
- best-frame selection
- visual deduplication
- local offline spool and synchronization
- secure Core ingestion
- future animal/no-animal edge filtering
- observation lifecycle and Vision routing
- auditability and operational telemetry

## Replaceable infrastructure

The following components may be used when useful but are never required as the intelligence core:

- RTSP
- ONVIF
- Home Assistant
- Frigate
- MQTT/Mosquitto
- Tuya or manufacturer-specific integrations

Each integration must sit behind an adapter. The photo-first pipeline must not contain vendor-specific business logic.

## Adapter contract

A camera source exposes only three operations to the pipeline:

- `open()`
- `read()`
- `close()`

The current implementation includes `RtspCameraSource`. Future `OnvifCameraSource`, `HomeAssistantSnapshotSource` or `FrigateEventSource` can be added without changing motion gating, burst selection, deduplication, spool or Core synchronization.

## Huilo Huilo MVP

For Huilo Huilo the preferred path is direct local RTSP whenever available:

`Existing camera -> RTSP -> SegurIA Edge Vision -> selected photo -> SegurIA Core`

Home Assistant remains available for Cabaña Smart automation and may later be used as an adapter when a device is only reachable through that integration.

## Compute principle

Video stays local. The Core receives selected photographic events rather than continuous streams. Expensive vision inference is therefore proportional to relevant events, not to camera frame rate or uptime.
