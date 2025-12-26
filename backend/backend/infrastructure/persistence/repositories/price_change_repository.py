"""PriceChangeRepository SQLAlchemy 구현."""

from __future__ import annotations

import json
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.domain.entities.price_change import (
    ChangeType,
    MaterialChangeDetail,
    PriceChange,
    ProcessChangeDetail,
)
from backend.domain.repositories.price_change_repository import (
    PriceChangeRepository as PriceChangeRepositoryInterface,
)
from backend.infrastructure.persistence.models.price_change import PriceChangeModel


class SQLAlchemyPriceChangeRepository(PriceChangeRepositoryInterface):
    """단가 변경 Repository SQLAlchemy 구현."""

    def __init__(self, session: AsyncSession) -> None:
        """초기화."""
        self._session = session

    def _material_changes_to_json(
        self, changes: list[MaterialChangeDetail] | None
    ) -> str | None:
        """재료 변경 내역을 JSON으로 변환."""
        if not changes:
            return None
        return json.dumps(
            [
                {
                    "material_id": c.material_id,
                    "before_price": str(c.before_price),
                    "after_price": str(c.after_price),
                    "reason": c.reason,
                }
                for c in changes
            ]
        )

    def _process_changes_to_json(
        self, changes: list[ProcessChangeDetail] | None
    ) -> str | None:
        """공정 변경 내역을 JSON으로 변환."""
        if not changes:
            return None
        return json.dumps(
            [
                {
                    "process_id": c.process_id,
                    "before_labor_rate": str(c.before_labor_rate),
                    "after_labor_rate": str(c.after_labor_rate),
                    "before_machine_cost": str(c.before_machine_cost),
                    "after_machine_cost": str(c.after_machine_cost),
                    "reason": c.reason,
                }
                for c in changes
            ]
        )

    def _to_entity(self, model: PriceChangeModel) -> PriceChange:
        """ORM 모델을 도메인 엔티티로 변환."""
        material_changes = None
        if model.material_changes_json:
            data = json.loads(model.material_changes_json)
            from decimal import Decimal

            material_changes = [
                MaterialChangeDetail(
                    material_id=d["material_id"],
                    before_price=Decimal(d["before_price"]),
                    after_price=Decimal(d["after_price"]),
                    reason=d.get("reason"),
                )
                for d in data
            ]

        process_changes = None
        if model.process_changes_json:
            data = json.loads(model.process_changes_json)
            from decimal import Decimal

            process_changes = [
                ProcessChangeDetail(
                    process_id=d["process_id"],
                    before_labor_rate=Decimal(d["before_labor_rate"]),
                    after_labor_rate=Decimal(d["after_labor_rate"]),
                    before_machine_cost=Decimal(d["before_machine_cost"]),
                    after_machine_cost=Decimal(d["after_machine_cost"]),
                    reason=d.get("reason"),
                )
                for d in data
            ]

        return PriceChange(
            change_id=model.change_id,
            product_id=model.product_id,
            change_type=ChangeType(model.change_type),
            change_reason=model.change_reason,
            effective_date=model.effective_date,
            before_cost=model.before_cost,
            after_cost=model.after_cost,
            material_changes=material_changes,
            process_changes=process_changes,
        )

    def _to_model(self, entity: PriceChange) -> PriceChangeModel:
        """도메인 엔티티를 ORM 모델로 변환."""
        return PriceChangeModel(
            change_id=entity.change_id,
            product_id=entity.product_id,
            change_type=entity.change_type.value,
            change_reason=entity.change_reason,
            effective_date=entity.effective_date,
            before_cost=entity.before_cost,
            after_cost=entity.after_cost,
            material_changes_json=self._material_changes_to_json(
                entity.material_changes
            ),
            process_changes_json=self._process_changes_to_json(entity.process_changes),
        )

    async def create(self, entity: PriceChange) -> PriceChange:
        """단가 변경 생성."""
        model = self._to_model(entity)
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, entity_id: str) -> PriceChange | None:
        """ID로 단가 변경 조회."""
        stmt = select(PriceChangeModel).where(PriceChangeModel.change_id == entity_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self) -> list[PriceChange]:
        """모든 단가 변경 조회."""
        stmt = select(PriceChangeModel)
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def get_by_product_id(self, product_id: str) -> list[PriceChange]:
        """완제품 ID로 단가 변경 조회."""
        stmt = select(PriceChangeModel).where(PriceChangeModel.product_id == product_id)
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def get_by_date_range(
        self, start_date: date, end_date: date
    ) -> list[PriceChange]:
        """기간별 단가 변경 조회."""
        stmt = select(PriceChangeModel).where(
            PriceChangeModel.effective_date >= start_date,
            PriceChangeModel.effective_date <= end_date,
        )
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def get_by_change_type(self, change_type: ChangeType) -> list[PriceChange]:
        """변경 유형별 단가 변경 조회."""
        stmt = select(PriceChangeModel).where(
            PriceChangeModel.change_type == change_type.value
        )
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def get_latest_by_product_id(self, product_id: str) -> PriceChange | None:
        """완제품의 최신 단가 변경 조회."""
        stmt = (
            select(PriceChangeModel)
            .where(PriceChangeModel.product_id == product_id)
            .order_by(PriceChangeModel.effective_date.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def update(self, entity: PriceChange) -> PriceChange:
        """단가 변경 수정."""
        stmt = select(PriceChangeModel).where(
            PriceChangeModel.change_id == entity.change_id
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            model.product_id = entity.product_id
            model.change_type = entity.change_type.value
            model.change_reason = entity.change_reason
            model.effective_date = entity.effective_date
            model.before_cost = entity.before_cost
            model.after_cost = entity.after_cost
            model.material_changes_json = self._material_changes_to_json(
                entity.material_changes
            )
            model.process_changes_json = self._process_changes_to_json(
                entity.process_changes
            )

            await self._session.commit()
            await self._session.refresh(model)
            return self._to_entity(model)

        return entity

    async def delete(self, entity_id: str) -> bool:
        """단가 변경 삭제."""
        stmt = select(PriceChangeModel).where(PriceChangeModel.change_id == entity_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            await self._session.delete(model)
            await self._session.commit()
            return True

        return False
