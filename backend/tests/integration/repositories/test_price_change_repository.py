"""Test 4.5: PriceChangeRepository 통합 테스트.

TDD RED Phase: 단가 변경 저장소 CRUD 테스트.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal

import pytest

pytestmark = pytest.mark.asyncio


class TestPriceChangeRepository:
    """PriceChangeRepository 통합 테스트."""

    async def test_create_price_change(self, db_session):
        """단가 변경 생성."""
        from backend.domain.entities.price_change import (
            ChangeType,
            MaterialChangeDetail,
            PriceChange,
        )
        from backend.infrastructure.persistence.repositories.price_change_repository import (
            SQLAlchemyPriceChangeRepository,
        )

        repo = SQLAlchemyPriceChangeRepository(db_session)

        change = PriceChange(
            change_id="CHG-001",
            product_id="PROD-001",
            change_type=ChangeType.MATERIAL,
            change_reason="원자재 가격 인상",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1000.00"),
            after_cost=Decimal("1100.00"),
            material_changes=[
                MaterialChangeDetail(
                    material_id="W-001",
                    before_price=Decimal("10.0000"),
                    after_price=Decimal("11.0000"),
                    reason="구리 가격 인상",
                ),
            ],
        )

        created = await repo.create(change)

        assert created.change_id == "CHG-001"
        assert created.change_type == ChangeType.MATERIAL

    async def test_get_price_change_by_id(self, db_session):
        """ID로 단가 변경 조회."""
        from backend.domain.entities.price_change import ChangeType, PriceChange
        from backend.infrastructure.persistence.repositories.price_change_repository import (
            SQLAlchemyPriceChangeRepository,
        )

        repo = SQLAlchemyPriceChangeRepository(db_session)

        change = PriceChange(
            change_id="CHG-002",
            product_id="PROD-001",
            change_type=ChangeType.PROCESS,
            change_reason="임율 인상",
            effective_date=date(2025, 3, 1),
            before_cost=Decimal("1000.00"),
            after_cost=Decimal("1050.00"),
        )

        await repo.create(change)

        found = await repo.get_by_id("CHG-002")

        assert found is not None
        assert found.change_reason == "임율 인상"

    async def test_get_price_changes_by_product_id(self, db_session):
        """완제품 ID로 단가 변경 조회."""
        from backend.domain.entities.price_change import ChangeType, PriceChange
        from backend.infrastructure.persistence.repositories.price_change_repository import (
            SQLAlchemyPriceChangeRepository,
        )

        repo = SQLAlchemyPriceChangeRepository(db_session)

        for i in range(3):
            change = PriceChange(
                change_id=f"CHG-00{i}",
                product_id="PROD-001",
                change_type=ChangeType.MATERIAL,
                change_reason=f"변경 {i}",
                effective_date=date(2025, 1, i + 1),
                before_cost=Decimal("1000.00"),
                after_cost=Decimal("1100.00"),
            )
            await repo.create(change)

        changes = await repo.get_by_product_id("PROD-001")

        assert len(changes) == 3

    async def test_get_price_changes_by_date_range(self, db_session):
        """기간별 단가 변경 조회."""
        from backend.domain.entities.price_change import ChangeType, PriceChange
        from backend.infrastructure.persistence.repositories.price_change_repository import (
            SQLAlchemyPriceChangeRepository,
        )

        repo = SQLAlchemyPriceChangeRepository(db_session)

        dates = [date(2025, 1, 15), date(2025, 2, 15), date(2025, 3, 15)]
        for i, d in enumerate(dates):
            change = PriceChange(
                change_id=f"CHG-10{i}",
                product_id="PROD-002",
                change_type=ChangeType.MATERIAL,
                change_reason=f"변경 {i}",
                effective_date=d,
                before_cost=Decimal("1000.00"),
                after_cost=Decimal("1100.00"),
            )
            await repo.create(change)

        # 2월만 조회
        changes = await repo.get_by_date_range(
            start_date=date(2025, 2, 1),
            end_date=date(2025, 2, 28),
        )

        assert len(changes) == 1
        assert changes[0].effective_date == date(2025, 2, 15)

    async def test_get_price_changes_by_change_type(self, db_session):
        """변경 유형별 단가 변경 조회."""
        from backend.domain.entities.price_change import ChangeType, PriceChange
        from backend.infrastructure.persistence.repositories.price_change_repository import (
            SQLAlchemyPriceChangeRepository,
        )

        repo = SQLAlchemyPriceChangeRepository(db_session)

        material_change = PriceChange(
            change_id="CHG-201",
            product_id="PROD-003",
            change_type=ChangeType.MATERIAL,
            change_reason="재료비 변경",
            effective_date=date(2025, 1, 1),
            before_cost=Decimal("1000.00"),
            after_cost=Decimal("1100.00"),
        )
        process_change = PriceChange(
            change_id="CHG-202",
            product_id="PROD-003",
            change_type=ChangeType.PROCESS,
            change_reason="가공비 변경",
            effective_date=date(2025, 1, 1),
            before_cost=Decimal("1000.00"),
            after_cost=Decimal("1050.00"),
        )

        await repo.create(material_change)
        await repo.create(process_change)

        material_changes = await repo.get_by_change_type(ChangeType.MATERIAL)
        process_changes = await repo.get_by_change_type(ChangeType.PROCESS)

        assert len(material_changes) == 1
        assert len(process_changes) == 1

    async def test_get_latest_price_change(self, db_session):
        """최신 단가 변경 조회."""
        from backend.domain.entities.price_change import ChangeType, PriceChange
        from backend.infrastructure.persistence.repositories.price_change_repository import (
            SQLAlchemyPriceChangeRepository,
        )

        repo = SQLAlchemyPriceChangeRepository(db_session)

        old_change = PriceChange(
            change_id="CHG-301",
            product_id="PROD-004",
            change_type=ChangeType.MATERIAL,
            change_reason="이전 변경",
            effective_date=date(2025, 1, 1),
            before_cost=Decimal("1000.00"),
            after_cost=Decimal("1100.00"),
        )
        new_change = PriceChange(
            change_id="CHG-302",
            product_id="PROD-004",
            change_type=ChangeType.MATERIAL,
            change_reason="최신 변경",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1100.00"),
            after_cost=Decimal("1200.00"),
        )

        await repo.create(old_change)
        await repo.create(new_change)

        latest = await repo.get_latest_by_product_id("PROD-004")

        assert latest is not None
        assert latest.change_id == "CHG-302"
        assert latest.change_reason == "최신 변경"

    async def test_update_price_change(self, db_session):
        """단가 변경 수정."""
        from backend.domain.entities.price_change import ChangeType, PriceChange
        from backend.infrastructure.persistence.repositories.price_change_repository import (
            SQLAlchemyPriceChangeRepository,
        )

        repo = SQLAlchemyPriceChangeRepository(db_session)

        change = PriceChange(
            change_id="CHG-401",
            product_id="PROD-005",
            change_type=ChangeType.MATERIAL,
            change_reason="원본 사유",
            effective_date=date(2025, 1, 1),
            before_cost=Decimal("1000.00"),
            after_cost=Decimal("1100.00"),
        )

        created = await repo.create(change)

        created.change_reason = "수정된 사유"
        created.after_cost = Decimal("1150.00")

        updated = await repo.update(created)

        assert updated.change_reason == "수정된 사유"
        assert updated.after_cost == Decimal("1150.00")

    async def test_delete_price_change(self, db_session):
        """단가 변경 삭제."""
        from backend.domain.entities.price_change import ChangeType, PriceChange
        from backend.infrastructure.persistence.repositories.price_change_repository import (
            SQLAlchemyPriceChangeRepository,
        )

        repo = SQLAlchemyPriceChangeRepository(db_session)

        change = PriceChange(
            change_id="CHG-501",
            product_id="PROD-006",
            change_type=ChangeType.MATERIAL,
            change_reason="삭제할 변경",
            effective_date=date(2025, 1, 1),
            before_cost=Decimal("1000.00"),
            after_cost=Decimal("1100.00"),
        )

        await repo.create(change)

        deleted = await repo.delete("CHG-501")

        assert deleted is True
        assert await repo.get_by_id("CHG-501") is None
