from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, status

from .config import settings

app = FastAPI(
    title=settings.service_name,
    version="0.1.0",
    description="Edge-first computer vision service for SegurIA.",
)


def utc_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def model_is_ready() -> bool:
    return Path(settings.model_path).is_file()


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {
        "ok": True,
        "status": "alive",
        "service": settings.service_name,
        "environment": settings.environment,
        "device": settings.device,
        "model_version": settings.model_version,
        "timestamp": utc_timestamp(),
    }


@app.get("/ready")
def readiness() -> dict[str, str | bool]:
    ready = model_is_ready()
    payload: dict[str, str | bool] = {
        "ok": ready,
        "status": "ready" if ready else "not_ready",
        "service": settings.service_name,
        "model_version": settings.model_version,
        "model_path": settings.model_path,
        "timestamp": utc_timestamp(),
    }

    if not ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=payload,
        )

    return payload
