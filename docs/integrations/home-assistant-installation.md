# Home Assistant installation package

This is the internal installation baseline for each SegurIA property.

The customer should only see SegurIA. Home Assistant, Tuya, ONVIF and MQTT are internal operational components.

## Standard per property

Use one Home Assistant instance per property for the first pilots:

- `santa-elena`: Campo Lechero Santa Elena
- `huilo-huilo`: Hotel Huilo Huilo

Do not share one Home Assistant instance across unrelated customers.

## Install inside Home Assistant

Install and enable these integrations:

1. Tuya official integration
2. ONVIF integration
3. MQTT integration
4. Mosquitto broker add-on

Optional later:

1. Frigate for local video intelligence
2. Matter for Matter devices
3. Z-Wave JS for Z-Wave sensors

Do not make HACS or custom Tuya integrations part of the MVP baseline.

## Home Assistant setup checklist

1. Install Home Assistant OS on the local host.
2. Create an internal admin user controlled by operations.
3. Add the official Tuya integration by QR.
4. Add ONVIF cameras with local camera credentials.
5. Add MQTT and point it to the local Mosquitto broker when needed.
6. Create a long-lived access token for `SegurIA Gateway`.
7. Name areas clearly: acceso, recepcion, bodega, patio, sala tecnica, estacionamiento.
8. Confirm entities have readable names before importing them into SegurIA.

## SegurIA Gateway setup

Preferred remote install:

```bash
curl -fsSL https://www.seguria.tech/install/install.sh | sh -s -- \
  --site santa-elena \
  --gateway-id "<SEGURIA_GATEWAY_ID>" \
  --gateway-secret "<SEGURIA_GATEWAY_SECRET>"
```

Detailed remote instructions live in `docs/integrations/remote-one-click-install.md`.

From `gateway/`:

```powershell
.\install-site.ps1 -SiteSlug santa-elena
Copy-Item .env.example .env
```

Fill:

```text
SEGURIA_GATEWAY_ID=
SEGURIA_GATEWAY_SECRET=
HOME_ASSISTANT_URL=http://homeassistant.local:8123
HOME_ASSISTANT_TOKEN=
MQTT_USERNAME=seguria
MQTT_PASSWORD=
```

Generate the Mosquitto password file on the host:

```bash
docker run --rm -it -v "$PWD/mosquitto:/mosquitto/config" eclipse-mosquitto:2 \
  mosquitto_passwd -c /mosquitto/config/passwords seguria
```

Start the gateway:

```bash
docker compose up -d
```

Validate:

```bash
docker compose logs -f seguria-gateway
```

Expected result:

- Home Assistant states are readable.
- SegurIA receives heartbeat.
- SegurIA receives inventory.
- Devices appear in the admin inventory.
- Client portal does not expose technical provider names.

## Production rule

Never expose Home Assistant directly to the public internet. SegurIA Gateway is the boundary between the local property network and SegurIA Cloud.
