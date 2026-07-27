from __future__ import annotations

from datetime import datetime, timezone
from enum import StrEnum
from typing import Annotated
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, HttpUrl, model_validator


class Species(StrEnum):
    PUMA = "puma"
    DOG = "dog"
    FOX = "fox"
    CAT = "cat"
    LIVESTOCK = "livestock"
    PERSON = "person"
    VEHICLE = "vehicle"
    UNKNOWN_ANIMAL = "unknown_animal"


class ReviewStatus(StrEnum):
    NOT_REQUIRED = "not_required"
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    UNCERTAIN = "uncertain"


class RiskLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class BoundingBox(BaseModel):
    x1: Annotated[float, Field(ge=0, le=1)]
    y1: Annotated[float, Field(ge=0, le=1)]
    x2: Annotated[float, Field(ge=0, le=1)]
    y2: Annotated[float, Field(ge=0, le=1)]

    @model_validator(mode="after")
    def validate_geometry(self) -> BoundingBox:
        if self.x2 <= self.x1:
            raise ValueError("x2 must be greater than x1")
        if self.y2 <= self.y1:
            raise ValueError("y2 must be greater than y1")
        return self


class Detection(BaseModel):
    detection_id: UUID = Field(default_factory=uuid4)
    frame_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    species: Species
    confidence: Annotated[float, Field(ge=0, le=1)]
    box: BoundingBox
    track_id: str | None = Field(default=None, min_length=1, max_length=100)
    model_version: str = Field(min_length=1, max_length=100)


class VisionEvent(BaseModel):
    event_id: UUID = Field(default_factory=uuid4)
    camera_id: str = Field(min_length=1, max_length=100)
    site_id: str = Field(min_length=1, max_length=100)
    started_at: datetime
    ended_at: datetime | None = None
    species: Species
    confidence: Annotated[float, Field(ge=0, le=1)]
    risk_level: RiskLevel
    detections_count: int = Field(ge=1)
    track_id: str | None = Field(default=None, min_length=1, max_length=100)
    snapshot_url: HttpUrl | None = None
    clip_url: HttpUrl | None = None
    review_status: ReviewStatus = ReviewStatus.NOT_REQUIRED
    model_version: str = Field(min_length=1, max_length=100)
    metadata: dict[str, str | int | float | bool | None] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_time_window(self) -> VisionEvent:
        if self.ended_at is not None and self.ended_at < self.started_at:
            raise ValueError("ended_at must be greater than or equal to started_at")
        return self
