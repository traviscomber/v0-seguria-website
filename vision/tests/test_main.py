from dataclasses import dataclass

from fastapi.testclient import TestClient

from seguria_vision.main import app, model_runtime, settings
from seguria_vision.runtime import ModelLoadError

client = TestClient(app)


@dataclass
class FakeNode:
    name: str
    shape: list[int]
    type: str = "tensor(float)"


class FakeSession:
    def get_inputs(self) -> list[FakeNode]:
        return [FakeNode(name="images", shape=[1, 3, 640, 640])]

    def get_outputs(self) -> list[FakeNode]:
        return [FakeNode(name="detections", shape=[1, 84, 8400])]

    def get_providers(self) -> list[str]:
        return ["CPUExecutionProvider"]

    def run(self, output_names, input_feed):
        return []


def reset_runtime() -> None:
    model_runtime._session = None
    model_runtime._metadata = None
    model_runtime._error = None


def test_health_reports_process_liveness() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["status"] == "alive"


def test_readiness_fails_when_model_is_missing(tmp_path, monkeypatch) -> None:
    reset_runtime()
    missing_model = tmp_path / "missing.onnx"
    monkeypatch.setattr(settings, "model_path", str(missing_model))

    response = client.get("/ready")

    assert response.status_code == 503
    detail = response.json()["detail"]
    assert detail["ok"] is False
    assert detail["status"] == "not_ready"
    assert "model file not found" in detail["error"]


def test_readiness_fails_when_session_cannot_load(tmp_path, monkeypatch) -> None:
    reset_runtime()
    model = tmp_path / "broken.onnx"
    model.write_bytes(b"not-a-real-model")
    monkeypatch.setattr(settings, "model_path", str(model))

    def fail_session(model_path, providers):
        raise ModelLoadError("invalid ONNX graph")

    monkeypatch.setattr(model_runtime, "_session_factory", fail_session)

    response = client.get("/ready")

    assert response.status_code == 503
    detail = response.json()["detail"]
    assert detail["ok"] is False
    assert detail["error"] == "invalid ONNX graph"


def test_readiness_succeeds_for_valid_session(tmp_path, monkeypatch) -> None:
    reset_runtime()
    model = tmp_path / "detector.onnx"
    model.write_bytes(b"model-fixture")
    monkeypatch.setattr(settings, "model_path", str(model))
    monkeypatch.setattr(model_runtime, "_session_factory", lambda path, providers: FakeSession())

    response = client.get("/ready")

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["status"] == "ready"
    assert payload["providers"] == ["CPUExecutionProvider"]
    assert payload["inputs"] == ["images"]
    assert payload["outputs"] == ["detections"]
