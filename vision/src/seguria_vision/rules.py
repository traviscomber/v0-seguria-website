from __future__ import annotations

from dataclasses import dataclass

from .contracts import Detection, RiskLevel, Species


@dataclass(frozen=True)
class SecurityRule:
    rule_id: str
    name: str
    species: frozenset[Species]
    minimum_confidence: float
    risk_level: RiskLevel
    requires_review: bool = True


@dataclass(frozen=True)
class TriggeredRule:
    rule_id: str
    name: str
    risk_level: RiskLevel
    detection_id: str
    species: Species
    confidence: float
    requires_review: bool


DEFAULT_SECURITY_RULES: tuple[SecurityRule, ...] = (
    SecurityRule(
        rule_id="predator-puma",
        name="Puma detected near an animal operation",
        species=frozenset({Species.PUMA}),
        minimum_confidence=0.70,
        risk_level=RiskLevel.CRITICAL,
    ),
    SecurityRule(
        rule_id="predator-fox-dog",
        name="Potential predator detected",
        species=frozenset({Species.FOX, Species.DOG}),
        minimum_confidence=0.70,
        risk_level=RiskLevel.HIGH,
    ),
    SecurityRule(
        rule_id="human-presence",
        name="Person detected in monitored animal area",
        species=frozenset({Species.PERSON}),
        minimum_confidence=0.65,
        risk_level=RiskLevel.HIGH,
    ),
    SecurityRule(
        rule_id="vehicle-presence",
        name="Vehicle detected in monitored animal area",
        species=frozenset({Species.VEHICLE}),
        minimum_confidence=0.70,
        risk_level=RiskLevel.MEDIUM,
    ),
    SecurityRule(
        rule_id="unknown-animal",
        name="Unknown animal requires classification",
        species=frozenset({Species.UNKNOWN_ANIMAL}),
        minimum_confidence=0.55,
        risk_level=RiskLevel.MEDIUM,
    ),
)


def evaluate_security_rules(
    detections: list[Detection],
    rules: tuple[SecurityRule, ...] = DEFAULT_SECURITY_RULES,
) -> list[TriggeredRule]:
    triggered: list[TriggeredRule] = []
    for detection in detections:
        for rule in rules:
            if detection.species not in rule.species:
                continue
            if detection.confidence < rule.minimum_confidence:
                continue
            triggered.append(
                TriggeredRule(
                    rule_id=rule.rule_id,
                    name=rule.name,
                    risk_level=rule.risk_level,
                    detection_id=str(detection.detection_id),
                    species=detection.species,
                    confidence=detection.confidence,
                    requires_review=rule.requires_review,
                )
            )
    return sorted(
        triggered,
        key=lambda item: (
            {RiskLevel.LOW: 0, RiskLevel.MEDIUM: 1, RiskLevel.HIGH: 2, RiskLevel.CRITICAL: 3}[
                item.risk_level
            ],
            item.confidence,
        ),
        reverse=True,
    )


def highest_rule_risk(triggered_rules: list[TriggeredRule]) -> RiskLevel | None:
    if not triggered_rules:
        return None
    order = {
        RiskLevel.LOW: 0,
        RiskLevel.MEDIUM: 1,
        RiskLevel.HIGH: 2,
        RiskLevel.CRITICAL: 3,
    }
    return max(triggered_rules, key=lambda item: order[item.risk_level]).risk_level
