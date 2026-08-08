#!/usr/bin/env bash
set -Eeuo pipefail

# SegurIA Edge Vision installer for Ubuntu Server 24.04 LTS.
# Usage:
#   chmod +x seguria-edge-install-ubuntu.sh
#   sudo ./seguria-edge-install-ubuntu.sh
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
[[ "${VERSION_ID:-}" == "24.04" ]] || fail "Se requiere Ubuntu Server 24.04 LTS. Detectado: ${PRETTY_NAME:-desconocido}."

log "Actualizando paquetes base"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends \
  ca-certificates curl git ffmpeg \
  python3 python3-pip python3-venv \
  libglib2.0-0t64 libgomp1

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

# Preserve /etc configuration on upgrades. Application files are replaced atomically enough
# for this single-service appliance, then systemd is restarted only after validation.
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
    read -r -p "External device ID de la primera camara (Enter para configurar despues): " DEVICE_ID

    CAMERA_NAME=""
    RTSP_URL=""
    if [[ -n "${DEVICE_ID}" ]]; then
      read -r -p "Nombre de la camara [Camara 01]: " CAMERA_NAME
      CAMERA_NAME="${CAMERA_NAME:-Camara 01}"
      read -r -p "RTSP URL: " RTSP_URL
    fi

    # Write JSON syntax to config.yaml. JSON is valid YAML and safely escapes secrets,
    # camera names and RTSP URLs containing special characters.
    CORE_URL_VALUE="${CORE_URL}" \
    GATEWAY_ID_VALUE="${GATEWAY_ID}" \
    GATEWAY_SECRET_VALUE="${GATEWAY_SECRET}" \
    DEVICE_ID_VALUE="${DEVICE_ID}" \
    CAMERA_NAME_VALUE="${CAMERA_NAME}" \
    RTSP_URL_VALUE="${RTSP_URL}" \
    STATE_DIR_VALUE="${STATE_DIR}" \
    python3 - "${CONFIG_DIR}/config.yaml" <<'PY'
import json
import os
import sys

path = sys.argv[1]
device_id = os.environ.get("DEVICE_ID_VALUE", "").strip()
rtsp_url = os.environ.get("RTSP_URL_VALUE", "").strip()

config = {
    "core": {
        "base_url": os.environ["CORE_URL_VALUE"],
        "gateway_id": os.environ["GATEWAY_ID_VALUE"],
        "gateway_secret": os.environ["GATEWAY_SECRET_VALUE"],
        "request_timeout_seconds": 20,
    },
    "edge": {
        "spool_dir": os.path.join(os.environ["STATE_DIR_VALUE"], "spool"),
        "reconnect_delay_seconds": 5,
        "retry_interval_seconds": 30,
        "jpeg_quality": 88,
    },
    "cameras": [],
}

if device_id and rtsp_url:
    config["cameras"].append({
        "name": os.environ.get("CAMERA_NAME_VALUE") or "Camara 01",
        "device_id": device_id,
        "enabled": True,
        "source": {"type": "rtsp", "url": rtsp_url},
        "motion": {
            "sample_fps": 2.0,
            "resize_width": 640,
            "threshold": 24,
            "min_changed_ratio": 0.012,
            "cooldown_seconds": 12,
        },
        "burst": {
            "frames": 6,
            "interval_ms": 250,
            "duplicate_hamming_distance": 6,
            "min_blur_score": 40.0,
        },
    })

with open(path, "w", encoding="utf-8") as handle:
    json.dump(config, handle, ensure_ascii=False, indent=2)
    handle.write("\n")
PY
  else
    cp "${INSTALL_DIR}/config.example.yaml" "${CONFIG_DIR}/config.yaml"
    sed -i "s#https://seguria.tech#${CORE_URL}#g; s#\./spool#${STATE_DIR}/spool#g" "${CONFIG_DIR}/config.yaml"
    log "Se instalo config.example.yaml. Debes editar ${CONFIG_DIR}/config.yaml antes de iniciar el servicio."
  fi
else
  log "Conservando configuracion existente: ${CONFIG_DIR}/config.yaml"
fi

# The service runs as user 'seguria'. Root owns the file, but the service group can read it.
chown root:"${SERVICE_USER}" "${CONFIG_DIR}/config.yaml"
chmod 0640 "${CONFIG_DIR}/config.yaml"

log "Instalando servicio systemd"
cp "${INSTALL_DIR}/seguria-edge-vision.service" "/etc/systemd/system/${SERVICE_NAME}.service"
systemctl daemon-reload
systemctl enable "${SERVICE_NAME}.service"

log "Validando codigo y configuracion"
"${INSTALL_DIR}/.venv/bin/python" -m py_compile "${INSTALL_DIR}/main.py" "${INSTALL_DIR}/sources.py" || \
  fail "La validacion Python fallo. El servicio no fue iniciado."

CONFIG_READY="$(${INSTALL_DIR}/.venv/bin/python - "${CONFIG_DIR}/config.yaml" <<'PY'
import sys
import yaml

path = sys.argv[1]
try:
    with open(path, "r", encoding="utf-8") as handle:
        cfg = yaml.safe_load(handle) or {}
except Exception as exc:
    print(f"ERROR:{exc}")
    raise SystemExit(2)

core = cfg.get("core") or {}
cameras = cfg.get("cameras") or []
placeholder = core.get("gateway_id") == "GATEWAY_PUBLIC_ID" or core.get("gateway_secret") == "CHANGE_ME"
valid_camera = any(
    isinstance(camera, dict)
    and camera.get("device_id")
    and isinstance(camera.get("source"), dict)
    and camera["source"].get("type")
    for camera in cameras
)
print("yes" if not placeholder and core.get("gateway_id") and core.get("gateway_secret") and valid_camera else "no")
PY
)" || fail "La configuracion no es YAML/JSON valido."

if [[ "${CONFIG_READY}" == "yes" ]]; then
  log "Arrancando SegurIA Edge"
  systemctl restart "${SERVICE_NAME}.service"
  sleep 2
  if ! systemctl is-active --quiet "${SERVICE_NAME}.service"; then
    systemctl --no-pager --full status "${SERVICE_NAME}.service" || true
    fail "El servicio no quedo activo. Revisa: journalctl -u ${SERVICE_NAME} -n 100 --no-pager"
  fi
  systemctl --no-pager --full status "${SERVICE_NAME}.service" || true
else
  systemctl stop "${SERVICE_NAME}.service" 2>/dev/null || true
  log "Instalacion completada. El servicio NO se inicia hasta configurar gateway y al menos una camara real."
  printf '\nEdita:\n  sudo nano %s/config.yaml\n\nLuego ejecuta:\n  sudo systemctl restart %s\n' "${CONFIG_DIR}" "${SERVICE_NAME}"
fi

cat <<EOF2

============================================================
SegurIA Edge Vision instalado
============================================================
Codigo:         ${INSTALL_DIR}
Configuracion:  ${CONFIG_DIR}/config.yaml
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
EOF2
