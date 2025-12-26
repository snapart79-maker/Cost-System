"""Application Settings.

pydantic-settings 기반 환경 설정 관리.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """애플리케이션 설정.

    환경 변수 또는 .env 파일에서 설정을 로드합니다.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "Wire Harness Cost Management System"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: Literal["development", "testing", "production"] = "development"

    # Database
    database_url: str = "sqlite+aiosqlite:///./data/cost_system.db"
    database_echo: bool = False

    # API
    api_v1_prefix: str = "/api/v1"

    # Cost Calculation Rates (기본 비율 설정)
    material_management_rate: float = 0.01  # 재료관리비율 1%
    general_admin_rate: float = 0.10  # 일반관리비율 10%
    defect_rate: float = 0.01  # 불량비율 1%
    profit_rate: float = 0.10  # 이윤율 10%

    @property
    def database_path(self) -> Path:
        """데이터베이스 파일 경로."""
        # sqlite+aiosqlite:///./data/cost_system.db -> ./data/cost_system.db
        url = self.database_url
        if url.startswith("sqlite"):
            path_part = url.split("///")[-1]
            return Path(path_part)
        return Path("./data/cost_system.db")


@lru_cache
def get_settings() -> Settings:
    """설정 인스턴스를 반환 (캐시됨)."""
    return Settings()
