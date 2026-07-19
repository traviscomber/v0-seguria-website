param(
  [string] $Site = "seguria-site",
  [Parameter(Mandatory = $true)]
  [string] $GatewayId,
  [Parameter(Mandatory = $true)]
  [string] $GatewaySecret,
  [string] $HomeAssistantUrl = "http://127.0.0.1:8123",
  [string] $HomeAssistantToken = "",
  [string] $CloudflareTunnelToken = "",
  [string] $BaseUrl = "https://www.seguria.tech",
  [string] $InstallRoot = "C:\SegurIA"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker is required. Install Docker Desktop or Docker Engine first."
}

docker compose version | Out-Null

$siteDir = Join-Path $InstallRoot $Site
$mosquittoDir = Join-Path $siteDir "mosquitto"
New-Item -ItemType Directory -Force -Path $siteDir, $mosquittoDir, (Join-Path $siteDir "mosquitto-data"), (Join-Path $siteDir "mosquitto-log"), (Join-Path $siteDir "homeassistant"), (Join-Path $siteDir "gateway-data") | Out-Null

Invoke-WebRequest "$BaseUrl/install/docker-compose.yml" -OutFile (Join-Path $siteDir "docker-compose.yml")
Invoke-WebRequest "$BaseUrl/install/mosquitto.conf" -OutFile (Join-Path $mosquittoDir "mosquitto.conf")
Invoke-WebRequest "$BaseUrl/install/env.template" -OutFile (Join-Path $siteDir ".env")
if ($CloudflareTunnelToken) {
  Invoke-WebRequest "$BaseUrl/install/docker-compose.tunnel.yml" -OutFile (Join-Path $siteDir "docker-compose.tunnel.yml")
}

$mqttPassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$envPath = Join-Path $siteDir ".env"
$envText = Get-Content $envPath -Raw
$envText = $envText.Replace("__SEGURIA_GATEWAY_ID__", $GatewayId)
$envText = $envText.Replace("__SEGURIA_GATEWAY_SECRET__", $GatewaySecret)
$envText = $envText.Replace("__HOME_ASSISTANT_URL__", $HomeAssistantUrl)
$envText = $envText.Replace("__HOME_ASSISTANT_TOKEN__", $HomeAssistantToken)
$envText = $envText.Replace("__MQTT_PASSWORD__", $mqttPassword)
$envText = $envText.Replace("__CLOUDFLARE_TUNNEL_TOKEN__", $CloudflareTunnelToken)
Set-Content -Path $envPath -Value $envText

docker run --rm -v "${mosquittoDir}:/mosquitto/config" eclipse-mosquitto:2 mosquitto_passwd -b -c /mosquitto/config/passwords seguria $mqttPassword

Push-Location $siteDir
$composeFiles = @("-f", "docker-compose.yml")
if (Test-Path (Join-Path $siteDir "docker-compose.tunnel.yml")) {
  $composeFiles += @("-f", "docker-compose.tunnel.yml")
}
docker compose @composeFiles pull homeassistant mqtt
docker compose @composeFiles pull seguria-gateway
if (Test-Path (Join-Path $siteDir "docker-compose.tunnel.yml")) {
  docker compose @composeFiles pull cloudflared
}
docker compose @composeFiles up -d --build
docker compose @composeFiles ps
Pop-Location

Write-Host "SegurIA remote install complete."
Write-Host "Site: $Site"
Write-Host "Path: $siteDir"
