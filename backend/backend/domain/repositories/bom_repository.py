"""BOMRepository 인터페이스."""

from __future__ import annotations

from abc import ABC, abstractmethod

from backend.domain.entities.bom import BOM, BOMItem, WorkType


class BOMRepository(ABC):
    """BOM Repository 인터페이스."""

    @abstractmethod
    async def create(self, bom: BOM) -> BOM:
        """BOM 생성."""
        ...

    @abstractmethod
    async def get_by_product_id(self, product_id: str) -> BOM | None:
        """완제품 ID로 BOM 조회."""
        ...

    @abstractmethod
    async def get_items_by_product_id(self, product_id: str) -> list[BOMItem]:
        """완제품 ID로 BOM 항목 조회."""
        ...

    @abstractmethod
    async def get_items_by_work_type(
        self, product_id: str, work_type: WorkType
    ) -> list[BOMItem]:
        """작업 유형별 BOM 항목 조회."""
        ...

    @abstractmethod
    async def add_item(self, item: BOMItem) -> BOMItem:
        """BOM 항목 추가."""
        ...

    @abstractmethod
    async def update_item(self, item: BOMItem) -> BOMItem:
        """BOM 항목 수정."""
        ...

    @abstractmethod
    async def delete(self, product_id: str) -> bool:
        """BOM 삭제."""
        ...
