from __future__ import annotations

from dataclasses import dataclass

import httpx

from .wildlife import HumanReviewRequest, WildlifePersistenceRequest


class PersistenceConfigurationError(RuntimeError):
    pass


class PersistenceRequestError(RuntimeError):
    pass


@dataclass(frozen=True)
class PersistenceResult:
    observation_id: str
    evidence_asset_id: str
    analysis_id: str
    status: str


class WildlifePersistenceClient:
    def __init__(
        self,
        backend_url: str | None,
        backend_token: str | None,
        timeout_seconds: float = 30.0,
    ) -> None:
        self.backend_url = backend_url.rstrip("/") if backend_url else None
        self.backend_token = backend_token
        self.timeout_seconds = timeout_seconds

    @property
    def is_configured(self) -> bool:
        return bool(self.backend_url and self.backend_token)

    def _authorization_headers(self) -> dict[str, str]:
        if not self.is_configured:
            raise PersistenceConfigurationError(
                "VISION_BACKEND_URL and VISION_BACKEND_TOKEN are required for persistence"
            )
        return {"Authorization": f"Bearer {self.backend_token}"}

    def persist_analysis(
        self,
        request: WildlifePersistenceRequest,
        image: bytes,
        content_type: str,
        filename: str = "vision-evidence",
    ) -> PersistenceResult:
        assert self.backend_url is not None
        try:
            response = httpx.post(
                f"{self.backend_url}/api/internal/wildlife/vision-events",
                headers=self._authorization_headers(),
                data={"metadata": request.model_dump_json()},
                files={"evidence": (filename, image, content_type)},
                timeout=self.timeout_seconds,
            )
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise PersistenceRequestError(f"failed to persist Wildlife analysis: {exc}") from exc

        payload = response.json()
        try:
            return PersistenceResult(
                observation_id=str(payload["observation_id"]),
                evidence_asset_id=str(payload["evidence_asset_id"]),
                analysis_id=str(payload["analysis_id"]),
                status=str(payload["status"]),
            )
        except (KeyError, TypeError, ValueError) as exc:
            raise PersistenceRequestError("backend returned an invalid persistence response") from exc

    def submit_review(self, request: HumanReviewRequest) -> dict[str, object]:
        assert self.backend_url is not None
        try:
            response = httpx.post(
                f"{self.backend_url}/api/internal/wildlife/reviews",
                headers={**self._authorization_headers(), "Content-Type": "application/json"},
                json=request.model_dump(mode="json"),
                timeout=self.timeout_seconds,
            )
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise PersistenceRequestError(f"failed to persist Wildlife review: {exc}") from exc
        payload = response.json()
        if not isinstance(payload, dict):
            raise PersistenceRequestError("backend returned an invalid review response")
        return payload
