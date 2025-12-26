"""MaterialRepository 인터페이스."""

from __future__ import annotations

from abc import abstractmethod

from backend.domain.entities.material import Material, MaterialType
from backend.domain.repositories.base import BaseRepository


class MaterialRepository(BaseRepository[Material, str]):
    """자재 Repository 인터페이스."""

    @abstractmethod
    async def get_by_type(self, material_type: MaterialType) -> list[Material]:
        """유형별 자재 조회."""
        ...
