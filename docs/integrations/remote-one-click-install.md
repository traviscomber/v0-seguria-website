# Remote one-click installation

SegurIA serves the remote installer from:

- `https://www.seguria.tech/install/install.sh`
- `https://www.seguria.tech/install/install.ps1`
- `https://www.seguria.tech/install/docker-compose.yml`

The installer deploys:

- Home Assistant container
- Mosquitto MQTT broker
- SegurIA Gateway

## Before running

1. Open SegurIA Admin.
2. Go to Integraciones.
3. Select the customer property.
4. Provision a Gateway.
5. Copy the one-time `SEGURIA_GATEWAY_ID` and `SEGURIA_GATEWAY_SECRET`.

## Linux host

```bash
curl -fsSL https://www.seguria.tech/install/install.sh | sh -s -- \
  --site santa-elena \
  --gateway-id "<SEGURIA_GATEWAY_ID>" \
  --gateway-secret "<SEGURIA_GATEWAY_SECRET>" \
  --home-assistant-url "http://127.0.0.1:8123"
```

For Huilo Huilo:

```bash
curl -fsSL https://www.seguria.tech/install/install.sh | sh -s -- \
  --site huilo-huilo \
  --gateway-id "<SEGURIA_GATEWAY_ID>" \
  --gateway-secret "<SEGURIA_GATEWAY_SECRET>" \
  --home-assistant-url "http://127.0.0.1:8123"
```

## Windows host

```powershell
irm https://www.seguria.tech/install/install.ps1 -OutFile install.ps1
.\install.ps1 `
  -Site santa-elena `
  -GatewayId "<SEGURIA_GATEWAY_ID>" `
  -GatewaySecret "<SEGURIA_GATEWAY_SECRET>" `
  -HomeAssistantUrl "http://127.0.0.1:8123"
```

## After first boot

1. Open `http://<host>:8123`.
2. Finish Home Assistant onboarding.
3. Install official Tuya.
4. Install ONVIF for compatible cameras.
5. Add MQTT using the generated credentials in `/opt/seguria/<site>/.env`.
6. Create a long-lived Home Assistant token for SegurIA Gateway.
7. Add `HOME_ASSISTANT_TOKEN` to `.env`.
8. Restart:

```bash
cd /opt/seguria/<site>
docker compose restart seguria-gateway
```

## Validate

```bash
cd /opt/seguria/<site>
docker compose ps
docker compose logs -f seguria-gateway
```

Expected:

- `seguria-homeassistant` running
- `seguria-mqtt` running
- `seguria-gateway` running
- Gateway online in SegurIA Admin
- Inventory appears after Home Assistant token is added

## Security rules

- Do not expose Home Assistant directly to the public internet.
- Do not paste gateway secrets in support tickets or public chat.
- Rotate the Gateway if the one-time secret was exposed.
- The customer portal must only show SegurIA.
