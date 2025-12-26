"""Test 5.1.4: BOM Use Cases 테스트.

TDD RED Phase: BOM 관리 CRUD Use Cases 테스트.
"""

from decimal import Decimal
from unittest.mock import AsyncMock

import pytest

from backend.domain.entities.bom import BOM, BOMItem, WorkType


class TestCreateBOMUseCase:
    """BOM 생성 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock BOMRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_create_bom_success(self, mock_repository: AsyncMock) -> None:
        """BOM 생성 성공."""
        from backend.application.use_cases.bom_use_cases import CreateBOMUseCase
        from backend.application.dtos.bom_dto import CreateBOMDTO, BOMItemDTO

        dto = CreateBOMDTO(
            product_id="P-WH-001",
            version="1.0",
            items=[
                BOMItemDTO(
                    material_id="W-001",
                    quantity=Decimal("2.5"),
                    work_type="IN_HOUSE",
                    sequence=1,
                ),
                BOMItemDTO(
                    material_id="T-001",
                    quantity=Decimal("4"),
                    work_type="IN_HOUSE",
                    sequence=2,
                ),
            ],
        )

        expected = BOM(
            product_id="P-WH-001",
            version="1.0",
            items=[
                BOMItem(
                    product_id="P-WH-001",
                    material_id="W-001",
                    quantity=Decimal("2.5"),
                    work_type=WorkType.IN_HOUSE,
                    sequence=1,
                ),
                BOMItem(
                    product_id="P-WH-001",
                    material_id="T-001",
                    quantity=Decimal("4"),
                    work_type=WorkType.IN_HOUSE,
                    sequence=2,
                ),
            ],
        )
        mock_repository.create.return_value = expected

        use_case = CreateBOMUseCase(mock_repository)

        # Act
        result = await use_case.execute(dto)

        # Assert
        assert result.product_id == "P-WH-001"
        assert len(result.items) == 2


class TestGetBOMUseCase:
    """BOM 조회 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock BOMRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_get_bom_by_product_id(self, mock_repository: AsyncMock) -> None:
        """완제품 ID로 BOM 조회."""
        from backend.application.use_cases.bom_use_cases import GetBOMUseCase

        expected = BOM(
            product_id="P-WH-001",
            version="1.0",
            items=[
                BOMItem(
                    product_id="P-WH-001",
                    material_id="W-001",
                    quantity=Decimal("2.5"),
                    work_type=WorkType.IN_HOUSE,
                ),
            ],
        )
        mock_repository.get_by_product_id.return_value = expected

        use_case = GetBOMUseCase(mock_repository)

        # Act
        result = await use_case.execute("P-WH-001")

        # Assert
        assert result is not None
        assert result.product_id == "P-WH-001"

    @pytest.mark.asyncio
    async def test_get_bom_not_found_returns_none(
        self, mock_repository: AsyncMock
    ) -> None:
        """BOM 없는 경우 None 반환."""
        from backend.application.use_cases.bom_use_cases import GetBOMUseCase

        mock_repository.get_by_product_id.return_value = None

        use_case = GetBOMUseCase(mock_repository)

        # Act
        result = await use_case.execute("NONEXISTENT")

        # Assert
        assert result is None


class TestAddBOMItemUseCase:
    """BOM 항목 추가 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock BOMRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_add_bom_item_success(self, mock_repository: AsyncMock) -> None:
        """BOM 항목 추가 성공."""
        from backend.application.use_cases.bom_use_cases import AddBOMItemUseCase
        from backend.application.dtos.bom_dto import BOMItemDTO

        existing_bom = BOM(
            product_id="P-WH-001",
            version="1.0",
            items=[],
        )
        mock_repository.get_by_product_id.return_value = existing_bom

        new_item = BOMItem(
            product_id="P-WH-001",
            material_id="W-001",
            quantity=Decimal("2.5"),
            work_type=WorkType.IN_HOUSE,
            sequence=1,
        )
        mock_repository.add_item.return_value = new_item

        dto = BOMItemDTO(
            material_id="W-001",
            quantity=Decimal("2.5"),
            work_type="IN_HOUSE",
            sequence=1,
        )

        use_case = AddBOMItemUseCase(mock_repository)

        # Act
        result = await use_case.execute("P-WH-001", dto)

        # Assert
        assert result.material_id == "W-001"


class TestRemoveBOMItemUseCase:
    """BOM 항목 삭제 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock BOMRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_remove_bom_item_success(self, mock_repository: AsyncMock) -> None:
        """BOM 항목 삭제 성공."""
        from backend.application.use_cases.bom_use_cases import RemoveBOMItemUseCase

        # BOM with item to be removed
        bom = BOM(
            product_id="P-WH-001",
            items=[
                BOMItem(
                    product_id="P-WH-001",
                    material_id="W-001",
                    quantity=Decimal("10"),
                    work_type=WorkType.IN_HOUSE,
                ),
                BOMItem(
                    product_id="P-WH-001",
                    material_id="W-002",
                    quantity=Decimal("5"),
                    work_type=WorkType.IN_HOUSE,
                ),
            ],
        )
        mock_repository.get_by_product_id.return_value = bom

        use_case = RemoveBOMItemUseCase(mock_repository)

        # Act
        result = await use_case.execute("P-WH-001", "W-001")

        # Assert
        assert result is True
        assert len(bom.items) == 1
        assert bom.items[0].material_id == "W-002"


class TestDeleteBOMUseCase:
    """BOM 삭제 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock BOMRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_delete_bom_success(self, mock_repository: AsyncMock) -> None:
        """BOM 삭제 성공."""
        from backend.application.use_cases.bom_use_cases import DeleteBOMUseCase

        mock_repository.delete.return_value = True

        use_case = DeleteBOMUseCase(mock_repository)

        # Act
        result = await use_case.execute("P-WH-001")

        # Assert
        assert result is True
