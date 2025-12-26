"""PriceChangeRepository 인터페이스."""

from __future__ import annotations

from abc import abstractmethod
from datetime import date

from backend.domain.entities.price_change import ChangeType, PriceChange
from backend.domain.repositories.base import BaseRepository


class PriceChangeRepository(BaseRepository[PriceChange, str]):
    """단가 변경 Repository 인터페이스."""

    @abstractmethod
    async def get_by_product_id(self, product_id: str) -> list[PriceChange]:
        """완제품 ID로 단가 변경 조회."""
        ...

    @abstractmethod
    async def get_by_date_range(
        self, start_date: date, end_date: date
    ) -> list[PriceChange]:
        """기간별 단가 변경 조회."""
        ...

    @abstractmethod
    async def get_by_change_type(self, change_type: ChangeType) -> list[PriceChange]:
        """변경 유형별 단가 변경 조회."""
        ...

    @abstractmethod
    async def get_latest_by_product_id(self, product_id: str) -> PriceChange | None:
        """완제품의 최신 단가 변경 조회."""
        ...
