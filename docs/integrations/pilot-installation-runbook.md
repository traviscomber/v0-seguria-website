# SegurIA pilot installation runbook

Internal procedure for installing the first two customer properties.

Do not commit real passwords, gateway secrets, Cloudflare tunnel tokens, Home Assistant tokens or vendor credentials. Store those only in the local `.local.md` operator handoff or in the approved password manager.

## Sites

| Site | Customer login | Default install slug | Host target | Portal |
| --- | --- | --- | --- | --- |
| Campo Lechero Santa Elena | `santaelena@seguria.tech` | `santa-elena` | Ubuntu or Windows host on site | `https://www.seguria.tech/app` |
| Hotel Huilo Huilo | `huilohuilo@seguria.tech` | `huilo-huilo` | Ubuntu or Windows host on site | `https://www.seguria.tech/app` |

Client passwords are operational secrets. Do not place them in this repository.

## Standard architecture

Local site host:

- Home Assistant container
- Mosquitto MQTT broker
- SegurIA Gateway
- optional Cloudflare reverse tunnel

Cloud:

- SegurIA portal and admin: `https://www.seguria.tech`
- Gateway API: `https://www.seguria.tech/api/gateway/*`
- installer files: `https://www.seguria.tech/install/*`

Vercel is the SegurIA API and control plane. It is not the persistent reverse-tunnel server. Remote access uses `cloudflared` from the local host to Cloudflare.

## Pre-install checklist

For each site:

1. Confirm local host has Ubuntu Server 22.04+ or Windows with Docker.
2. Confirm outbound internet access to:
   - `www.seguria.tech`
   - `seguria.tech`
   - `ghcr.io`
   - `github.com`
   - `registry-1.docker.io`
   - Cloudflare endpoints when using tunnel.
3. Confirm the customer account can log in to the portal.
4. Create or confirm the property in SegurIA Admin.
5. Create the Gateway from SegurIA Admin > Integraciones.
6. Copy the one-time gateway secret into the local private handoff file only.
7. If remote support is needed, create a Cloudflare Tunnel token and store it in the local private handoff file only.

## Admin flow

1. Log in as admin at `https://www.seguria.tech/login`.
2. Open `https://www.seguria.tech/admin/integraciones`.
3. Select the property.
4. Create Gateway:
   - Santa Elena gateway name: `santa-elena-main`
   - Huilo Huilo gateway name: `huilo-huilo-main`
5. Copy:
   - `SEGURIA_GATEWAY_ID`
   - `SEGURIA_GATEWAY_SECRET`
6. Store them outside Git.

## Ubuntu install

Santa Elena:

```bash
curl -fsSL https://www.seguria.tech/install/install.sh | sh -s -- \
  --site santa-elena \
  --gateway-id "<SEGURIA_GATEWAY_ID>" \
  --gateway-secret "<SEGURIA_GATEWAY_SECRET>"
```

Huilo Huilo:

```bash
curl -fsSL https://www.seguria.tech/install/install.sh | sh -s -- \
  --site huilo-huilo \
  --gateway-id "<SEGURIA_GATEWAY_ID>" \
  --gateway-secret "<SEGURIA_GATEWAY_SECRET>"
```

With reverse tunnel:

```bash
curl -fsSL https://www.seguria.tech/install/install.sh | sh -s -- \
  --site santa-elena \
  --gateway-id "<SEGURIA_GATEWAY_ID>" \
  --gateway-secret "<SEGURIA_GATEWAY_SECRET>" \
  --cloudflare-tunnel-token "<CLOUDFLARE_TUNNEL_TOKEN>"
```

## Windows install

Santa Elena:

```powershell
irm https://www.seguria.tech/install/install.ps1 -OutFile install.ps1
.\install.ps1 -Site santa-elena -GatewayId "<SEGURIA_GATEWAY_ID>" -GatewaySecret "<SEGURIA_GATEWAY_SECRET>"
```

Huilo Huilo:

```powershell
irm https://www.seguria.tech/install/install.ps1 -OutFile install.ps1
.\install.ps1 -Site huilo-huilo -GatewayId "<SEGURIA_GATEWAY_ID>" -GatewaySecret "<SEGURIA_GATEWAY_SECRET>"
```

With reverse tunnel:

```powershell
irm https://www.seguria.tech/install/install.ps1 -OutFile install.ps1
.\install.ps1 `
  -Site santa-elena `
  -GatewayId "<SEGURIA_GATEWAY_ID>" `
  -GatewaySecret "<SEGURIA_GATEWAY_SECRET>" `
  -CloudflareTunnelToken "<CLOUDFLARE_TUNNEL_TOKEN>"
```

## Home Assistant setup after install

1. Open local Home Assistant:
   - Ubuntu default: `http://<host-ip>:8123`
   - Windows default: `http://localhost:8123`
2. Finish Home Assistant onboarding with the operations admin account.
3. Install official Tuya integration when Tuya/Smart Life devices exist.
4. Install ONVIF for compatible cameras.
5. Install MQTT and use the credentials generated in the local `.env`.
6. Create a long-lived access token named `SegurIA Gateway`.
7. Add the token to local `.env`:

```text
HOME_ASSISTANT_TOKEN=<HOME_ASSISTANT_LONG_LIVED_TOKEN>
```

8. Restart the Gateway:

Ubuntu:

```bash
cd /opt/seguria/<site>
docker compose up -d --build
docker compose restart seguria-gateway
```

Windows:

```powershell
cd C:\SegurIA\<site>
docker compose up -d --build
docker compose restart seguria-gateway
```

## Validation

Local:

```bash
docker compose ps
docker compose logs --tail=100 seguria-gateway
```

SegurIA Admin:

1. Open `https://www.seguria.tech/admin/integraciones`.
2. Confirm site appears in `Estado por sitio`.
3. Confirm `Gateway` is active.
4. Confirm `Home Assistant` is active after token setup.
5. Confirm inventory appears in `https://www.seguria.tech/admin/dispositivos`.
6. Confirm events start appearing after sensors/cameras are connected.

Client portal:

1. Log in with the customer account.
2. Confirm only that customer's site is visible.
3. Confirm no technical provider names are shown to the customer.
4. Confirm cameras, sensors, incidents and evidence are grouped by site.

## Rollback

Ubuntu:

```bash
cd /opt/seguria/<site>
docker compose down
```

Windows:

```powershell
cd C:\SegurIA\<site>
docker compose down
```

If a gateway secret is exposed:

1. Revoke the Gateway in SegurIA Admin.
2. Provision a new Gateway.
3. Re-run the installer with the new ID and secret.

## Local private handoff

Use `docs/integrations/pilot-installation-secrets.local.md` as the local operator copy. It is ignored by Git.
