# SegurIA pilot installation secrets

Copy this file to:

```text
docs/integrations/pilot-installation-secrets.local.md
```

The `.local.md` copy is ignored by Git. Do not commit the filled version.

## Admin

- Admin URL: `https://www.seguria.tech/login`
- Admin email:
- Admin password:

## Campo Lechero Santa Elena

- Customer URL: `https://www.seguria.tech/app`
- Customer email: `santaelena@seguria.tech`
- Customer password:
- Install slug: `santa-elena`
- Host OS:
- Host IP:
- Host user:
- Host access method:
- SegurIA Gateway name: `santa-elena-main`
- `SEGURIA_GATEWAY_ID`:
- `SEGURIA_GATEWAY_SECRET`:
- `HOME_ASSISTANT_URL`: `http://127.0.0.1:8123`
- `HOME_ASSISTANT_TOKEN`:
- `MQTT_USERNAME`: `seguria`
- `MQTT_PASSWORD`:
- `CLOUDFLARE_TUNNEL_TOKEN`:
- Tunnel hostname:
- Tuya account:
- Tuya password:
- ONVIF camera credentials:

### Ubuntu command

```bash
curl -fsSL https://www.seguria.tech/install/install.sh | sh -s -- \
  --site santa-elena \
  --gateway-id "<SEGURIA_GATEWAY_ID>" \
  --gateway-secret "<SEGURIA_GATEWAY_SECRET>"
```

### Windows command

```powershell
irm https://www.seguria.tech/install/install.ps1 -OutFile install.ps1
.\install.ps1 -Site santa-elena -GatewayId "<SEGURIA_GATEWAY_ID>" -GatewaySecret "<SEGURIA_GATEWAY_SECRET>"
```

## Hotel Huilo Huilo

- Customer URL: `https://www.seguria.tech/app`
- Customer email: `huilohuilo@seguria.tech`
- Customer password:
- Install slug: `huilo-huilo`
- Host OS:
- Host IP:
- Host user:
- Host access method:
- SegurIA Gateway name: `huilo-huilo-main`
- `SEGURIA_GATEWAY_ID`:
- `SEGURIA_GATEWAY_SECRET`:
- `HOME_ASSISTANT_URL`: `http://127.0.0.1:8123`
- `HOME_ASSISTANT_TOKEN`:
- `MQTT_USERNAME`: `seguria`
- `MQTT_PASSWORD`:
- `CLOUDFLARE_TUNNEL_TOKEN`:
- Tunnel hostname:
- Tuya account:
- Tuya password:
- ONVIF camera credentials:

### Ubuntu command

```bash
curl -fsSL https://www.seguria.tech/install/install.sh | sh -s -- \
  --site huilo-huilo \
  --gateway-id "<SEGURIA_GATEWAY_ID>" \
  --gateway-secret "<SEGURIA_GATEWAY_SECRET>"
```

### Windows command

```powershell
irm https://www.seguria.tech/install/install.ps1 -OutFile install.ps1
.\install.ps1 -Site huilo-huilo -GatewayId "<SEGURIA_GATEWAY_ID>" -GatewaySecret "<SEGURIA_GATEWAY_SECRET>"
```
