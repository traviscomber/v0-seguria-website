from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

import cv2
import numpy as np


class CameraSource(ABC):
    """N3uralia-owned abstraction over third-party camera transports."""

    @abstractmethod
    def open(self) -> bool:
        raise NotImplementedError

    @abstractmethod
    def read(self) -> tuple[bool, np.ndarray | None]:
        raise NotImplementedError

    @abstractmethod
    def close(self) -> None:
        raise NotImplementedError


class RtspCameraSource(CameraSource):
    def __init__(self, url: str):
        self.url = url
        self.capture: cv2.VideoCapture | None = None

    def open(self) -> bool:
        self.close()
        self.capture = cv2.VideoCapture(self.url, cv2.CAP_FFMPEG)
        return bool(self.capture.isOpened())

    def read(self) -> tuple[bool, np.ndarray | None]:
        if self.capture is None:
            return False, None
        ok, frame = self.capture.read()
        return bool(ok), frame if ok else None

    def close(self) -> None:
        if self.capture is not None:
            self.capture.release()
            self.capture = None


def build_camera_source(camera: dict[str, Any]) -> CameraSource:
    source = camera.get("source") or {}
    source_type = str(source.get("type") or "rtsp").lower()

    if source_type == "rtsp":
        url = str(source.get("url") or camera.get("rtsp_url") or "").strip()
        if not url:
            raise ValueError(f"La cámara {camera.get('name', camera.get('device_id', 'sin nombre'))} no tiene URL RTSP")
        return RtspCameraSource(url)

    raise ValueError(
        f"Fuente de cámara no soportada: {source_type}. "
        "Los adaptadores de Home Assistant, Frigate y ONVIF se incorporan sin cambiar el pipeline N3uralia."
    )
