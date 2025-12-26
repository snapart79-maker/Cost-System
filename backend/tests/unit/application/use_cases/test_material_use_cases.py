"""Test 5.1.1: Material Use Cases 테스트.

TDD RED Phase: 자재 마스터 CRUD Use Cases 테스트.
"""

from datetime import date
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

import pytest

from backend.domain.entities.material import Material, MaterialType, MaterialUnit


class TestCreateMaterialUseCase:
    """자재 생성 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock MaterialRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_create_material_success(self, mock_repository: AsyncMock) -> None:
        """자재 생성 성공."""
        from backend.application.use_cases.material_use_cases import (
            CreateMaterialUseCase,
        )
        from backend.application.dtos.material_dto import CreateMaterialDTO

        # Arrange
        dto = CreateMaterialDTO(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type="WIRE",
            unit="MTR",
            unit_price=Decimal("15.5000"),
            effective_date=date(2025, 1, 1),
            specification="0.5sq 흑색",
            scrap_rate=Decimal("0.05"),
        )

        expected_material = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.5000"),
            effective_date=date(2025, 1, 1),
            specification="0.5sq 흑색",
            scrap_rate=Decimal("0.05"),
        )
        mock_repository.get_by_id.return_value = None  # 중복 없음
        mock_repository.create.return_value = expected_material

        use_case = CreateMaterialUseCase(mock_repository)

        # Act
        result = await use_case.execute(dto)

        # Assert
        assert result.material_id == "W-001"
        assert result.material_name == "AVS 0.5sq"
        mock_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_material_duplicate_raises_error(
        self, mock_repository: AsyncMock
    ) -> None:
        """중복 자재 생성 시 오류."""
        from backend.application.use_cases.material_use_cases import (
            CreateMaterialUseCase,
            MaterialAlreadyExistsError,
        )
        from backend.application.dtos.material_dto import CreateMaterialDTO

        # Arrange
        dto = CreateMaterialDTO(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type="WIRE",
            unit="MTR",
            unit_price=Decimal("15.5000"),
            effective_date=date(2025, 1, 1),
        )

        # 이미 존재하는 자재
        existing = Material(
            material_id="W-001",
            material_name="기존 자재",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("10.0000"),
            effective_date=date(2025, 1, 1),
        )
        mock_repository.get_by_id.return_value = existing

        use_case = CreateMaterialUseCase(mock_repository)

        # Act & Assert
        with pytest.raises(MaterialAlreadyExistsError):
            await use_case.execute(dto)


class TestGetMaterialUseCase:
    """자재 조회 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock MaterialRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_get_material_by_id_success(
        self, mock_repository: AsyncMock
    ) -> None:
        """ID로 자재 조회 성공."""
        from backend.application.use_cases.material_use_cases import GetMaterialUseCase

        # Arrange
        expected = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.5000"),
            effective_date=date(2025, 1, 1),
        )
        mock_repository.get_by_id.return_value = expected

        use_case = GetMaterialUseCase(mock_repository)

        # Act
        result = await use_case.execute("W-001")

        # Assert
        assert result is not None
        assert result.material_id == "W-001"
        mock_repository.get_by_id.assert_called_once_with("W-001")

    @pytest.mark.asyncio
    async def test_get_material_not_found_returns_none(
        self, mock_repository: AsyncMock
    ) -> None:
        """존재하지 않는 자재 조회 시 None 반환."""
        from backend.application.use_cases.material_use_cases import GetMaterialUseCase

        mock_repository.get_by_id.return_value = None

        use_case = GetMaterialUseCase(mock_repository)

        # Act
        result = await use_case.execute("NONEXISTENT")

        # Assert
        assert result is None


class TestListMaterialsUseCase:
    """자재 목록 조회 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock MaterialRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_list_all_materials(self, mock_repository: AsyncMock) -> None:
        """전체 자재 목록 조회."""
        from backend.application.use_cases.material_use_cases import (
            ListMaterialsUseCase,
        )

        # Arrange
        materials = [
            Material(
                material_id="W-001",
                material_name="AVS 0.5sq",
                material_type=MaterialType.WIRE,
                unit=MaterialUnit.MTR,
                unit_price=Decimal("15.5000"),
                effective_date=date(2025, 1, 1),
            ),
            Material(
                material_id="T-001",
                material_name="터미널 A",
                material_type=MaterialType.TERMINAL,
                unit=MaterialUnit.EA,
                unit_price=Decimal("5.0000"),
                effective_date=date(2025, 1, 1),
            ),
        ]
        mock_repository.get_all.return_value = materials

        use_case = ListMaterialsUseCase(mock_repository)

        # Act
        result = await use_case.execute()

        # Assert
        assert len(result) == 2
        mock_repository.get_all.assert_called_once()

    @pytest.mark.asyncio
    async def test_list_materials_by_type(self, mock_repository: AsyncMock) -> None:
        """유형별 자재 목록 조회."""
        from backend.application.use_cases.material_use_cases import (
            ListMaterialsUseCase,
        )

        # Arrange
        wires = [
            Material(
                material_id="W-001",
                material_name="AVS 0.5sq",
                material_type=MaterialType.WIRE,
                unit=MaterialUnit.MTR,
                unit_price=Decimal("15.5000"),
                effective_date=date(2025, 1, 1),
            ),
        ]
        mock_repository.get_by_type.return_value = wires

        use_case = ListMaterialsUseCase(mock_repository)

        # Act
        result = await use_case.execute(material_type=MaterialType.WIRE)

        # Assert
        assert len(result) == 1
        assert result[0].material_type == MaterialType.WIRE


class TestUpdateMaterialUseCase:
    """자재 수정 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock MaterialRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_update_material_success(self, mock_repository: AsyncMock) -> None:
        """자재 수정 성공."""
        from backend.application.use_cases.material_use_cases import (
            UpdateMaterialUseCase,
        )
        from backend.application.dtos.material_dto import UpdateMaterialDTO

        # Arrange
        existing = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.5000"),
            effective_date=date(2025, 1, 1),
        )
        mock_repository.get_by_id.return_value = existing

        updated = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("16.0000"),  # 단가 변경
            effective_date=date(2025, 2, 1),
        )
        mock_repository.update.return_value = updated

        dto = UpdateMaterialDTO(
            material_id="W-001",
            unit_price=Decimal("16.0000"),
            effective_date=date(2025, 2, 1),
        )

        use_case = UpdateMaterialUseCase(mock_repository)

        # Act
        result = await use_case.execute(dto)

        # Assert
        assert result.unit_price == Decimal("16.0000")
        mock_repository.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_nonexistent_material_raises_error(
        self, mock_repository: AsyncMock
    ) -> None:
        """존재하지 않는 자재 수정 시 오류."""
        from backend.application.use_cases.material_use_cases import (
            MaterialNotFoundError,
            UpdateMaterialUseCase,
        )
        from backend.application.dtos.material_dto import UpdateMaterialDTO

        mock_repository.get_by_id.return_value = None

        dto = UpdateMaterialDTO(
            material_id="NONEXISTENT",
            unit_price=Decimal("16.0000"),
        )

        use_case = UpdateMaterialUseCase(mock_repository)

        # Act & Assert
        with pytest.raises(MaterialNotFoundError):
            await use_case.execute(dto)


class TestDeleteMaterialUseCase:
    """자재 삭제 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock MaterialRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_delete_material_success(self, mock_repository: AsyncMock) -> None:
        """자재 삭제 성공."""
        from backend.application.use_cases.material_use_cases import (
            DeleteMaterialUseCase,
        )

        mock_repository.delete.return_value = True

        use_case = DeleteMaterialUseCase(mock_repository)

        # Act
        result = await use_case.execute("W-001")

        # Assert
        assert result is True
        mock_repository.delete.assert_called_once_with("W-001")

    @pytest.mark.asyncio
    async def test_delete_nonexistent_material_returns_false(
        self, mock_repository: AsyncMock
    ) -> None:
        """존재하지 않는 자재 삭제 시 False 반환."""
        from backend.application.use_cases.material_use_cases import (
            DeleteMaterialUseCase,
        )

        mock_repository.delete.return_value = False

        use_case = DeleteMaterialUseCase(mock_repository)

        # Act
        result = await use_case.execute("NONEXISTENT")

        # Assert
        assert result is False
