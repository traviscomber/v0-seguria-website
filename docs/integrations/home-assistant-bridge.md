# Home Assistant bridge for Tuya-connected clients

SegurIA should treat Home Assistant as the primary operational bridge for the MVP.

## Recommended flow

1. The client connects Tuya inside Home Assistant using the official Home Assistant Tuya integration.
2. Home Assistant discovers or loads the entities that matter for SegurIA: cameras, sensors, alerts and access points.
3. SegurIA consumes those entities through the existing Home Assistant event/API surface.
4. The portal displays a single client view instead of exposing the underlying platform complexity.

## Why this is the preferred path

- One integration layer is simpler to support.
- Home Assistant normalizes a lot of device types for us.
- We avoid depending on the direct vendor path for the MVP.
- The portal stays focused on the security workflow, not on device setup details.

## Operational notes

- If a device is not exposed by Home Assistant, treat it as an exception.
- If the vendor exposes extra functionality that Home Assistant does not surface, keep it out of the MVP.
- The direct vendor path can remain as a fallback for special cases later.

## Success criteria

- The client sees a single portal.
- Our team manages one operational bridge.
- Cameras, sensors and alerts are visible with clear labels.
- The system can scale to more clients without changing the public narrative.
