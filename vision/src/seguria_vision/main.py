from datetime import datetime, timezone

from fastapi import FastAPI

from .config import settings

app = FastAPI(
    title=settings.service_name,
    version="0.1.0",
    description="Edge-first computer vision service for SegurIA.",
)


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {
        "ok": True,
        "service": settings.service_name,
        "environment": settings.environment,
        "device": settings.device,
        "model_version": settings.model_version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
