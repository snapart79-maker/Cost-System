"""Test 5.1.2: Process Use Cases 테스트.

TDD RED Phase: 공정 마스터 CRUD Use Cases 테스트.
"""

from decimal import Decimal
from unittest.mock import AsyncMock

import pytest

from backend.domain.entities.process import Process, WorkType


class TestCreateProcessUseCase:
    """공정 생성 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock ProcessRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_create_process_success(self, mock_repository: AsyncMock) -> None:
        """공정 생성 성공."""
        from backend.application.use_cases.process_use_cases import (
            CreateProcessUseCase,
        )
        from backend.application.dtos.process_dto import CreateProcessDTO

        # Arrange
        dto = CreateProcessDTO(
            process_id="P-001",
            process_name="절압착",
            work_type="IN_HOUSE",
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
            efficiency=Decimal("100.00"),
            description="자동압착 공정",
        )

        expected = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
            efficiency=Decimal("100.00"),
            description="자동압착 공정",
        )
        mock_repository.create.return_value = expected
        mock_repository.get_by_id.return_value = None  # 중복 없음

        use_case = CreateProcessUseCase(mock_repository)

        # Act
        result = await use_case.execute(dto)

        # Assert
        assert result.process_id == "P-001"
        assert result.process_name == "절압착"
        mock_repository.create.assert_called_once()


class TestGetProcessUseCase:
    """공정 조회 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock ProcessRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_get_process_by_id_success(
        self, mock_repository: AsyncMock
    ) -> None:
        """ID로 공정 조회 성공."""
        from backend.application.use_cases.process_use_cases import GetProcessUseCase

        expected = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
        )
        mock_repository.get_by_id.return_value = expected

        use_case = GetProcessUseCase(mock_repository)

        # Act
        result = await use_case.execute("P-001")

        # Assert
        assert result is not None
        assert result.process_id == "P-001"


class TestListProcessesUseCase:
    """공정 목록 조회 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock ProcessRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_list_all_processes(self, mock_repository: AsyncMock) -> None:
        """전체 공정 목록 조회."""
        from backend.application.use_cases.process_use_cases import (
            ListProcessesUseCase,
        )

        processes = [
            Process(
                process_id="P-001",
                process_name="절압착",
                work_type=WorkType.IN_HOUSE,
                labor_rate=Decimal("25000.00"),
                machine_cost=Decimal("5000.00"),
            ),
            Process(
                process_id="P-002",
                process_name="조립",
                work_type=WorkType.IN_HOUSE,
                labor_rate=Decimal("22000.00"),
                machine_cost=Decimal("3000.00"),
            ),
        ]
        mock_repository.get_all.return_value = processes

        use_case = ListProcessesUseCase(mock_repository)

        # Act
        result = await use_case.execute()

        # Assert
        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_list_processes_by_work_type(
        self, mock_repository: AsyncMock
    ) -> None:
        """작업 유형별 공정 목록 조회."""
        from backend.application.use_cases.process_use_cases import (
            ListProcessesUseCase,
        )

        in_house = [
            Process(
                process_id="P-001",
                process_name="절압착",
                work_type=WorkType.IN_HOUSE,
                labor_rate=Decimal("25000.00"),
                machine_cost=Decimal("5000.00"),
            ),
        ]
        mock_repository.get_by_work_type.return_value = in_house

        use_case = ListProcessesUseCase(mock_repository)

        # Act
        result = await use_case.execute(work_type=WorkType.IN_HOUSE)

        # Assert
        assert len(result) == 1
        assert result[0].work_type == WorkType.IN_HOUSE


class TestUpdateProcessUseCase:
    """공정 수정 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock ProcessRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_update_process_success(self, mock_repository: AsyncMock) -> None:
        """공정 수정 성공."""
        from backend.application.use_cases.process_use_cases import (
            UpdateProcessUseCase,
        )
        from backend.application.dtos.process_dto import UpdateProcessDTO

        existing = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
        )
        mock_repository.get_by_id.return_value = existing

        updated = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("26000.00"),
            machine_cost=Decimal("5000.00"),
        )
        mock_repository.update.return_value = updated

        dto = UpdateProcessDTO(
            process_id="P-001",
            labor_rate=Decimal("26000.00"),
        )

        use_case = UpdateProcessUseCase(mock_repository)

        # Act
        result = await use_case.execute(dto)

        # Assert
        assert result.labor_rate == Decimal("26000.00")


class TestDeleteProcessUseCase:
    """공정 삭제 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock ProcessRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_delete_process_success(self, mock_repository: AsyncMock) -> None:
        """공정 삭제 성공."""
        from backend.application.use_cases.process_use_cases import (
            DeleteProcessUseCase,
        )

        mock_repository.delete.return_value = True

        use_case = DeleteProcessUseCase(mock_repository)

        # Act
        result = await use_case.execute("P-001")

        # Assert
        assert result is True
