"""ProcessRepository SQLAlchemy 구현."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.domain.entities.process import Process, WorkType
from backend.domain.repositories.process_repository import (
    ProcessRepository as ProcessRepositoryInterface,
)
from backend.infrastructure.persistence.models.process import ProcessModel


class SQLAlchemyProcessRepository(ProcessRepositoryInterface):
    """공정 Repository SQLAlchemy 구현."""

    def __init__(self, session: AsyncSession) -> None:
        """초기화."""
        self._session = session

    def _to_entity(self, model: ProcessModel) -> Process:
        """ORM 모델을 도메인 엔티티로 변환."""
        from decimal import Decimal

        return Process(
            process_id=model.process_id,
            process_name=model.process_name,
            work_type=WorkType(model.work_type),
            labor_rate=model.labor_rate,
            machine_cost=model.machine_cost,
            efficiency=model.efficiency or Decimal("100.00"),
            description=model.description,
        )

    def _to_model(self, entity: Process) -> ProcessModel:
        """도메인 엔티티를 ORM 모델로 변환."""
        return ProcessModel(
            process_id=entity.process_id,
            process_name=entity.process_name,
            work_type=entity.work_type.value,
            labor_rate=entity.labor_rate,
            machine_cost=entity.machine_cost,
            efficiency=entity.efficiency,
            description=entity.description,
        )

    async def create(self, entity: Process) -> Process:
        """공정 생성."""
        model = self._to_model(entity)
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, entity_id: str) -> Process | None:
        """ID로 공정 조회."""
        stmt = select(ProcessModel).where(ProcessModel.process_id == entity_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self) -> list[Process]:
        """모든 공정 조회."""
        stmt = select(ProcessModel)
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def get_by_work_type(self, work_type: WorkType) -> list[Process]:
        """작업 유형별 공정 조회."""
        stmt = select(ProcessModel).where(ProcessModel.work_type == work_type.value)
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def update(self, entity: Process) -> Process:
        """공정 수정."""
        stmt = select(ProcessModel).where(ProcessModel.process_id == entity.process_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            model.process_name = entity.process_name
            model.work_type = entity.work_type.value
            model.labor_rate = entity.labor_rate
            model.machine_cost = entity.machine_cost
            model.efficiency = entity.efficiency
            model.description = entity.description

            await self._session.commit()
            await self._session.refresh(model)
            return self._to_entity(model)

        return entity

    async def delete(self, entity_id: str) -> bool:
        """공정 삭제."""
        stmt = select(ProcessModel).where(ProcessModel.process_id == entity_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            await self._session.delete(model)
            await self._session.commit()
            return True

        return False
