"""Process Use Cases.

공정 마스터 CRUD 유스케이스.
"""

from __future__ import annotations

from decimal import Decimal

from backend.application.dtos.process_dto import CreateProcessDTO, UpdateProcessDTO
from backend.domain.entities.process import Process, WorkType
from backend.domain.repositories.process_repository import ProcessRepository


class ProcessAlreadyExistsError(Exception):
    """공정이 이미 존재하는 경우."""

    pass


class ProcessNotFoundError(Exception):
    """공정을 찾을 수 없는 경우."""

    pass


class CreateProcessUseCase:
    """공정 생성 유스케이스."""

    def __init__(self, repository: ProcessRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, dto: CreateProcessDTO) -> Process:
        """공정 생성 실행.

        Args:
            dto: 공정 생성 DTO

        Returns:
            생성된 공정 엔티티

        Raises:
            ProcessAlreadyExistsError: 이미 존재하는 공정인 경우
        """
        existing = await self._repository.get_by_id(dto.process_id)
        if existing:
            raise ProcessAlreadyExistsError(
                f"공정 '{dto.process_id}'가 이미 존재합니다."
            )

        process = Process(
            process_id=dto.process_id,
            process_name=dto.process_name,
            work_type=WorkType(dto.work_type),
            labor_rate=dto.labor_rate,
            machine_cost=dto.machine_cost,
            efficiency=dto.efficiency or Decimal("100.00"),
            description=dto.description,
        )

        return await self._repository.create(process)


class GetProcessUseCase:
    """공정 조회 유스케이스."""

    def __init__(self, repository: ProcessRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, process_id: str) -> Process | None:
        """공정 조회 실행.

        Args:
            process_id: 공정 ID

        Returns:
            공정 엔티티 또는 None
        """
        return await self._repository.get_by_id(process_id)


class ListProcessesUseCase:
    """공정 목록 조회 유스케이스."""

    def __init__(self, repository: ProcessRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, work_type: WorkType | None = None) -> list[Process]:
        """공정 목록 조회 실행.

        Args:
            work_type: 작업 유형 (선택)

        Returns:
            공정 목록
        """
        if work_type:
            return await self._repository.get_by_work_type(work_type)
        return await self._repository.get_all()


class UpdateProcessUseCase:
    """공정 수정 유스케이스."""

    def __init__(self, repository: ProcessRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, dto: UpdateProcessDTO) -> Process:
        """공정 수정 실행.

        Args:
            dto: 공정 수정 DTO

        Returns:
            수정된 공정 엔티티

        Raises:
            ProcessNotFoundError: 공정을 찾을 수 없는 경우
        """
        existing = await self._repository.get_by_id(dto.process_id)
        if not existing:
            raise ProcessNotFoundError(f"공정 '{dto.process_id}'를 찾을 수 없습니다.")

        updated = Process(
            process_id=existing.process_id,
            process_name=dto.process_name or existing.process_name,
            work_type=(
                WorkType(dto.work_type) if dto.work_type else existing.work_type
            ),
            labor_rate=dto.labor_rate or existing.labor_rate,
            machine_cost=dto.machine_cost or existing.machine_cost,
            efficiency=(
                dto.efficiency if dto.efficiency is not None else existing.efficiency
            ),
            description=(
                dto.description if dto.description is not None else existing.description
            ),
        )

        return await self._repository.update(updated)


class DeleteProcessUseCase:
    """공정 삭제 유스케이스."""

    def __init__(self, repository: ProcessRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, process_id: str) -> bool:
        """공정 삭제 실행.

        Args:
            process_id: 공정 ID

        Returns:
            삭제 성공 여부
        """
        return await self._repository.delete(process_id)
