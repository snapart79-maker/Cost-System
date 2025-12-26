"""Test 4.4: BOMRepository 통합 테스트.

TDD RED Phase: BOM 저장소 CRUD 테스트.
"""

from __future__ import annotations

from decimal import Decimal

import pytest

pytestmark = pytest.mark.asyncio


class TestBOMRepository:
    """BOMRepository 통합 테스트."""

    async def test_create_bom(self, db_session):
        """BOM 생성."""
        from backend.domain.entities.bom import BOM, BOMItem, WorkType
        from backend.infrastructure.persistence.repositories.bom_repository import (
            SQLAlchemyBOMRepository,
        )

        repo = SQLAlchemyBOMRepository(db_session)

        bom = BOM(
            product_id="PROD-001",
            version="1.0",
            items=[
                BOMItem(
                    product_id="PROD-001",
                    material_id="W-001",
                    quantity=Decimal("10.00"),
                    work_type=WorkType.IN_HOUSE,
                ),
                BOMItem(
                    product_id="PROD-001",
                    material_id="T-001",
                    quantity=Decimal("4"),
                    work_type=WorkType.IN_HOUSE,
                ),
            ],
        )

        created = await repo.create(bom)

        assert created.product_id == "PROD-001"
        assert len(created.items) == 2

    async def test_get_bom_by_product_id(self, db_session):
        """완제품 ID로 BOM 조회."""
        from backend.domain.entities.bom import BOM, BOMItem, WorkType
        from backend.infrastructure.persistence.repositories.bom_repository import (
            SQLAlchemyBOMRepository,
        )

        repo = SQLAlchemyBOMRepository(db_session)

        bom = BOM(
            product_id="PROD-002",
            version="1.0",
            items=[
                BOMItem(
                    product_id="PROD-002",
                    material_id="W-001",
                    quantity=Decimal("5.00"),
                    work_type=WorkType.IN_HOUSE,
                ),
            ],
        )

        await repo.create(bom)

        found = await repo.get_by_product_id("PROD-002")

        assert found is not None
        assert found.product_id == "PROD-002"
        assert len(found.items) == 1

    async def test_get_bom_items_by_product_id(self, db_session):
        """완제품 ID로 BOM 항목 조회."""
        from backend.domain.entities.bom import BOM, BOMItem, WorkType
        from backend.infrastructure.persistence.repositories.bom_repository import (
            SQLAlchemyBOMRepository,
        )

        repo = SQLAlchemyBOMRepository(db_session)

        bom = BOM(
            product_id="PROD-003",
            version="1.0",
            items=[
                BOMItem(
                    product_id="PROD-003",
                    material_id="W-001",
                    quantity=Decimal("10.00"),
                    work_type=WorkType.IN_HOUSE,
                ),
                BOMItem(
                    product_id="PROD-003",
                    material_id="T-001",
                    quantity=Decimal("4"),
                    work_type=WorkType.OUTSOURCE,
                ),
            ],
        )

        await repo.create(bom)

        items = await repo.get_items_by_product_id("PROD-003")

        assert len(items) == 2

    async def test_get_bom_items_by_work_type(self, db_session):
        """작업 유형별 BOM 항목 조회."""
        from backend.domain.entities.bom import BOM, BOMItem, WorkType
        from backend.infrastructure.persistence.repositories.bom_repository import (
            SQLAlchemyBOMRepository,
        )

        repo = SQLAlchemyBOMRepository(db_session)

        bom = BOM(
            product_id="PROD-004",
            version="1.0",
            items=[
                BOMItem(
                    product_id="PROD-004",
                    material_id="W-001",
                    quantity=Decimal("10.00"),
                    work_type=WorkType.IN_HOUSE,
                ),
                BOMItem(
                    product_id="PROD-004",
                    material_id="T-001",
                    quantity=Decimal("4"),
                    work_type=WorkType.OUTSOURCE,
                ),
            ],
        )

        await repo.create(bom)

        in_house = await repo.get_items_by_work_type("PROD-004", WorkType.IN_HOUSE)
        outsource = await repo.get_items_by_work_type("PROD-004", WorkType.OUTSOURCE)

        assert len(in_house) == 1
        assert len(outsource) == 1

    async def test_add_bom_item(self, db_session):
        """BOM 항목 추가."""
        from backend.domain.entities.bom import BOM, BOMItem, WorkType
        from backend.infrastructure.persistence.repositories.bom_repository import (
            SQLAlchemyBOMRepository,
        )

        repo = SQLAlchemyBOMRepository(db_session)

        bom = BOM(
            product_id="PROD-005",
            version="1.0",
            items=[],
        )

        await repo.create(bom)

        new_item = BOMItem(
            product_id="PROD-005",
            material_id="W-001",
            quantity=Decimal("10.00"),
            work_type=WorkType.IN_HOUSE,
        )

        await repo.add_item(new_item)

        found = await repo.get_by_product_id("PROD-005")
        assert len(found.items) == 1

    async def test_update_bom_item(self, db_session):
        """BOM 항목 수정."""
        from backend.domain.entities.bom import BOM, BOMItem, WorkType
        from backend.infrastructure.persistence.repositories.bom_repository import (
            SQLAlchemyBOMRepository,
        )

        repo = SQLAlchemyBOMRepository(db_session)

        bom = BOM(
            product_id="PROD-006",
            version="1.0",
            items=[
                BOMItem(
                    product_id="PROD-006",
                    material_id="W-001",
                    quantity=Decimal("10.00"),
                    work_type=WorkType.IN_HOUSE,
                ),
            ],
        )

        created = await repo.create(bom)

        item = created.items[0]
        item.quantity = Decimal("20.00")

        await repo.update_item(item)

        found = await repo.get_by_product_id("PROD-006")
        assert found.items[0].quantity == Decimal("20.00")

    async def test_delete_bom(self, db_session):
        """BOM 삭제."""
        from backend.domain.entities.bom import BOM, BOMItem, WorkType
        from backend.infrastructure.persistence.repositories.bom_repository import (
            SQLAlchemyBOMRepository,
        )

        repo = SQLAlchemyBOMRepository(db_session)

        bom = BOM(
            product_id="PROD-007",
            version="1.0",
            items=[
                BOMItem(
                    product_id="PROD-007",
                    material_id="W-001",
                    quantity=Decimal("10.00"),
                    work_type=WorkType.IN_HOUSE,
                ),
            ],
        )

        await repo.create(bom)

        deleted = await repo.delete("PROD-007")

        assert deleted is True
        assert await repo.get_by_product_id("PROD-007") is None
