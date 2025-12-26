"""ProductRepository 인터페이스."""

from __future__ import annotations

from abc import abstractmethod

from backend.domain.entities.product import Product, ProductStatus
from backend.domain.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product, str]):
    """완제품 Repository 인터페이스."""

    @abstractmethod
    async def get_by_status(self, status: ProductStatus) -> list[Product]:
        """상태별 완제품 조회."""
        ...

    @abstractmethod
    async def get_by_customer(self, customer: str) -> list[Product]:
        """고객사별 완제품 조회."""
        ...
