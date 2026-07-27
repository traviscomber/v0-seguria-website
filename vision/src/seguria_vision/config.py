from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="VISION_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    service_name: str = "SegurIA Vision"
    environment: str = "development"
    device: str = "cpu"
    model_path: str = "models/puma-detector.onnx"
    model_version: str = "untrained-baseline"
    confidence_threshold: float = Field(default=0.45, ge=0, le=1)
    review_threshold: float = Field(default=0.55, ge=0, le=1)
    alert_threshold: float = Field(default=0.80, ge=0, le=1)
    event_min_frames: int = Field(default=3, ge=1)
    event_window_seconds: int = Field(default=8, ge=1)
    backend_url: str | None = None
    backend_token: str | None = None


settings = Settings()
