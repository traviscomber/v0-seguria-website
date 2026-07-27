from datetime import datetime, timezone
from uuid import uuid4

from seguria_vision.contracts import BoundingBox, Detection, ReviewStatus, RiskLevel, Species
from seguria_vision.rules import evaluate_security_rules
from seguria_vision.wildlife import WildlifeContext, build_persistence_request


def make_detection(species: Species, confidence: float) -> Detection:
    return Detection(
        frame_timestamp=datetime.now(timezone.utc),
        species=species,
        confidence=confidence,
        box=BoundingBox(x1=0.1, y1=0.1, x2=0.7, y2=0.8),
        model_version="test-model",
    )


def test_puma_rule_is_critical_and_requires_review() -> None:
    detection = make_detection(Species.PUMA, 0.91)

    triggered = evaluate_security_rules([detection])

    assert len(triggered) == 1
    assert triggered[0].rule_id == "predator-puma"
    assert triggered[0].risk_level == RiskLevel.CRITICAL
    assert triggered[0].requires_review is True


def test_low_confidence_detection_does_not_trigger_rule() -> None:
    detection = make_detection(Species.PUMA, 0.40)

    assert evaluate_security_rules([detection]) == []


def test_persistence_payload_includes_triggered_rules_and_review() -> None:
    detection = make_detection(Species.PERSON, 0.88)
    context = WildlifeContext(
        organization_id=uuid4(),
        site_id=uuid4(),
        submitted_by_user_id=uuid4(),
        camera_id="corral-norte",
    )

    request = build_persistence_request(
        image=b"image-bytes",
        content_type="image/jpeg",
        detections=[detection],
        context=context,
        model_version="test-model",
        review_threshold=0.55,
    )

    assert request.observation["status"] == "review_required"
    assert request.analysis.review_status == ReviewStatus.PENDING
    assert request.analysis.risk_level == RiskLevel.HIGH
    assert request.analysis.triggered_rules[0]["rule_id"] == "human-presence"
    assert request.audit_event["payload"]["triggered_rules"][0]["requires_review"] is True
