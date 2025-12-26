"""MaterialRepository SQLAlchemy 구현."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.domain.entities.material import Material, MaterialType, MaterialUnit
from backend.domain.repositories.material_repository import (
    MaterialRepository as MaterialRepositoryInterface,
)
from backend.infrastructure.persistence.models.material import MaterialModel


class SQLAlchemyMaterialRepository(MaterialRepositoryInterface):
    """자재 Repository SQLAlchemy 구현."""

    def __init__(self, session: AsyncSession) -> None:
        """초기화.

        Args:
            session: SQLAlchemy 비동기 세션
        """
        self._session = session

    def _to_entity(self, model: MaterialModel) -> Material:
        """ORM 모델을 도메인 엔티티로 변환."""
        from decimal import Decimal

        return Material(
            material_id=model.material_id,
            material_name=model.material_name,
            material_type=MaterialType(model.material_type),
            unit=MaterialUnit(model.unit),
            unit_price=model.unit_price,
            effective_date=model.effective_date,
            scrap_rate=model.scrap_rate or Decimal("0"),
            supplier=model.supplier,
            specification=model.specification,
        )

    def _to_model(self, entity: Material) -> MaterialModel:
        """도메인 엔티티를 ORM 모델로 변환."""
        return MaterialModel(
            material_id=entity.material_id,
            material_name=entity.material_name,
            material_type=entity.material_type.value,
            unit=entity.unit.value,
            unit_price=entity.unit_price,
            effective_date=entity.effective_date,
            scrap_rate=entity.scrap_rate,
            supplier=entity.supplier,
            specification=entity.specification,
        )

    async def create(self, entity: Material) -> Material:
        """자재 생성."""
        model = self._to_model(entity)
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, entity_id: str) -> Material | None:
        """ID로 자재 조회."""
        stmt = select(MaterialModel).where(MaterialModel.material_id == entity_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self) -> list[Material]:
        """모든 자재 조회."""
        stmt = select(MaterialModel)
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def get_by_type(self, material_type: MaterialType) -> list[Material]:
        """유형별 자재 조회."""
        stmt = select(MaterialModel).where(
            MaterialModel.material_type == material_type.value
        )
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def update(self, entity: Material) -> Material:
        """자재 수정."""
        stmt = select(MaterialModel).where(
            MaterialModel.material_id == entity.material_id
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            model.material_name = entity.material_name
            model.material_type = entity.material_type.value
            model.unit = entity.unit.value
            model.unit_price = entity.unit_price
            model.effective_date = entity.effective_date
            model.scrap_rate = entity.scrap_rate
            model.supplier = entity.supplier
            model.specification = entity.specification

            await self._session.commit()
            await self._session.refresh(model)
            return self._to_entity(model)

        return entity

    async def delete(self, entity_id: str) -> bool:
        """자재 삭제."""
        stmt = select(MaterialModel).where(MaterialModel.material_id == entity_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            await self._session.delete(model)
            await self._session.commit()
            return True

        return False
