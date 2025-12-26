"""Test 4.3: ProductRepository 통합 테스트.

TDD RED Phase: 완제품 저장소 CRUD 테스트.
"""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.asyncio


class TestProductRepository:
    """ProductRepository 통합 테스트."""

    async def test_create_product(self, db_session, sample_product_data):
        """완제품 생성."""
        from backend.domain.entities.product import Product, ProductStatus
        from backend.infrastructure.persistence.repositories.product_repository import (
            SQLAlchemyProductRepository,
        )

        repo = SQLAlchemyProductRepository(db_session)

        product = Product(
            product_id=sample_product_data["product_id"],
            product_name=sample_product_data["product_name"],
            customer=sample_product_data["customer"],
            car_model=sample_product_data["car_model"],
            status=ProductStatus.PRODUCTION,
        )

        created = await repo.create(product)

        assert created.product_id == "PROD-001"
        assert created.product_name == "Engine Room Harness"

    async def test_get_product_by_id(self, db_session):
        """ID로 완제품 조회."""
        from backend.domain.entities.product import Product, ProductStatus
        from backend.infrastructure.persistence.repositories.product_repository import (
            SQLAlchemyProductRepository,
        )

        repo = SQLAlchemyProductRepository(db_session)

        product = Product(
            product_id="PROD-002",
            product_name="Floor Harness",
            customer="기아자동차",
            car_model="K5",
            status=ProductStatus.PRODUCTION,
        )

        await repo.create(product)

        found = await repo.get_by_id("PROD-002")

        assert found is not None
        assert found.product_name == "Floor Harness"

    async def test_get_all_products(self, db_session):
        """모든 완제품 조회."""
        from backend.domain.entities.product import Product, ProductStatus
        from backend.infrastructure.persistence.repositories.product_repository import (
            SQLAlchemyProductRepository,
        )

        repo = SQLAlchemyProductRepository(db_session)

        for i in range(3):
            product = Product(
                product_id=f"PROD-00{i}",
                product_name=f"Product {i}",
                customer="Test Customer",
                status=ProductStatus.PRODUCTION,
            )
            await repo.create(product)

        all_products = await repo.get_all()

        assert len(all_products) == 3

    async def test_get_products_by_status(self, db_session):
        """상태별 완제품 조회."""
        from backend.domain.entities.product import Product, ProductStatus
        from backend.infrastructure.persistence.repositories.product_repository import (
            SQLAlchemyProductRepository,
        )

        repo = SQLAlchemyProductRepository(db_session)

        production = Product(
            product_id="PROD-001",
            product_name="Production Product",
            customer="Customer",
            status=ProductStatus.PRODUCTION,
        )
        development = Product(
            product_id="PROD-002",
            product_name="Development Product",
            customer="Customer",
            status=ProductStatus.DEVELOPMENT,
        )

        await repo.create(production)
        await repo.create(development)

        production_list = await repo.get_by_status(ProductStatus.PRODUCTION)
        development_list = await repo.get_by_status(ProductStatus.DEVELOPMENT)

        assert len(production_list) == 1
        assert len(development_list) == 1

    async def test_get_products_by_customer(self, db_session):
        """고객사별 완제품 조회."""
        from backend.domain.entities.product import Product, ProductStatus
        from backend.infrastructure.persistence.repositories.product_repository import (
            SQLAlchemyProductRepository,
        )

        repo = SQLAlchemyProductRepository(db_session)

        hyundai = Product(
            product_id="PROD-001",
            product_name="Hyundai Product",
            customer="현대자동차",
            status=ProductStatus.PRODUCTION,
        )
        kia = Product(
            product_id="PROD-002",
            product_name="Kia Product",
            customer="기아자동차",
            status=ProductStatus.PRODUCTION,
        )

        await repo.create(hyundai)
        await repo.create(kia)

        hyundai_list = await repo.get_by_customer("현대자동차")

        assert len(hyundai_list) == 1
        assert hyundai_list[0].customer == "현대자동차"

    async def test_update_product(self, db_session):
        """완제품 수정."""
        from backend.domain.entities.product import Product, ProductStatus
        from backend.infrastructure.persistence.repositories.product_repository import (
            SQLAlchemyProductRepository,
        )

        repo = SQLAlchemyProductRepository(db_session)

        product = Product(
            product_id="PROD-001",
            product_name="Old Name",
            customer="Customer",
            status=ProductStatus.DEVELOPMENT,
        )

        created = await repo.create(product)

        created.product_name = "New Name"
        created.status = ProductStatus.PRODUCTION

        updated = await repo.update(created)

        assert updated.product_name == "New Name"
        assert updated.status == ProductStatus.PRODUCTION

    async def test_delete_product(self, db_session):
        """완제품 삭제."""
        from backend.domain.entities.product import Product, ProductStatus
        from backend.infrastructure.persistence.repositories.product_repository import (
            SQLAlchemyProductRepository,
        )

        repo = SQLAlchemyProductRepository(db_session)

        product = Product(
            product_id="PROD-001",
            product_name="To Delete",
            customer="Customer",
            status=ProductStatus.PRODUCTION,
        )

        await repo.create(product)

        deleted = await repo.delete("PROD-001")

        assert deleted is True
        assert await repo.get_by_id("PROD-001") is None
