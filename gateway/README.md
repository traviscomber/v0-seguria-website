# SegurIA Gateway

Local gateway scaffold for each property.

Responsibilities:

- Request its operational connection from SegurIA
- Connect to the local bridge
- Publish MQTT events
- Send heartbeat to SegurIA
- Buffer events and critical operations when internet is unavailable
- Retry heartbeat, inventory and events after reconnect

## Environment

The standard deployment only needs:

```text
SEGURIA_GATEWAY_ID=
SEGURIA_GATEWAY_SECRET=
SEGURIA_API_BASE_URL=https://seguria.tech
```

Optional local overrides:

```text
HOME_ASSISTANT_URL=
HOME_ASSISTANT_TOKEN=
MQTT_URL=
MQTT_USERNAME=
MQTT_PASSWORD=
EVENT_BUFFER_FILE=./data/events.json
OPERATION_QUEUE_FILE=./data/operations.json
```

When local overrides are absent, the gateway requests its operational configuration from SegurIA using `/api/gateway/config`.

## Layout

- `src/index.js`
- `src/config.js`
- `src/seguria-api.js`
- `src/home-assistant.js`
- `src/mqtt.js`
- `src/event-buffer.js`
- `src/operation-queue.js`
- `src/sync.js`
- `src/commands.js`

## Notes

This runtime defines the boundary between the local property network and SegurIA. The customer portal never receives connector secrets or technical provider credentials.

The operation queue is persisted locally and uses bounded exponential backoff. If SegurIA Cloud is unreachable, the gateway keeps running and retries queued heartbeat, inventory and event operations on the next sync.
