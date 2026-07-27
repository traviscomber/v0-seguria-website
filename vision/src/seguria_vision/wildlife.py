from __future__ import annotations

from datetime import datetime, timezone
from enum import StrEnum
from hashlib import sha256
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, Field

from .contracts import Detection, ReviewStatus, RiskLevel, Species, VisionEvent
from .rules import evaluate_security_rules, highest_rule_risk


class ObservationSource(StrEnum):
    CAMERA_TRAP = "camera_trap"
    RTSP_EVENT = "rtsp_event"
    EXTERNAL_API = "external_api"


class ReviewDecision(StrEnum):
    VALIDATED = "validated"
    CORRECTED = "corrected"
    REJECTED = "rejected"


class WildlifeContext(BaseModel):
    organization_id: UUID
    site_id: UUID
    submitted_by_user_id: UUID
    camera_id: str = Field(min_length=1, max_length=100)
    source: ObservationSource = ObservationSource.EXTERNAL_API
    external_reference: str | None = Field(default=None, min_length=1, max_length=200)


class WildlifeAnalysisPayload(BaseModel):
    schema_version: str = "seguria-vision/1.0"
    provider: str = "seguria-vision"
    model_name: str = "onnx-detector"
    model_version: str
    detected_at: datetime
    detections: list[dict[str, object]]
    primary_species: Species | None
    maximum_confidence: Annotated[float, Field(ge=0, le=1)]
    review_status: ReviewStatus
    risk_level: RiskLevel
    triggered_rules: list[dict[str, object]] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)


class WildlifePersistenceRequest(BaseModel):
    context: WildlifeContext
    observation: dict[str, object]
    evidence: dict[str, object]
    analysis: WildlifeAnalysisPayload
    audit_event: dict[str, object]


class HumanReviewRequest(BaseModel):
    observation_id: UUID
    organization_id: UUID
    reviewer_user_id: UUID
    decision: ReviewDecision
    corrected_common_name: str | None = Field(default=None, max_length=200)
    corrected_scientific_name: str | None = Field(default=None, max_length=200)
    notes: str | None = Field(default=None, max_length=2000)


def classify_risk(species: Species | None, confidence: float) -> RiskLevel:
    if species == Species.PUMA and confidence >= 0.75:
        return RiskLevel.CRITICAL
    if species in {Species.PERSON, Species.VEHICLE, Species.FOX, Species.DOG}:
        return RiskLevel.HIGH if confidence >= 0.70 else RiskLevel.MEDIUM
    if confidence < 0.55:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW


def determine_review_status(confidence: float, review_threshold: float) -> ReviewStatus:
    return ReviewStatus.PENDING if confidence < review_threshold else ReviewStatus.NOT_REQUIRED


def detections_to_event(
    detections: list[Detection],
    context: WildlifeContext,
    review_threshold: float,
) -> VisionEvent | None:
    if not detections:
        return None
    strongest = max(detections, key=lambda detection: detection.confidence)
    triggered_rules = evaluate_security_rules(detections)
    rule_risk = highest_rule_risk(triggered_rules)
    review_status = determine_review_status(strongest.confidence, review_threshold)
    if any(rule.requires_review for rule in triggered_rules):
        review_status = ReviewStatus.PENDING
    return VisionEvent(
        camera_id=context.camera_id,
        site_id=str(context.site_id),
        started_at=min(detection.frame_timestamp for detection in detections),
        ended_at=max(detection.frame_timestamp for detection in detections),
        species=strongest.species,
        confidence=strongest.confidence,
        risk_level=rule_risk or classify_risk(strongest.species, strongest.confidence),
        detections_count=len(detections),
        review_status=review_status,
        model_version=strongest.model_version,
        metadata={
            "source": context.source.value,
            "triggered_rules_count": len(triggered_rules),
        },
    )


def build_persistence_request(
    *,
    image: bytes,
    content_type: str,
    detections: list[Detection],
    context: WildlifeContext,
    model_version: str,
    review_threshold: float,
) -> WildlifePersistenceRequest:
    event = detections_to_event(detections, context, review_threshold)
    strongest = max(detections, key=lambda detection: detection.confidence) if detections else None
    triggered_rules = evaluate_security_rules(detections)
    reference = context.external_reference or (
        f"vision:{context.camera_id}:{sha256(image).hexdigest()[:24]}"
    )
    review_status = event.review_status if event else ReviewStatus.NOT_REQUIRED
    risk_level = event.risk_level if event else RiskLevel.LOW
    status = "review_required" if review_status == ReviewStatus.PENDING else "analyzed"
    detected_at = strongest.frame_timestamp if strongest else datetime.now(timezone.utc)
    serialized_rules = [
        {
            "rule_id": rule.rule_id,
            "name": rule.name,
            "risk_level": rule.risk_level.value,
            "detection_id": rule.detection_id,
            "species": rule.species.value,
            "confidence": rule.confidence,
            "requires_review": rule.requires_review,
        }
        for rule in triggered_rules
    ]
    return WildlifePersistenceRequest(
        context=context,
        observation={
            "external_reference": reference,
            "organization_id": str(context.organization_id),
            "site_id": str(context.site_id),
            "submitted_by_user_id": str(context.submitted_by_user_id),
            "status": status,
            "source": context.source.value,
            "title": f"Vision detection — {strongest.species.value if strongest else 'no detection'}",
        },
        evidence={
            "mime_type": content_type,
            "byte_size": len(image),
            "sha256": sha256(image).hexdigest(),
            "asset_kind": "original",
            "source": context.source.value,
        },
        analysis=WildlifeAnalysisPayload(
            model_version=model_version,
            detected_at=detected_at,
            detections=[detection.model_dump(mode="json") for detection in detections],
            primary_species=strongest.species if strongest else None,
            maximum_confidence=strongest.confidence if strongest else 0,
            review_status=review_status,
            risk_level=risk_level,
            triggered_rules=serialized_rules,
            limitations=["Automatic detection requires human review for consequential action."],
        ),
        audit_event={
            "event_type": "vision.analysis_completed",
            "event_version": "1.0",
            "actor_user_id": str(context.submitted_by_user_id),
            "payload": {
                "camera_id": context.camera_id,
                "detections_count": len(detections),
                "model_version": model_version,
                "review_status": review_status.value,
                "risk_level": risk_level.value,
                "triggered_rules": serialized_rules,
            },
        },
    )
