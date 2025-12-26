"""Configuration Module.

애플리케이션 설정.
"""

from backend.config.settings import Settings, get_settings

settings = get_settings()

__all__ = ["Settings", "get_settings", "settings"]
