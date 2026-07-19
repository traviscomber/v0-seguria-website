SegurIA remote installer

Linux:
curl -fsSL https://www.seguria.tech/install/install.sh | sh -s -- --site santa-elena --gateway-id <id> --gateway-secret <secret>

Windows:
irm https://www.seguria.tech/install/install.ps1 -OutFile install.ps1
.\install.ps1 -Site santa-elena -GatewayId <id> -GatewaySecret <secret>

Create the gateway first in SegurIA Admin > Integraciones.
The gateway secret is shown once. Do not save it in tickets, chat or email.
