from fastapi.testclient import TestClient

from seguria_vision.main import app, settings

client = TestClient(app)


def test_health_reports_process_liveness() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["status"] == "alive"


def test_readiness_fails_when_model_is_missing(tmp_path, monkeypatch) -> None:
    missing_model = tmp_path / "missing.onnx"
    monkeypatch.setattr(settings, "model_path", str(missing_model))

    response = client.get("/ready")

    assert response.status_code == 503
    detail = response.json()["detail"]
    assert detail["ok"] is False
    assert detail["status"] == "not_ready"


def test_readiness_succeeds_when_model_exists(tmp_path, monkeypatch) -> None:
    model = tmp_path / "detector.onnx"
    model.write_bytes(b"test-model-placeholder")
    monkeypatch.setattr(settings, "model_path", str(model))

    response = client.get("/ready")

    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["status"] == "ready"
