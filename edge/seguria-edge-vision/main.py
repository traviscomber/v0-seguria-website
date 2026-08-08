from __future__ import annotations

import argparse
import json
import logging
import os
import threading
import time
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import cv2
import numpy as np
import requests
import yaml

from sources import CameraSource, build_camera_source

LOG = logging.getLogger("seguria-edge-vision")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def dhash(frame: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (9, 8), interpolation=cv2.INTER_AREA)
    return (resized[:, 1:] > resized[:, :-1]).flatten()


def hamming(a: np.ndarray, b: np.ndarray) -> int:
    return int(np.count_nonzero(a != b))


def blur_score(frame: np.ndarray) -> float:
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def exposure_score(frame: np.ndarray) -> float:
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    mean = float(gray.mean())
    return max(0.0, 1.0 - abs(mean - 128.0) / 128.0)


def frame_quality(frame: np.ndarray) -> float:
    return blur_score(frame) * (0.6 + 0.4 * exposure_score(frame))


@dataclass
class CoreConfig:
    base_url: str
    gateway_id: str
    gateway_secret: str
    request_timeout_seconds: int = 20


class CoreClient:
    def __init__(self, cfg: CoreConfig, jpeg_quality: int):
        self.cfg = cfg
        self.jpeg_quality = jpeg_quality
        self.session = requests.Session()

    def upload_snapshot(self, device_id: str, captured_at: str, frame: np.ndarray) -> dict[str, Any]:
        ok, encoded = cv2.imencode(
            ".jpg",
            frame,
            [int(cv2.IMWRITE_JPEG_QUALITY), int(self.jpeg_quality)],
        )
        if not ok:
            raise RuntimeError("No fue posible codificar JPEG")

        response = self.session.post(
            f"{self.cfg.base_url.rstrip('/')}/api/gateway/cameras/snapshot",
            headers={
                "x-seguria-gateway-id": self.cfg.gateway_id,
                "x-seguria-gateway-secret": self.cfg.gateway_secret,
            },
            data={"deviceId": device_id, "capturedAt": captured_at},
            files={"file": (f"{uuid.uuid4()}.jpg", encoded.tobytes(), "image/jpeg")},
            timeout=self.cfg.request_timeout_seconds,
        )
        response.raise_for_status()
        payload = response.json()
        if not payload.get("success"):
            raise RuntimeError(payload.get("error") or "Snapshot rechazado por Core")
        return payload


class Spool:
    def __init__(self, root: str, client: CoreClient):
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)
        self.client = client
        self.lock = threading.Lock()

    def enqueue(self, device_id: str, captured_at: str, frame: np.ndarray) -> None:
        event_id = str(uuid.uuid4())
        image_path = self.root / f"{event_id}.jpg"
        meta_path = self.root / f"{event_id}.json"
        ok = cv2.imwrite(str(image_path), frame, [int(cv2.IMWRITE_JPEG_QUALITY), self.client.jpeg_quality])
        if not ok:
            raise RuntimeError("No fue posible guardar evento en spool")
        meta_path.write_text(json.dumps({"device_id": device_id, "captured_at": captured_at}), encoding="utf-8")

    def flush_once(self) -> int:
        sent = 0
        with self.lock:
            for meta_path in sorted(self.root.glob("*.json")):
                image_path = meta_path.with_suffix(".jpg")
                if not image_path.exists():
                    meta_path.unlink(missing_ok=True)
                    continue
                try:
                    meta = json.loads(meta_path.read_text(encoding="utf-8"))
                    frame = cv2.imread(str(image_path))
                    if frame is None:
                        raise RuntimeError("Imagen de spool ilegible")
                    self.client.upload_snapshot(meta["device_id"], meta["captured_at"], frame)
                    image_path.unlink(missing_ok=True)
                    meta_path.unlink(missing_ok=True)
                    sent += 1
                except Exception as exc:
                    LOG.warning("Spool pendiente %s: %s", meta_path.name, exc)
        return sent


class CameraWorker:
    def __init__(self, camera: dict[str, Any], edge_cfg: dict[str, Any], client: CoreClient, spool: Spool):
        self.camera = camera
        self.edge_cfg = edge_cfg
        self.client = client
        self.spool = spool
        self.stop_event = threading.Event()
        self.previous_gray: np.ndarray | None = None
        self.last_event_at = 0.0
        self.last_sent_hash: np.ndarray | None = None

    def _motion_score(self, frame: np.ndarray) -> float:
        cfg = self.camera.get("motion", {})
        width = int(cfg.get("resize_width", 640))
        threshold = int(cfg.get("threshold", 24))
        height = max(1, round(frame.shape[0] * width / frame.shape[1]))
        small = cv2.resize(frame, (width, height), interpolation=cv2.INTER_AREA)
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (5, 5), 0)

        if self.previous_gray is None:
            self.previous_gray = gray
            return 0.0

        delta = cv2.absdiff(self.previous_gray, gray)
        self.previous_gray = gray
        changed = delta > threshold
        return float(np.count_nonzero(changed)) / float(changed.size)

    def _capture_burst(self, source: CameraSource) -> list[np.ndarray]:
        cfg = self.camera.get("burst", {})
        count = int(cfg.get("frames", 6))
        interval = max(0.0, float(cfg.get("interval_ms", 250)) / 1000.0)
        frames: list[np.ndarray] = []
        for _ in range(count):
            ok, frame = source.read()
            if ok and frame is not None:
                frames.append(frame.copy())
            if interval:
                time.sleep(interval)
        return frames

    def _best_frame(self, frames: list[np.ndarray]) -> np.ndarray | None:
        if not frames:
            return None
        cfg = self.camera.get("burst", {})
        min_blur = float(cfg.get("min_blur_score", 40.0))
        dedupe_distance = int(cfg.get("duplicate_hamming_distance", 6))

        unique: list[tuple[np.ndarray, np.ndarray, float]] = []
        for frame in frames:
            sharpness = blur_score(frame)
            if sharpness < min_blur:
                continue
            fingerprint = dhash(frame)
            if any(hamming(fingerprint, existing_hash) <= dedupe_distance for _, existing_hash, _ in unique):
                continue
            unique.append((frame, fingerprint, frame_quality(frame)))

        if not unique:
            scored = [(frame, dhash(frame), frame_quality(frame)) for frame in frames]
            return max(scored, key=lambda item: item[2])[0]

        best_frame, fingerprint, _ = max(unique, key=lambda item: item[2])
        if self.last_sent_hash is not None and hamming(fingerprint, self.last_sent_hash) <= dedupe_distance:
            return None
        self.last_sent_hash = fingerprint
        return best_frame

    def run(self) -> None:
        name = self.camera["name"]
        device_id = self.camera["device_id"]
        motion_cfg = self.camera.get("motion", {})
        sample_fps = max(0.2, float(motion_cfg.get("sample_fps", 2.0)))
        sample_interval = 1.0 / sample_fps
        min_changed_ratio = float(motion_cfg.get("min_changed_ratio", 0.012))
        cooldown = float(motion_cfg.get("cooldown_seconds", 12))
        reconnect_delay = float(self.edge_cfg.get("reconnect_delay_seconds", 5))

        try:
            source = build_camera_source(self.camera)
        except Exception as exc:
            LOG.error("%s: configuración de fuente inválida: %s", name, exc)
            return

        while not self.stop_event.is_set():
            if not source.open():
                LOG.warning("%s: fuente no disponible; reintento en %.1fs", name, reconnect_delay)
                source.close()
                self.stop_event.wait(reconnect_delay)
                continue

            LOG.info("%s: fuente conectada", name)
            self.previous_gray = None
            next_sample = 0.0

            while not self.stop_event.is_set():
                ok, frame = source.read()
                if not ok or frame is None:
                    LOG.warning("%s: fuente interrumpida", name)
                    break

                now = time.monotonic()
                if now < next_sample:
                    continue
                next_sample = now + sample_interval

                score = self._motion_score(frame)
                if score < min_changed_ratio or now - self.last_event_at < cooldown:
                    continue

                self.last_event_at = now
                frames = [frame.copy(), *self._capture_burst(source)]
                selected = self._best_frame(frames)
                if selected is None:
                    LOG.info("%s: evento descartado por duplicado/calidad", name)
                    continue

                captured_at = utc_now_iso()
                try:
                    result = self.client.upload_snapshot(device_id, captured_at, selected)
                    LOG.info("%s: foto enviada a Core (%s)", name, result.get("data", {}).get("id", "ok"))
                except Exception as exc:
                    LOG.warning("%s: Core no disponible, guardando localmente: %s", name, exc)
                    self.spool.enqueue(device_id, captured_at, selected)

            source.close()
            self.stop_event.wait(reconnect_delay)

    def stop(self) -> None:
        self.stop_event.set()


def retry_loop(spool: Spool, interval_seconds: float, stop_event: threading.Event) -> None:
    while not stop_event.wait(interval_seconds):
        sent = spool.flush_once()
        if sent:
            LOG.info("Spool: %d eventos sincronizados", sent)


def load_config(path: str) -> dict[str, Any]:
    with open(path, "r", encoding="utf-8") as handle:
        cfg = yaml.safe_load(handle) or {}
    if not cfg.get("cameras"):
        raise ValueError("No hay cámaras configuradas")
    return cfg


def main() -> int:
    parser = argparse.ArgumentParser(description="SegurIA Edge Vision - N3uralia photo-first intelligence layer")
    parser.add_argument("--config", default=os.environ.get("SEGURIA_EDGE_CONFIG", "config.yaml"))
    parser.add_argument("--log-level", default=os.environ.get("SEGURIA_EDGE_LOG_LEVEL", "INFO"))
    args = parser.parse_args()

    logging.basicConfig(
        level=getattr(logging, args.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    cfg = load_config(args.config)
    core_cfg = CoreConfig(**cfg["core"])
    edge_cfg = cfg.get("edge", {})
    client = CoreClient(core_cfg, int(edge_cfg.get("jpeg_quality", 88)))
    spool = Spool(str(edge_cfg.get("spool_dir", "./spool")), client)

    global_stop = threading.Event()
    retry_thread = threading.Thread(
        target=retry_loop,
        args=(spool, float(edge_cfg.get("retry_interval_seconds", 30)), global_stop),
        daemon=True,
    )
    retry_thread.start()

    workers = [
        CameraWorker(camera, edge_cfg, client, spool)
        for camera in cfg["cameras"]
        if camera.get("enabled", True)
    ]
    threads = [threading.Thread(target=worker.run, daemon=True, name=f"camera-{worker.camera['device_id']}") for worker in workers]

    for thread in threads:
        thread.start()

    try:
        while any(thread.is_alive() for thread in threads):
            time.sleep(1)
    except KeyboardInterrupt:
        LOG.info("Deteniendo SegurIA Edge Vision")
    finally:
        global_stop.set()
        for worker in workers:
            worker.stop()
        for thread in threads:
            thread.join(timeout=5)
        retry_thread.join(timeout=2)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
