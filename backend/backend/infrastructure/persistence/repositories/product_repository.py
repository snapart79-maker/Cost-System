"""ProductRepository SQLAlchemy 구현."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.domain.entities.product import Product, ProductStatus
from backend.domain.repositories.product_repository import (
    ProductRepository as ProductRepositoryInterface,
)
from backend.infrastructure.persistence.models.product import ProductModel


class SQLAlchemyProductRepository(ProductRepositoryInterface):
    """완제품 Repository SQLAlchemy 구현."""

    def __init__(self, session: AsyncSession) -> None:
        """초기화."""
        self._session = session

    def _to_entity(self, model: ProductModel) -> Product:
        """ORM 모델을 도메인 엔티티로 변환."""
        return Product(
            product_id=model.product_id,
            product_name=model.product_name,
            customer=model.customer,
            car_model=model.car_model,
            status=ProductStatus(model.status),
            description=model.description,
        )

    def _to_model(self, entity: Product) -> ProductModel:
        """도메인 엔티티를 ORM 모델로 변환."""
        return ProductModel(
            product_id=entity.product_id,
            product_name=entity.product_name,
            customer=entity.customer,
            car_model=entity.car_model,
            status=entity.status.value,
            description=entity.description,
        )

    async def create(self, entity: Product) -> Product:
        """완제품 생성."""
        model = self._to_model(entity)
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def get_by_id(self, entity_id: str) -> Product | None:
        """ID로 완제품 조회."""
        stmt = select(ProductModel).where(ProductModel.product_id == entity_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_all(self) -> list[Product]:
        """모든 완제품 조회."""
        stmt = select(ProductModel)
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def get_by_status(self, status: ProductStatus) -> list[Product]:
        """상태별 완제품 조회."""
        stmt = select(ProductModel).where(ProductModel.status == status.value)
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def get_by_customer(self, customer: str) -> list[Product]:
        """고객사별 완제품 조회."""
        stmt = select(ProductModel).where(ProductModel.customer == customer)
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def update(self, entity: Product) -> Product:
        """완제품 수정."""
        stmt = select(ProductModel).where(ProductModel.product_id == entity.product_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            model.product_name = entity.product_name
            model.customer = entity.customer
            model.car_model = entity.car_model
            model.status = entity.status.value
            model.description = entity.description

            await self._session.commit()
            await self._session.refresh(model)
            return self._to_entity(model)

        return entity

    async def delete(self, entity_id: str) -> bool:
        """완제품 삭제."""
        stmt = select(ProductModel).where(ProductModel.product_id == entity_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            await self._session.delete(model)
            await self._session.commit()
            return True

        return False
