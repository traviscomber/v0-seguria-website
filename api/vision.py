from __future__ import annotations

import sys
from pathlib import Path

from fastapi import Body, FastAPI, Header, Query

VISION_SRC = Path(__file__).resolve().parents[1] / "vision" / "src"
if str(VISION_SRC) not in sys.path:
    sys.path.insert(0, str(VISION_SRC))

from seguria_vision.app import health, infer, readiness  # noqa: E402

app = FastAPI(
    title="SegurIA Vision API",
    version="0.3.0",
    description="Computer vision module for animal-operation security inside SegurIA.tech.",
)


@app.get("/")
def status_endpoint(mode: str = Query(default="health", pattern="^(health|ready)$")):
    if mode == "ready":
        return readiness()
    return health()


@app.post("/")
def inference_endpoint(
    image: bytes = Body(..., media_type="application/octet-stream"),
    content_type: str = Header(..., alias="X-Image-Content-Type"),
    persist_result: bool = Header(default=False, alias="X-Persist-Result"),
    organization_id: str | None = Header(default=None, alias="X-Organization-Id"),
    site_id: str | None = Header(default=None, alias="X-Site-Id"),
    submitted_by_user_id: str | None = Header(default=None, alias="X-Submitted-By-User-Id"),
    camera_id: str | None = Header(default=None, alias="X-Camera-Id"),
    vision_source: str = Header(default="external_api", alias="X-Vision-Source"),
    external_reference: str | None = Header(default=None, alias="X-External-Reference"),
):
    return infer(
        image=image,
        content_type=content_type,
        persist_result=persist_result,
        organization_id=organization_id,
        site_id=site_id,
        submitted_by_user_id=submitted_by_user_id,
        camera_id=camera_id,
        vision_source=vision_source,
        external_reference=external_reference,
    )
