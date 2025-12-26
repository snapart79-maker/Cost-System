"""Test 4.2: ProcessRepository 통합 테스트.

TDD RED Phase: 공정 저장소 CRUD 테스트.
"""

from __future__ import annotations

from decimal import Decimal

import pytest

pytestmark = pytest.mark.asyncio


class TestProcessRepository:
    """ProcessRepository 통합 테스트."""

    async def test_create_process(self, db_session, sample_process_data):
        """공정 생성."""
        from backend.domain.entities.process import Process, WorkType
        from backend.infrastructure.persistence.repositories.process_repository import (
            SQLAlchemyProcessRepository,
        )

        repo = SQLAlchemyProcessRepository(db_session)

        process = Process(
            process_id=sample_process_data["process_id"],
            process_name=sample_process_data["process_name"],
            work_type=WorkType.IN_HOUSE,
            labor_rate=sample_process_data["labor_rate"],
            machine_cost=sample_process_data["machine_cost"],
            efficiency=sample_process_data["efficiency"],
        )

        created = await repo.create(process)

        assert created.process_id == "P-001"
        assert created.process_name == "절압착"

    async def test_get_process_by_id(self, db_session):
        """ID로 공정 조회."""
        from backend.domain.entities.process import Process, WorkType
        from backend.infrastructure.persistence.repositories.process_repository import (
            SQLAlchemyProcessRepository,
        )

        repo = SQLAlchemyProcessRepository(db_session)

        process = Process(
            process_id="P-002",
            process_name="테이핑",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("20000.00"),
            machine_cost=Decimal("3000.00"),
        )

        await repo.create(process)

        found = await repo.get_by_id("P-002")

        assert found is not None
        assert found.process_name == "테이핑"

    async def test_get_all_processes(self, db_session):
        """모든 공정 조회."""
        from backend.domain.entities.process import Process, WorkType
        from backend.infrastructure.persistence.repositories.process_repository import (
            SQLAlchemyProcessRepository,
        )

        repo = SQLAlchemyProcessRepository(db_session)

        for i in range(3):
            process = Process(
                process_id=f"P-00{i}",
                process_name=f"공정 {i}",
                work_type=WorkType.IN_HOUSE,
                labor_rate=Decimal("20000.00"),
                machine_cost=Decimal("3000.00"),
            )
            await repo.create(process)

        all_processes = await repo.get_all()

        assert len(all_processes) == 3

    async def test_get_processes_by_work_type(self, db_session):
        """작업 유형별 공정 조회."""
        from backend.domain.entities.process import Process, WorkType
        from backend.infrastructure.persistence.repositories.process_repository import (
            SQLAlchemyProcessRepository,
        )

        repo = SQLAlchemyProcessRepository(db_session)

        in_house = Process(
            process_id="P-001",
            process_name="내작공정",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("20000.00"),
            machine_cost=Decimal("3000.00"),
        )
        outsource = Process(
            process_id="P-002",
            process_name="외작공정",
            work_type=WorkType.OUTSOURCE,
            labor_rate=Decimal("15000.00"),
            machine_cost=Decimal("2000.00"),
        )

        await repo.create(in_house)
        await repo.create(outsource)

        in_house_list = await repo.get_by_work_type(WorkType.IN_HOUSE)
        outsource_list = await repo.get_by_work_type(WorkType.OUTSOURCE)

        assert len(in_house_list) == 1
        assert len(outsource_list) == 1

    async def test_update_process(self, db_session):
        """공정 수정."""
        from backend.domain.entities.process import Process, WorkType
        from backend.infrastructure.persistence.repositories.process_repository import (
            SQLAlchemyProcessRepository,
        )

        repo = SQLAlchemyProcessRepository(db_session)

        process = Process(
            process_id="P-001",
            process_name="Old Name",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("20000.00"),
            machine_cost=Decimal("3000.00"),
        )

        created = await repo.create(process)

        created.process_name = "New Name"
        created.labor_rate = Decimal("25000.00")

        updated = await repo.update(created)

        assert updated.process_name == "New Name"
        assert updated.labor_rate == Decimal("25000.00")

    async def test_delete_process(self, db_session):
        """공정 삭제."""
        from backend.domain.entities.process import Process, WorkType
        from backend.infrastructure.persistence.repositories.process_repository import (
            SQLAlchemyProcessRepository,
        )

        repo = SQLAlchemyProcessRepository(db_session)

        process = Process(
            process_id="P-001",
            process_name="To Delete",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("20000.00"),
            machine_cost=Decimal("3000.00"),
        )

        await repo.create(process)

        deleted = await repo.delete("P-001")

        assert deleted is True
        assert await repo.get_by_id("P-001") is None
