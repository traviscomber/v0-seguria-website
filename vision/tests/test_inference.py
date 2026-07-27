from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np
import pytest

from seguria_vision.inference import InvalidImageError, infer_image, prepare_image
from seguria_vision.runtime import ModelMetadata, OnnxModelRuntime


@dataclass
class FakeNode:
    name: str
    shape: list[int]
    type: str = "tensor(float)"


class FakeSession:
    def __init__(self, output: np.ndarray) -> None:
        self.output = output

    def get_inputs(self) -> list[FakeNode]:
        return [FakeNode(name="images", shape=[1, 3, 640, 640])]

    def get_outputs(self) -> list[FakeNode]:
        return [FakeNode(name="detections", shape=[1, 84, 8400])]

    def get_providers(self) -> list[str]:
        return ["CPUExecutionProvider"]

    def run(self, output_names, input_feed):
        assert input_feed["images"].shape == (1, 3, 640, 640)
        return [self.output]


def encode_test_image() -> bytes:
    image = np.zeros((100, 200, 3), dtype=np.uint8)
    ok, encoded = cv2.imencode(".jpg", image)
    assert ok
    return encoded.tobytes()


def metadata() -> ModelMetadata:
    return ModelMetadata(
        path="model.onnx",
        providers=("CPUExecutionProvider",),
        input_names=("images",),
        output_names=("detections",),
        input_shapes=((1, 3, 640, 640),),
        output_shapes=((1, 84, 8400),),
        input_types=("tensor(float)",),
        output_types=("tensor(float)",),
    )


def test_prepare_image_rejects_unknown_content_type() -> None:
    with pytest.raises(InvalidImageError, match="unsupported content type"):
        prepare_image(encode_test_image(), "application/pdf", metadata())


def test_prepare_image_rejects_corrupt_payload() -> None:
    with pytest.raises(InvalidImageError, match="corrupt or unsupported"):
        prepare_image(b"not-an-image", "image/jpeg", metadata())


def test_infer_image_returns_normalized_detection(tmp_path) -> None:
    model = tmp_path / "detector.onnx"
    model.write_bytes(b"fixture")

    prediction = np.zeros((1, 84, 1), dtype=np.float32)
    prediction[0, 0, 0] = 320.0
    prediction[0, 1, 0] = 320.0
    prediction[0, 2, 0] = 320.0
    prediction[0, 3, 0] = 320.0
    prediction[0, 4, 0] = 0.95

    runtime = OnnxModelRuntime(
        str(model),
        session_factory=lambda path, providers: FakeSession(prediction),
    )

    detections = infer_image(
        runtime=runtime,
        payload=encode_test_image(),
        content_type="image/jpeg",
        model_version="test-model",
        confidence_threshold=0.5,
    )

    assert len(detections) == 1
    detection = detections[0]
    assert detection.species.value == "person"
    assert detection.confidence == pytest.approx(0.95)
    assert 0 <= detection.box.x1 < detection.box.x2 <= 1
    assert 0 <= detection.box.y1 < detection.box.y2 <= 1
    assert detection.model_version == "test-model"
