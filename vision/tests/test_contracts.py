from datetime import datetime, timedelta, timezone

import pytest
from pydantic import ValidationError

from seguria_vision.contracts import BoundingBox, RiskLevel, Species, VisionEvent


def test_bounding_box_requires_positive_area() -> None:
    with pytest.raises(ValidationError, match="x2 must be greater than x1"):
        BoundingBox(x1=0.6, y1=0.1, x2=0.4, y2=0.8)

    with pytest.raises(ValidationError, match="y2 must be greater than y1"):
        BoundingBox(x1=0.1, y1=0.8, x2=0.6, y2=0.4)


def test_bounding_box_accepts_normalized_geometry() -> None:
    box = BoundingBox(x1=0.1, y1=0.2, x2=0.7, y2=0.9)

    assert box.x1 == 0.1
    assert box.y2 == 0.9


def test_vision_event_rejects_inverted_time_window() -> None:
    started_at = datetime.now(timezone.utc)

    with pytest.raises(ValidationError, match="ended_at must be greater than or equal"):
        VisionEvent(
            camera_id="camera-01",
            site_id="site-01",
            started_at=started_at,
            ended_at=started_at - timedelta(seconds=1),
            species=Species.PUMA,
            confidence=0.91,
            risk_level=RiskLevel.CRITICAL,
            detections_count=3,
            model_version="puma-detector-v1",
        )
