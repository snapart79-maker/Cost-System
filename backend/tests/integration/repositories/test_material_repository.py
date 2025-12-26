"""Test 4.1: MaterialRepository 통합 테스트.

TDD RED Phase: 자재 저장소 CRUD 테스트.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal

import pytest

pytestmark = pytest.mark.asyncio


class TestMaterialRepository:
    """MaterialRepository 통합 테스트."""

    async def test_create_material(self, db_session, sample_material_data):
        """자재 생성."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )
        from backend.infrastructure.persistence.repositories.material_repository import (
            SQLAlchemyMaterialRepository,
        )

        repo = SQLAlchemyMaterialRepository(db_session)

        material = Material(
            material_id=sample_material_data["material_id"],
            material_name=sample_material_data["material_name"],
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=sample_material_data["unit_price"],
            effective_date=sample_material_data["effective_date"],
            scrap_rate=sample_material_data["scrap_rate"],
        )

        created = await repo.create(material)

        assert created.material_id == "W-001"
        assert created.material_name == "AVS 0.5sq"

    async def test_get_material_by_id(self, db_session, sample_material_data):
        """ID로 자재 조회."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )
        from backend.infrastructure.persistence.repositories.material_repository import (
            SQLAlchemyMaterialRepository,
        )

        repo = SQLAlchemyMaterialRepository(db_session)

        material = Material(
            material_id="W-002",
            material_name="Test Wire",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("10.0000"),
            effective_date=date(2025, 1, 1),
        )

        await repo.create(material)

        found = await repo.get_by_id("W-002")

        assert found is not None
        assert found.material_id == "W-002"
        assert found.material_name == "Test Wire"

    async def test_get_material_by_id_not_found(self, db_session):
        """존재하지 않는 자재 조회."""
        from backend.infrastructure.persistence.repositories.material_repository import (
            SQLAlchemyMaterialRepository,
        )

        repo = SQLAlchemyMaterialRepository(db_session)

        found = await repo.get_by_id("NOT-EXISTS")

        assert found is None

    async def test_get_all_materials(self, db_session):
        """모든 자재 조회."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )
        from backend.infrastructure.persistence.repositories.material_repository import (
            SQLAlchemyMaterialRepository,
        )

        repo = SQLAlchemyMaterialRepository(db_session)

        # 여러 자재 생성
        for i in range(3):
            material = Material(
                material_id=f"W-00{i}",
                material_name=f"Wire {i}",
                material_type=MaterialType.WIRE,
                unit=MaterialUnit.MTR,
                unit_price=Decimal("10.0000"),
                effective_date=date(2025, 1, 1),
            )
            await repo.create(material)

        all_materials = await repo.get_all()

        assert len(all_materials) == 3

    async def test_get_materials_by_type(self, db_session):
        """유형별 자재 조회."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )
        from backend.infrastructure.persistence.repositories.material_repository import (
            SQLAlchemyMaterialRepository,
        )

        repo = SQLAlchemyMaterialRepository(db_session)

        # 다른 유형의 자재들 생성
        wire = Material(
            material_id="W-001",
            material_name="Wire",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("10.0000"),
            effective_date=date(2025, 1, 1),
        )
        terminal = Material(
            material_id="T-001",
            material_name="Terminal",
            material_type=MaterialType.TERMINAL,
            unit=MaterialUnit.EA,
            unit_price=Decimal("5.0000"),
            effective_date=date(2025, 1, 1),
        )

        await repo.create(wire)
        await repo.create(terminal)

        wires = await repo.get_by_type(MaterialType.WIRE)
        terminals = await repo.get_by_type(MaterialType.TERMINAL)

        assert len(wires) == 1
        assert len(terminals) == 1
        assert wires[0].material_type == MaterialType.WIRE

    async def test_update_material(self, db_session):
        """자재 수정."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )
        from backend.infrastructure.persistence.repositories.material_repository import (
            SQLAlchemyMaterialRepository,
        )

        repo = SQLAlchemyMaterialRepository(db_session)

        material = Material(
            material_id="W-001",
            material_name="Old Name",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("10.0000"),
            effective_date=date(2025, 1, 1),
        )

        created = await repo.create(material)

        # 수정
        created.material_name = "New Name"
        created.unit_price = Decimal("15.0000")

        updated = await repo.update(created)

        assert updated.material_name == "New Name"
        assert updated.unit_price == Decimal("15.0000")

    async def test_delete_material(self, db_session):
        """자재 삭제."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )
        from backend.infrastructure.persistence.repositories.material_repository import (
            SQLAlchemyMaterialRepository,
        )

        repo = SQLAlchemyMaterialRepository(db_session)

        material = Material(
            material_id="W-001",
            material_name="To Delete",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("10.0000"),
            effective_date=date(2025, 1, 1),
        )

        await repo.create(material)

        deleted = await repo.delete("W-001")

        assert deleted is True

        found = await repo.get_by_id("W-001")
        assert found is None

    async def test_delete_material_not_found(self, db_session):
        """존재하지 않는 자재 삭제."""
        from backend.infrastructure.persistence.repositories.material_repository import (
            SQLAlchemyMaterialRepository,
        )

        repo = SQLAlchemyMaterialRepository(db_session)

        deleted = await repo.delete("NOT-EXISTS")

        assert deleted is False
