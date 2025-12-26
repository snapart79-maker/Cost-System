"""BOMRepository SQLAlchemy 구현."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.domain.entities.bom import BOM, BOMItem, WorkType
from backend.domain.repositories.bom_repository import (
    BOMRepository as BOMRepositoryInterface,
)
from backend.infrastructure.persistence.models.bom import BOMItemModel, BOMModel


class SQLAlchemyBOMRepository(BOMRepositoryInterface):
    """BOM Repository SQLAlchemy 구현."""

    def __init__(self, session: AsyncSession) -> None:
        """초기화."""
        self._session = session

    def _item_to_entity(self, model: BOMItemModel) -> BOMItem:
        """BOM 항목 모델을 엔티티로 변환."""
        return BOMItem(
            product_id=model.product_id,
            material_id=model.material_id,
            quantity=model.quantity,
            work_type=WorkType(model.work_type),
            sequence=model.sequence,
        )

    def _item_to_model(
        self, entity: BOMItem, bom_id: int | None = None
    ) -> BOMItemModel:
        """BOM 항목 엔티티를 모델로 변환."""
        model = BOMItemModel(
            product_id=entity.product_id,
            material_id=entity.material_id,
            quantity=entity.quantity,
            work_type=entity.work_type.value,
            sequence=entity.sequence,
        )
        if bom_id:
            model.bom_id = bom_id
        return model

    def _to_entity(self, model: BOMModel) -> BOM:
        """ORM 모델을 도메인 엔티티로 변환."""
        return BOM(
            product_id=model.product_id,
            version=model.version,
            items=[self._item_to_entity(item) for item in model.items],
        )

    async def create(self, bom: BOM) -> BOM:
        """BOM 생성."""
        model = BOMModel(
            product_id=bom.product_id,
            version=bom.version,
        )

        for item in bom.items:
            item_model = self._item_to_model(item)
            model.items.append(item_model)

        self._session.add(model)
        await self._session.commit()

        # Refresh with items loaded
        stmt = (
            select(BOMModel)
            .options(selectinload(BOMModel.items))
            .where(BOMModel.product_id == bom.product_id)
        )
        result = await self._session.execute(stmt)
        refreshed = result.scalar_one()

        return self._to_entity(refreshed)

    async def get_by_product_id(self, product_id: str) -> BOM | None:
        """완제품 ID로 BOM 조회."""
        stmt = (
            select(BOMModel)
            .options(selectinload(BOMModel.items))
            .where(BOMModel.product_id == product_id)
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_items_by_product_id(self, product_id: str) -> list[BOMItem]:
        """완제품 ID로 BOM 항목 조회."""
        bom = await self.get_by_product_id(product_id)
        return bom.items if bom else []

    async def get_items_by_work_type(
        self, product_id: str, work_type: WorkType
    ) -> list[BOMItem]:
        """작업 유형별 BOM 항목 조회."""
        items = await self.get_items_by_product_id(product_id)
        return [item for item in items if item.work_type == work_type]

    async def add_item(self, item: BOMItem) -> BOMItem:
        """BOM 항목 추가."""
        stmt = select(BOMModel).where(BOMModel.product_id == item.product_id)
        result = await self._session.execute(stmt)
        bom_model = result.scalar_one_or_none()

        if bom_model:
            item_model = self._item_to_model(item, bom_model.id)
            self._session.add(item_model)
            await self._session.commit()
            await self._session.refresh(item_model)
            return self._item_to_entity(item_model)

        return item

    async def update_item(self, item: BOMItem) -> BOMItem:
        """BOM 항목 수정."""
        stmt = (
            select(BOMItemModel)
            .where(BOMItemModel.product_id == item.product_id)
            .where(BOMItemModel.material_id == item.material_id)
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            model.quantity = item.quantity
            model.work_type = item.work_type.value
            model.sequence = item.sequence

            await self._session.commit()
            await self._session.refresh(model)
            return self._item_to_entity(model)

        return item

    async def delete(self, product_id: str) -> bool:
        """BOM 삭제."""
        stmt = select(BOMModel).where(BOMModel.product_id == product_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            await self._session.delete(model)
            await self._session.commit()
            return True

        return False
