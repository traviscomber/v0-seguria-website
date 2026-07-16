# SegurIA Gateway

Local gateway scaffold for each property.

Responsibilities:

- Connect to Home Assistant
- Publish MQTT events
- Send heartbeat to SegurIA
- Buffer events when internet is unavailable
- Sync historical events after reconnect

## Environment

Copy `.env.example` to `.env` and fill the values for the property.

## Layout

- `src/index.js`
- `src/config.js`
- `src/seguria-api.js`
- `src/home-assistant.js`
- `src/mqtt.js`
- `src/event-buffer.js`
- `src/sync.js`
- `src/commands.js`

## Notes

This is a scaffold, not a production runtime yet. It defines the boundary between the local property network and the portal.
