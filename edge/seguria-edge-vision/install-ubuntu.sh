#!/usr/bin/env bash
set -Eeuo pipefail

# SegurIA Edge Vision installer for Ubuntu Server 24.04 LTS.
# Usage:
#   chmod +x install-ubuntu.sh
#   sudo ./install-ubuntu.sh
# Optional environment overrides:
#   SEGURIA_REPO=https://github.com/traviscomber/v0-seguria-website.git
#   SEGURIA_REF=feature/huilo-huilo-wildlife-preservation
#   SEGURIA_CORE_URL=https://seguria.tech

REPO_URL="${SEGURIA_REPO:-https://github.com/traviscomber/v0-seguria-website.git}"
REPO_REF="${SEGURIA_REF:-feature/huilo-huilo-wildlife-preservation}"
CORE_URL="${SEGURIA_CORE_URL:-https://seguria.tech}"
INSTALL_DIR="/opt/seguria-edge-vision"
CONFIG_DIR="/etc/seguria-edge-vision"
STATE_DIR="/var/lib/seguria-edge-vision"
SERVICE_NAME="seguria-edge-vision"
SERVICE_USER="seguria"
TMP_DIR=""

log() { printf '\n[SegurIA] %s\n' "$*"; }
fail() { printf '\n[SegurIA] ERROR: %s\n' "$*" >&2; exit 1; }
cleanup() { [[ -n "${TMP_DIR}" && -d "${TMP_DIR}" ]] && rm -rf "${TMP_DIR}"; }
trap cleanup EXIT

[[ "${EUID}" -eq 0 ]] || fail "Ejecuta este instalador con sudo."
[[ -r /etc/os-release ]] || fail "No se pudo identificar el sistema operativo."
# shellcheck disable=SC1091
source /etc/os-release
[[ "${ID:-}" == "ubuntu" ]] || fail "Este instalador esta preparado para Ubuntu Server."

log "Actualizando paquetes base"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends \
  ca-certificates curl git ffmpeg \
  python3 python3-pip python3-venv \
  libglib2.0-0 libgomp1

if ! id "${SERVICE_USER}" >/dev/null 2>&1; then
  log "Creando usuario de servicio ${SERVICE_USER}"
  useradd --system --home-dir "${STATE_DIR}" --shell /usr/sbin/nologin "${SERVICE_USER}"
fi

log "Preparando directorios"
install -d -m 0755 "${INSTALL_DIR}" "${CONFIG_DIR}"
install -d -o "${SERVICE_USER}" -g "${SERVICE_USER}" -m 0750 "${STATE_DIR}" "${STATE_DIR}/spool"

TMP_DIR="$(mktemp -d)"
log "Descargando SegurIA Edge desde ${REPO_REF}"
git clone --depth 1 --branch "${REPO_REF}" "${REPO_URL}" "${TMP_DIR}/repo"
[[ -f "${TMP_DIR}/repo/edge/seguria-edge-vision/main.py" ]] || fail "No se encontro SegurIA Edge Vision en el repositorio."

# Preserve config on upgrades.
rm -rf "${INSTALL_DIR:?}"/*
cp -a "${TMP_DIR}/repo/edge/seguria-edge-vision/." "${INSTALL_DIR}/"
chown -R root:root "${INSTALL_DIR}"
chmod 0755 "${INSTALL_DIR}/main.py" 2>/dev/null || true

log "Creando entorno Python"
python3 -m venv "${INSTALL_DIR}/.venv"
"${INSTALL_DIR}/.venv/bin/pip" install --upgrade pip wheel
"${INSTALL_DIR}/.venv/bin/pip" install -r "${INSTALL_DIR}/requirements.txt"

if [[ ! -f "${CONFIG_DIR}/config.yaml" ]]; then
  log "Configuracion inicial"
  read -r -p "Gateway public ID (Enter para configurar despues): " GATEWAY_ID
  if [[ -n "${GATEWAY_ID}" ]]; then
    read -r -s -p "Gateway secret: " GATEWAY_SECRET
    printf '\n'
    read -r -p "External device ID de la primera camara (Enter para omitir): " DEVICE_ID
    if [[ -n "${DEVICE_ID}" ]]; then
      read -r -p "Nombre de la camara [Camara 01]: " CAMERA_NAME
      CAMERA_NAME="${CAMERA_NAME:-Camara 01}"
      read -r -p "RTSP URL: " RTSP_URL
    else
      CAMERA_NAME="Camara 01"
      RTSP_URL=""
    fi

    umask 077
    cat > "${CONFIG_DIR}/config.yaml" <<EOF
core:
  base_url: "${CORE_URL}"
  gateway_id: "${GATEWAY_ID}"
  gateway_secret: "${GATEWAY_SECRET}"
  request_timeout_seconds: 20

edge:
  spool_dir: "${STATE_DIR}/spool"
  reconnect_delay_seconds: 5
  retry_interval_seconds: 30
  jpeg_quality: 88

cameras:
EOF
    if [[ -n "${DEVICE_ID}" && -n "${RTSP_URL}" ]]; then
      cat >> "${CONFIG_DIR}/config.yaml" <<EOF
  - name: "${CAMERA_NAME}"
    device_id: "${DEVICE_ID}"
    enabled: true
    source:
      type: "rtsp"
      url: "${RTSP_URL}"
    motion:
      sample_fps: 2.0
      resize_width: 640
      threshold: 24
      min_changed_ratio: 0.012
      cooldown_seconds: 12
    burst:
      frames: 6
      interval_ms: 250
      duplicate_hamming_distance: 6
      min_blur_score: 40.0
EOF
    else
      printf '  []\n' >> "${CONFIG_DIR}/config.yaml"
    fi
    chmod 0600 "${CONFIG_DIR}/config.yaml"
  else
    cp "${INSTALL_DIR}/config.example.yaml" "${CONFIG_DIR}/config.yaml"
    sed -i "s#https://seguria.tech#${CORE_URL}#g; s#\./spool#${STATE_DIR}/spool#g" "${CONFIG_DIR}/config.yaml"
    chmod 0600 "${CONFIG_DIR}/config.yaml"
    log "Se instalo config.example.yaml. Debes editar ${CONFIG_DIR}/config.yaml antes de iniciar el servicio."
  fi
else
  log "Conservando configuracion existente: ${CONFIG_DIR}/config.yaml"
fi

log "Instalando servicio systemd"
cp "${INSTALL_DIR}/seguria-edge-vision.service" "/etc/systemd/system/${SERVICE_NAME}.service"
systemctl daemon-reload
systemctl enable "${SERVICE_NAME}.service"

if grep -q 'GATEWAY_PUBLIC_ID\|CHANGE_ME' "${CONFIG_DIR}/config.yaml"; then
  log "Instalacion completada, pero el servicio NO se inicia porque faltan credenciales reales."
  printf '\nEdita:\n  sudo nano %s/config.yaml\n\nLuego ejecuta:\n  sudo systemctl start %s\n' "${CONFIG_DIR}" "${SERVICE_NAME}"
else
  log "Validando configuracion y arrancando SegurIA Edge"
  if "${INSTALL_DIR}/.venv/bin/python" -m py_compile "${INSTALL_DIR}/main.py" "${INSTALL_DIR}/sources.py"; then
    systemctl restart "${SERVICE_NAME}.service"
    sleep 2
    systemctl --no-pager --full status "${SERVICE_NAME}.service" || true
  else
    fail "La validacion Python fallo. El servicio no fue iniciado."
  fi
fi

cat <<EOF

============================================================
SegurIA Edge Vision instalado
============================================================
Codigo:         ${INSTALL_DIR}
Configuracion: ${CONFIG_DIR}/config.yaml
Datos/spool:    ${STATE_DIR}
Servicio:       ${SERVICE_NAME}.service
Core:           ${CORE_URL}

Comandos utiles:
  sudo systemctl status ${SERVICE_NAME}
  sudo journalctl -u ${SERVICE_NAME} -f
  sudo systemctl restart ${SERVICE_NAME}
  sudo nano ${CONFIG_DIR}/config.yaml

Para actualizar posteriormente, vuelve a ejecutar este instalador.
La configuracion existente se conserva.
============================================================
EOF
