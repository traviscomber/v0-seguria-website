#!/usr/bin/env sh
set -eu

SITE="seguria-site"
GATEWAY_ID=""
GATEWAY_SECRET=""
HA_URL="http://127.0.0.1:8123"
HA_TOKEN=""
CLOUDFLARE_TUNNEL_TOKEN=""
BASE_URL="https://www.seguria.tech"
INSTALL_ROOT="/opt/seguria"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --site) SITE="$2"; shift 2 ;;
    --gateway-id) GATEWAY_ID="$2"; shift 2 ;;
    --gateway-secret) GATEWAY_SECRET="$2"; shift 2 ;;
    --home-assistant-url) HA_URL="$2"; shift 2 ;;
    --home-assistant-token) HA_TOKEN="$2"; shift 2 ;;
    --cloudflare-tunnel-token) CLOUDFLARE_TUNNEL_TOKEN="$2"; shift 2 ;;
    --base-url) BASE_URL="$2"; shift 2 ;;
    --install-root) INSTALL_ROOT="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 2 ;;
  esac
done

if [ -z "$GATEWAY_ID" ] || [ -z "$GATEWAY_SECRET" ]; then
  echo "Missing --gateway-id or --gateway-secret."
  echo "Create the gateway in SegurIA admin, then run this installer with the one-time secret."
  exit 2
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker first, then rerun this command."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "Docker Compose is required. Install the Docker Compose plugin first."
  exit 1
fi

SITE_DIR="$INSTALL_ROOT/$SITE"
mkdir -p "$SITE_DIR/mosquitto" "$SITE_DIR/mosquitto-data" "$SITE_DIR/mosquitto-log" "$SITE_DIR/homeassistant" "$SITE_DIR/gateway-data"

fetch() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$1" -o "$2"
  elif command -v wget >/dev/null 2>&1; then
    wget -q "$1" -O "$2"
  else
    echo "curl or wget is required."
    exit 1
  fi
}

fetch "$BASE_URL/install/docker-compose.yml" "$SITE_DIR/docker-compose.yml"
fetch "$BASE_URL/install/mosquitto.conf" "$SITE_DIR/mosquitto/mosquitto.conf"
fetch "$BASE_URL/install/env.template" "$SITE_DIR/.env"
if [ -n "$CLOUDFLARE_TUNNEL_TOKEN" ]; then
  fetch "$BASE_URL/install/docker-compose.tunnel.yml" "$SITE_DIR/docker-compose.tunnel.yml"
fi

MQTT_PASSWORD="$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 32 || true)"
if [ -z "$MQTT_PASSWORD" ]; then
  MQTT_PASSWORD="change-me-$(date +%s)"
fi

sed -i "s|__SEGURIA_GATEWAY_ID__|$GATEWAY_ID|g" "$SITE_DIR/.env"
sed -i "s|__SEGURIA_GATEWAY_SECRET__|$GATEWAY_SECRET|g" "$SITE_DIR/.env"
sed -i "s|__HOME_ASSISTANT_URL__|$HA_URL|g" "$SITE_DIR/.env"
sed -i "s|__HOME_ASSISTANT_TOKEN__|$HA_TOKEN|g" "$SITE_DIR/.env"
sed -i "s|__MQTT_PASSWORD__|$MQTT_PASSWORD|g" "$SITE_DIR/.env"
sed -i "s|__CLOUDFLARE_TUNNEL_TOKEN__|$CLOUDFLARE_TUNNEL_TOKEN|g" "$SITE_DIR/.env"
chmod 600 "$SITE_DIR/.env"

docker run --rm -v "$SITE_DIR/mosquitto:/mosquitto/config" eclipse-mosquitto:2 \
  mosquitto_passwd -b -c /mosquitto/config/passwords seguria "$MQTT_PASSWORD"

cd "$SITE_DIR"
COMPOSE_FILES="-f docker-compose.yml"
if [ -f "$SITE_DIR/docker-compose.tunnel.yml" ]; then
  COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.tunnel.yml"
fi

$COMPOSE $COMPOSE_FILES pull homeassistant mqtt || true
$COMPOSE $COMPOSE_FILES pull seguria-gateway || true
$COMPOSE $COMPOSE_FILES pull cloudflared || true
$COMPOSE $COMPOSE_FILES up -d --build

echo "SegurIA remote install complete."
echo "Site: $SITE"
echo "Path: $SITE_DIR"
$COMPOSE $COMPOSE_FILES ps
