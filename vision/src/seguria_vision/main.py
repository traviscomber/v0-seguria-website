from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, status

from .config import settings
from .runtime import ModelLoadError, OnnxModelRuntime

app = FastAPI(
    title=settings.service_name,
    version="0.1.0",
    description="Edge-first computer vision service for SegurIA.",
)

model_runtime = OnnxModelRuntime(settings.model_path)


def utc_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def readiness_payload() -> dict[str, object]:
    metadata = model_runtime.metadata
    return {
        "ok": model_runtime.is_ready,
        "status": "ready" if model_runtime.is_ready else "not_ready",
        "service": settings.service_name,
        "model_version": settings.model_version,
        "model_path": settings.model_path,
        "providers": list(metadata.providers) if metadata else [],
        "inputs": list(metadata.input_names) if metadata else [],
        "outputs": list(metadata.output_names) if metadata else [],
        "error": model_runtime.error,
        "timestamp": utc_timestamp(),
    }


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
def readiness() -> dict[str, object]:
    model_runtime.model_path = settings.model_path

    try:
        model_runtime.load()
    except ModelLoadError:
        payload = readiness_payload()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=payload,
        )

    return readiness_payload()
