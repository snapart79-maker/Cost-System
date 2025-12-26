"""Base Repository 인터페이스."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Generic, TypeVar

T = TypeVar("T")
ID = TypeVar("ID")


class BaseRepository(ABC, Generic[T, ID]):
    """기본 Repository 인터페이스.

    모든 Repository의 공통 CRUD 메서드 정의.
    """

    @abstractmethod
    async def create(self, entity: T) -> T:
        """엔티티 생성."""
        ...

    @abstractmethod
    async def get_by_id(self, entity_id: ID) -> T | None:
        """ID로 엔티티 조회."""
        ...

    @abstractmethod
    async def get_all(self) -> list[T]:
        """모든 엔티티 조회."""
        ...

    @abstractmethod
    async def update(self, entity: T) -> T:
        """엔티티 수정."""
        ...

    @abstractmethod
    async def delete(self, entity_id: ID) -> bool:
        """엔티티 삭제."""
        ...
