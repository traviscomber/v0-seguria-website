param(
  [Parameter(Mandatory = $true)]
  [string] $SiteSlug
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $root ".env"
$exampleFile = Join-Path $root ".env.example"
$dataDir = Join-Path $root "data"
$mosquittoDir = Join-Path $root "mosquitto"
$passwordFile = Join-Path $mosquittoDir "passwords"

New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
New-Item -ItemType Directory -Force -Path $mosquittoDir | Out-Null

if (-not (Test-Path $envFile)) {
  Copy-Item $exampleFile $envFile
  Write-Host "Created $envFile. Fill SEGURIA_GATEWAY_ID, SEGURIA_GATEWAY_SECRET and HOME_ASSISTANT_TOKEN."
}

if (-not (Test-Path $passwordFile)) {
  Set-Content -Path $passwordFile -Value "seguria:replace-with-mosquitto-passwd-hash"
  Write-Host "Created $passwordFile. Replace it with a real mosquitto_passwd hash before production."
}

Write-Host "SegurIA gateway install files prepared for $SiteSlug."
Write-Host "Next: edit .env, generate mosquitto password, then run docker compose up -d."
