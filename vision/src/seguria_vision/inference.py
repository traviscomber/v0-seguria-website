from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import cv2
import numpy as np

from .contracts import BoundingBox, Detection, Species
from .runtime import ModelMetadata, OnnxModelRuntime

MAX_IMAGE_BYTES = 12 * 1024 * 1024
MAX_IMAGE_DIMENSION = 8192
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

COCO_TO_SPECIES: dict[int, Species] = {
    0: Species.PERSON,
    2: Species.VEHICLE,
    3: Species.VEHICLE,
    5: Species.VEHICLE,
    7: Species.VEHICLE,
    15: Species.CAT,
    16: Species.DOG,
    17: Species.UNKNOWN_ANIMAL,
    18: Species.UNKNOWN_ANIMAL,
    19: Species.LIVESTOCK,
    20: Species.LIVESTOCK,
    21: Species.LIVESTOCK,
    22: Species.LIVESTOCK,
    23: Species.LIVESTOCK,
}


class InvalidImageError(ValueError):
    pass


class UnsupportedModelOutputError(RuntimeError):
    pass


@dataclass(frozen=True)
class PreparedImage:
    tensor: np.ndarray
    original_width: int
    original_height: int
    input_width: int
    input_height: int
    scale: float
    pad_x: float
    pad_y: float


def _resolve_input_size(metadata: ModelMetadata) -> tuple[int, int]:
    if not metadata.input_shapes:
        return 640, 640
    shape = metadata.input_shapes[0]
    if len(shape) != 4:
        raise UnsupportedModelOutputError("expected a four-dimensional image input")
    height, width = shape[-2], shape[-1]
    if not isinstance(height, int) or not isinstance(width, int):
        return 640, 640
    if height <= 0 or width <= 0:
        raise UnsupportedModelOutputError("model input dimensions must be positive")
    return width, height


def prepare_image(payload: bytes, content_type: str, metadata: ModelMetadata) -> PreparedImage:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise InvalidImageError(f"unsupported content type: {content_type}")
    if not payload:
        raise InvalidImageError("image payload is empty")
    if len(payload) > MAX_IMAGE_BYTES:
        raise InvalidImageError("image payload exceeds 12 MB")

    encoded = np.frombuffer(payload, dtype=np.uint8)
    image = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    if image is None:
        raise InvalidImageError("image payload is corrupt or unsupported")

    original_height, original_width = image.shape[:2]
    if max(original_width, original_height) > MAX_IMAGE_DIMENSION:
        raise InvalidImageError("image dimensions exceed the 8192 pixel limit")

    input_width, input_height = _resolve_input_size(metadata)
    scale = min(input_width / original_width, input_height / original_height)
    resized_width = max(1, round(original_width * scale))
    resized_height = max(1, round(original_height * scale))
    resized = cv2.resize(image, (resized_width, resized_height), interpolation=cv2.INTER_LINEAR)

    canvas = np.full((input_height, input_width, 3), 114, dtype=np.uint8)
    pad_x = (input_width - resized_width) / 2
    pad_y = (input_height - resized_height) / 2
    left = int(round(pad_x - 0.1))
    top = int(round(pad_y - 0.1))
    canvas[top : top + resized_height, left : left + resized_width] = resized

    rgb = cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB)
    tensor = np.transpose(rgb.astype(np.float32) / 255.0, (2, 0, 1))[None, ...]
    return PreparedImage(
        tensor=np.ascontiguousarray(tensor),
        original_width=original_width,
        original_height=original_height,
        input_width=input_width,
        input_height=input_height,
        scale=scale,
        pad_x=left,
        pad_y=top,
    )


def _iou(box: np.ndarray, boxes: np.ndarray) -> np.ndarray:
    x1 = np.maximum(box[0], boxes[:, 0])
    y1 = np.maximum(box[1], boxes[:, 1])
    x2 = np.minimum(box[2], boxes[:, 2])
    y2 = np.minimum(box[3], boxes[:, 3])
    intersection = np.maximum(0, x2 - x1) * np.maximum(0, y2 - y1)
    box_area = np.maximum(0, box[2] - box[0]) * np.maximum(0, box[3] - box[1])
    boxes_area = np.maximum(0, boxes[:, 2] - boxes[:, 0]) * np.maximum(0, boxes[:, 3] - boxes[:, 1])
    union = box_area + boxes_area - intersection
    return np.divide(intersection, union, out=np.zeros_like(intersection), where=union > 0)


def _nms(boxes: np.ndarray, scores: np.ndarray, threshold: float) -> list[int]:
    order = scores.argsort()[::-1]
    keep: list[int] = []
    while order.size:
        index = int(order[0])
        keep.append(index)
        if order.size == 1:
            break
        overlap = _iou(boxes[index], boxes[order[1:]])
        order = order[1:][overlap <= threshold]
    return keep


def _normalize_output(raw_output: Any) -> np.ndarray:
    output = np.asarray(raw_output)
    if output.ndim == 3:
        output = output[0]
    if output.ndim != 2:
        raise UnsupportedModelOutputError("expected a two-dimensional detection tensor")
    if output.shape[0] < output.shape[1] and output.shape[0] <= 128:
        output = output.T
    if output.shape[1] < 6:
        raise UnsupportedModelOutputError("detection tensor exposes fewer than six values")
    return output


def postprocess_yolo(
    raw_output: Any,
    prepared: PreparedImage,
    model_version: str,
    confidence_threshold: float,
    iou_threshold: float = 0.45,
    max_detections: int = 100,
) -> list[Detection]:
    predictions = _normalize_output(raw_output)
    boxes_xywh = predictions[:, :4]
    class_scores = predictions[:, 4:]
    class_ids = np.argmax(class_scores, axis=1)
    scores = class_scores[np.arange(class_scores.shape[0]), class_ids]
    selected = scores >= confidence_threshold
    if not np.any(selected):
        return []

    boxes_xywh = boxes_xywh[selected]
    class_ids = class_ids[selected]
    scores = scores[selected]
    boxes = np.empty_like(boxes_xywh)
    boxes[:, 0] = boxes_xywh[:, 0] - boxes_xywh[:, 2] / 2
    boxes[:, 1] = boxes_xywh[:, 1] - boxes_xywh[:, 3] / 2
    boxes[:, 2] = boxes_xywh[:, 0] + boxes_xywh[:, 2] / 2
    boxes[:, 3] = boxes_xywh[:, 1] + boxes_xywh[:, 3] / 2

    keep: list[int] = []
    for class_id in np.unique(class_ids):
        indices = np.where(class_ids == class_id)[0]
        class_keep = _nms(boxes[indices], scores[indices], iou_threshold)
        keep.extend(int(indices[index]) for index in class_keep)
    keep = sorted(keep, key=lambda index: float(scores[index]), reverse=True)[:max_detections]

    timestamp = datetime.now(timezone.utc)
    detections: list[Detection] = []
    for index in keep:
        x1, y1, x2, y2 = boxes[index]
        x1 = (x1 - prepared.pad_x) / prepared.scale
        y1 = (y1 - prepared.pad_y) / prepared.scale
        x2 = (x2 - prepared.pad_x) / prepared.scale
        y2 = (y2 - prepared.pad_y) / prepared.scale
        x1 = float(np.clip(x1 / prepared.original_width, 0, 1))
        y1 = float(np.clip(y1 / prepared.original_height, 0, 1))
        x2 = float(np.clip(x2 / prepared.original_width, 0, 1))
        y2 = float(np.clip(y2 / prepared.original_height, 0, 1))
        if x2 <= x1 or y2 <= y1:
            continue
        detections.append(
            Detection(
                frame_timestamp=timestamp,
                species=COCO_TO_SPECIES.get(int(class_ids[index]), Species.UNKNOWN_ANIMAL),
                confidence=float(scores[index]),
                box=BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2),
                model_version=model_version,
            )
        )
    return detections


def infer_image(
    runtime: OnnxModelRuntime,
    payload: bytes,
    content_type: str,
    model_version: str,
    confidence_threshold: float,
) -> list[Detection]:
    metadata = runtime.load()
    prepared = prepare_image(payload, content_type, metadata)
    outputs = runtime.run({metadata.input_names[0]: prepared.tensor})
    if not outputs:
        raise UnsupportedModelOutputError("model returned no outputs")
    return postprocess_yolo(
        raw_output=outputs[0],
        prepared=prepared,
        model_version=model_version,
        confidence_threshold=confidence_threshold,
    )
