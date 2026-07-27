from datetime import datetime, timezone

from fastapi import Body, FastAPI, Header, HTTPException, status

from .config import settings
from .inference import InvalidImageError, UnsupportedModelOutputError, infer_image
from .runtime import ModelLoadError, OnnxModelRuntime

app = FastAPI(
    title=settings.service_name,
    version="0.2.0",
    description="Edge-first computer vision service for SegurIA Wildlife Intelligence.",
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
        "input_shapes": [list(shape) for shape in metadata.input_shapes] if metadata else [],
        "output_shapes": [list(shape) for shape in metadata.output_shapes] if metadata else [],
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


@app.post("/infer")
def infer(
    image: bytes = Body(..., media_type="application/octet-stream"),
    content_type: str = Header(..., alias="X-Image-Content-Type"),
) -> dict[str, object]:
    model_runtime.model_path = settings.model_path
    try:
        detections = infer_image(
            runtime=model_runtime,
            payload=image,
            content_type=content_type.lower().strip(),
            model_version=settings.model_version,
            confidence_threshold=settings.confidence_threshold,
        )
    except InvalidImageError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "invalid_image", "message": str(exc)},
        ) from exc
    except ModelLoadError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "model_not_ready", "message": str(exc)},
        ) from exc
    except UnsupportedModelOutputError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "unsupported_model_output", "message": str(exc)},
        ) from exc

    return {
        "ok": True,
        "model_version": settings.model_version,
        "detections_count": len(detections),
        "detections": [detection.model_dump(mode="json") for detection in detections],
        "timestamp": utc_timestamp(),
    }
