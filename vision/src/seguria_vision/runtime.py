from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from threading import Lock
from typing import Any, Callable, Protocol


class SessionInput(Protocol):
    name: str
    shape: list[int | str | None]
    type: str


class SessionOutput(Protocol):
    name: str
    shape: list[int | str | None]
    type: str


class InferenceSession(Protocol):
    def get_inputs(self) -> list[SessionInput]: ...

    def get_outputs(self) -> list[SessionOutput]: ...

    def get_providers(self) -> list[str]: ...

    def run(self, output_names: list[str] | None, input_feed: dict[str, Any]) -> list[Any]: ...


SessionFactory = Callable[[str, list[str] | None], InferenceSession]
TensorShape = tuple[int | str | None, ...]


class ModelLoadError(RuntimeError):
    pass


@dataclass(frozen=True)
class ModelMetadata:
    path: str
    providers: tuple[str, ...]
    input_names: tuple[str, ...]
    output_names: tuple[str, ...]
    input_shapes: tuple[TensorShape, ...]
    output_shapes: tuple[TensorShape, ...]
    input_types: tuple[str, ...]
    output_types: tuple[str, ...]


class OnnxModelRuntime:
    def __init__(
        self,
        model_path: str,
        providers: list[str] | None = None,
        session_factory: SessionFactory | None = None,
    ) -> None:
        self.model_path = model_path
        self.providers = providers
        self._session_factory = session_factory or self._default_session_factory
        self._session: InferenceSession | None = None
        self._metadata: ModelMetadata | None = None
        self._error: str | None = None
        self._lock = Lock()

    @staticmethod
    def _default_session_factory(
        model_path: str,
        providers: list[str] | None,
    ) -> InferenceSession:
        try:
            import onnxruntime as ort
        except ImportError as exc:
            raise ModelLoadError("onnxruntime is not installed") from exc

        try:
            return ort.InferenceSession(model_path, providers=providers)
        except Exception as exc:  # onnxruntime raises provider-specific exceptions
            raise ModelLoadError(f"failed to load ONNX model: {exc}") from exc

    @property
    def is_ready(self) -> bool:
        return self._session is not None and self._metadata is not None

    @property
    def error(self) -> str | None:
        return self._error

    @property
    def metadata(self) -> ModelMetadata | None:
        return self._metadata

    def load(self, force: bool = False) -> ModelMetadata:
        with self._lock:
            model = Path(self.model_path)
            current_path = str(model)
            if (
                self.is_ready
                and not force
                and self._metadata is not None
                and self._metadata.path == current_path
            ):
                return self._metadata

            if not model.is_file():
                self._session = None
                self._metadata = None
                self._error = f"model file not found: {model}"
                raise ModelLoadError(self._error)

            try:
                session = self._session_factory(current_path, self.providers)
                inputs = session.get_inputs()
                outputs = session.get_outputs()
            except ModelLoadError as exc:
                self._session = None
                self._metadata = None
                self._error = str(exc)
                raise
            except Exception as exc:
                self._session = None
                self._metadata = None
                self._error = f"invalid ONNX session: {exc}"
                raise ModelLoadError(self._error) from exc

            if not inputs:
                self._session = None
                self._metadata = None
                self._error = "ONNX model exposes no inputs"
                raise ModelLoadError(self._error)
            if not outputs:
                self._session = None
                self._metadata = None
                self._error = "ONNX model exposes no outputs"
                raise ModelLoadError(self._error)

            metadata = ModelMetadata(
                path=current_path,
                providers=tuple(session.get_providers()),
                input_names=tuple(item.name for item in inputs),
                output_names=tuple(item.name for item in outputs),
                input_shapes=tuple(tuple(item.shape) for item in inputs),
                output_shapes=tuple(tuple(item.shape) for item in outputs),
                input_types=tuple(item.type for item in inputs),
                output_types=tuple(item.type for item in outputs),
            )
            self._session = session
            self._metadata = metadata
            self._error = None
            return metadata

    def run(self, input_feed: dict[str, Any]) -> list[Any]:
        self.load()
        assert self._session is not None
        return self._session.run(None, input_feed)
