from datetime import datetime, timezone
from uuid import UUID

from fastapi import Body, FastAPI, Header, HTTPException, status
from pydantic import ValidationError

from .config import settings
from .inference import InvalidImageError, UnsupportedModelOutputError, infer_image
from .persistence import (
    PersistenceConfigurationError,
    PersistenceRequestError,
    WildlifePersistenceClient,
)
from .runtime import ModelLoadError, OnnxModelRuntime
from .wildlife import ObservationSource, WildlifeContext, build_persistence_request

app = FastAPI(
    title=settings.service_name,
    version="0.3.0",
    description="Edge-first computer vision service for SegurIA Wildlife Intelligence.",
)

model_runtime = OnnxModelRuntime(settings.model_path)
persistence_client = WildlifePersistenceClient(settings.backend_url, settings.backend_token)


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
        "persistence_configured": persistence_client.is_configured,
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
        "persistence_configured": persistence_client.is_configured,
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
    persist: bool = Header(default=False, alias="X-Persist-Result"),
    organization_id: str | None = Header(default=None, alias="X-Organization-Id"),
    site_id: str | None = Header(default=None, alias="X-Site-Id"),
    submitted_by_user_id: str | None = Header(default=None, alias="X-Submitted-By-User-Id"),
    camera_id: str | None = Header(default=None, alias="X-Camera-Id"),
    source: str = Header(default=ObservationSource.EXTERNAL_API.value, alias="X-Vision-Source"),
    external_reference: str | None = Header(default=None, alias="X-External-Reference"),
) -> dict[str, object]:
    model_runtime.model_path = settings.model_path
    normalized_content_type = content_type.lower().strip()
    try:
        detections = infer_image(
            runtime=model_runtime,
            payload=image,
            content_type=normalized_content_type,
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

    persistence: dict[str, object] | None = None
    if persist:
        missing = [
            name
            for name, value in (
                ("X-Organization-Id", organization_id),
                ("X-Site-Id", site_id),
                ("X-Submitted-By-User-Id", submitted_by_user_id),
                ("X-Camera-Id", camera_id),
            )
            if not value
        ]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "code": "missing_persistence_context",
                    "message": f"required headers missing: {', '.join(missing)}",
                },
            )
        try:
            context = WildlifeContext(
                organization_id=UUID(organization_id),
                site_id=UUID(site_id),
                submitted_by_user_id=UUID(submitted_by_user_id),
                camera_id=camera_id,
                source=ObservationSource(source),
                external_reference=external_reference,
            )
            request = build_persistence_request(
                image=image,
                content_type=normalized_content_type,
                detections=detections,
                context=context,
                model_version=settings.model_version,
                review_threshold=settings.review_threshold,
            )
            result = persistence_client.persist_analysis(
                request=request,
                image=image,
                content_type=normalized_content_type,
            )
            persistence = {
                "observation_id": result.observation_id,
                "evidence_asset_id": result.evidence_asset_id,
                "analysis_id": result.analysis_id,
                "status": result.status,
            }
        except (ValueError, ValidationError) as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"code": "invalid_persistence_context", "message": str(exc)},
            ) from exc
        except PersistenceConfigurationError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"code": "persistence_not_configured", "message": str(exc)},
            ) from exc
        except PersistenceRequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail={"code": "persistence_failed", "message": str(exc)},
            ) from exc

    return {
        "ok": True,
        "model_version": settings.model_version,
        "detections_count": len(detections),
        "detections": [detection.model_dump(mode="json") for detection in detections],
        "persistence": persistence,
        "timestamp": utc_timestamp(),
    }
