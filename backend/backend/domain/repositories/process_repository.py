"""ProcessRepository 인터페이스."""

from __future__ import annotations

from abc import abstractmethod

from backend.domain.entities.process import Process, WorkType
from backend.domain.repositories.base import BaseRepository


class ProcessRepository(BaseRepository[Process, str]):
    """공정 Repository 인터페이스."""

    @abstractmethod
    async def get_by_work_type(self, work_type: WorkType) -> list[Process]:
        """작업 유형별 공정 조회."""
        ...
