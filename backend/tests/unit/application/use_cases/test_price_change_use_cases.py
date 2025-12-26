"""Test 5.2: Price Change Use Cases 테스트.

TDD RED Phase: 단가 변경 등록 및 관리 Use Cases 테스트.
PRD 4.2.2 단가 변경 이력 및 5.5 변경 영향 계산 기반.
"""

from datetime import date
from decimal import Decimal
from unittest.mock import AsyncMock

import pytest

from backend.domain.entities.bom import BOM, BOMItem, WorkType
from backend.domain.entities.material import Material, MaterialType, MaterialUnit
from backend.domain.entities.price_change import ChangeType, PriceChange
from backend.domain.entities.process import Process
from backend.domain.entities.process import WorkType as ProcessWorkType
from backend.domain.entities.product import Product, ProductStatus


class TestRegisterPriceChangeUseCase:
    """단가 변경 등록 Use Case 테스트.

    PRD 핵심 기능:
    - 변경 사유 입력 시 자동 원가 재계산
    - 변경 전/후 원가 비교 생성
    """

    @pytest.fixture
    def mock_repositories(self) -> dict:
        """Mock Repositories."""
        return {
            "price_change": AsyncMock(),
            "material": AsyncMock(),
            "process": AsyncMock(),
            "product": AsyncMock(),
            "bom": AsyncMock(),
        }

    @pytest.mark.asyncio
    async def test_register_material_price_change(
        self, mock_repositories: dict
    ) -> None:
        """자재 단가 변경 등록 - 자동 원가 재계산."""
        from backend.application.use_cases.price_change_use_cases import (
            RegisterPriceChangeUseCase,
        )
        from backend.application.dtos.price_change_dto import RegisterPriceChangeDTO

        # Arrange - 기존 데이터 설정
        material = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.00"),  # 변경 전 단가
            effective_date=date(2025, 1, 1),
        )
        mock_repositories["material"].get_by_id.return_value = material

        product = Product(
            product_id="P-WH-001",
            product_name="메인 와이어 하네스",
            status=ProductStatus.PRODUCTION,
        )
        mock_repositories["product"].get_by_id.return_value = product

        bom = BOM(
            product_id="P-WH-001",
            items=[
                BOMItem(
                    product_id="P-WH-001",
                    material_id="W-001",
                    quantity=Decimal("10"),
                    work_type=WorkType.IN_HOUSE,
                ),
            ],
        )
        mock_repositories["bom"].get_by_product_id.return_value = bom

        # 예상 결과
        expected_change = PriceChange(
            change_id="CHG-001",
            product_id="P-WH-001",
            change_type=ChangeType.MATERIAL,
            change_reason="자재 단가 인상",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1650.00"),
        )
        mock_repositories["price_change"].create.return_value = expected_change

        dto = RegisterPriceChangeDTO(
            product_id="P-WH-001",
            change_type="MATERIAL",
            change_reason="자재 단가 인상",
            effective_date=date(2025, 2, 1),
            material_changes=[
                {
                    "material_id": "W-001",
                    "new_price": Decimal("16.50"),
                }
            ],
        )

        use_case = RegisterPriceChangeUseCase(
            price_change_repo=mock_repositories["price_change"],
            material_repo=mock_repositories["material"],
            process_repo=mock_repositories["process"],
            product_repo=mock_repositories["product"],
            bom_repo=mock_repositories["bom"],
        )

        # Act
        result = await use_case.execute(dto)

        # Assert
        assert result.product_id == "P-WH-001"
        assert result.change_type == ChangeType.MATERIAL
        mock_repositories["price_change"].create.assert_called_once()

    @pytest.mark.asyncio
    async def test_register_process_change(self, mock_repositories: dict) -> None:
        """공정 변경 등록 (C/T, 임율 변경)."""
        from backend.application.use_cases.price_change_use_cases import (
            RegisterPriceChangeUseCase,
        )
        from backend.application.dtos.price_change_dto import RegisterPriceChangeDTO

        # Arrange
        process = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=ProcessWorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
        )
        mock_repositories["process"].get_by_id.return_value = process

        product = Product(
            product_id="P-WH-001",
            product_name="메인 와이어 하네스",
            status=ProductStatus.PRODUCTION,
        )
        mock_repositories["product"].get_by_id.return_value = product

        expected = PriceChange(
            change_id="CHG-002",
            product_id="P-WH-001",
            change_type=ChangeType.PROCESS,
            change_reason="C/T 단축",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1450.00"),
        )
        mock_repositories["price_change"].create.return_value = expected

        dto = RegisterPriceChangeDTO(
            product_id="P-WH-001",
            change_type="PROCESS",
            change_reason="C/T 단축",
            effective_date=date(2025, 2, 1),
            process_changes=[
                {
                    "process_id": "P-001",
                    "new_cycle_time": Decimal("8"),  # 기존 10초 → 8초
                }
            ],
        )

        use_case = RegisterPriceChangeUseCase(
            price_change_repo=mock_repositories["price_change"],
            material_repo=mock_repositories["material"],
            process_repo=mock_repositories["process"],
            product_repo=mock_repositories["product"],
            bom_repo=mock_repositories["bom"],
        )

        # Act
        result = await use_case.execute(dto)

        # Assert
        assert result.change_type == ChangeType.PROCESS

    @pytest.mark.asyncio
    async def test_register_combined_change(self, mock_repositories: dict) -> None:
        """복합 변경 등록 (재료비 + 가공비 동시 변경)."""
        from backend.application.use_cases.price_change_use_cases import (
            RegisterPriceChangeUseCase,
        )
        from backend.application.dtos.price_change_dto import RegisterPriceChangeDTO

        expected = PriceChange(
            change_id="CHG-003",
            product_id="P-WH-001",
            change_type=ChangeType.COMBINED,
            change_reason="자재 단가 인상 및 C/T 단축",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1550.00"),
        )
        mock_repositories["price_change"].create.return_value = expected
        mock_repositories["product"].get_by_id.return_value = Product(
            product_id="P-WH-001",
            product_name="메인 와이어 하네스",
            status=ProductStatus.PRODUCTION,
        )

        dto = RegisterPriceChangeDTO(
            product_id="P-WH-001",
            change_type="COMBINED",
            change_reason="자재 단가 인상 및 C/T 단축",
            effective_date=date(2025, 2, 1),
            material_changes=[{"material_id": "W-001", "new_price": Decimal("16.50")}],
            process_changes=[{"process_id": "P-001", "new_cycle_time": Decimal("8")}],
        )

        use_case = RegisterPriceChangeUseCase(
            price_change_repo=mock_repositories["price_change"],
            material_repo=mock_repositories["material"],
            process_repo=mock_repositories["process"],
            product_repo=mock_repositories["product"],
            bom_repo=mock_repositories["bom"],
        )

        # Act
        result = await use_case.execute(dto)

        # Assert
        assert result.change_type == ChangeType.COMBINED


class TestGetPriceChangeUseCase:
    """단가 변경 이력 조회 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock PriceChangeRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_get_price_change_by_id(self, mock_repository: AsyncMock) -> None:
        """ID로 단가 변경 이력 조회."""
        from backend.application.use_cases.price_change_use_cases import (
            GetPriceChangeUseCase,
        )

        expected = PriceChange(
            change_id="CHG-001",
            product_id="P-WH-001",
            change_type=ChangeType.MATERIAL,
            change_reason="자재 단가 인상",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1650.00"),
        )
        mock_repository.get_by_id.return_value = expected

        use_case = GetPriceChangeUseCase(mock_repository)

        # Act
        result = await use_case.execute("CHG-001")

        # Assert
        assert result is not None
        assert result.change_id == "CHG-001"


class TestListPriceChangesUseCase:
    """단가 변경 이력 목록 조회 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock PriceChangeRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_list_price_changes_by_product(
        self, mock_repository: AsyncMock
    ) -> None:
        """완제품별 단가 변경 이력 조회."""
        from backend.application.use_cases.price_change_use_cases import (
            ListPriceChangesUseCase,
        )

        changes = [
            PriceChange(
                change_id="CHG-001",
                product_id="P-WH-001",
                change_type=ChangeType.MATERIAL,
                change_reason="자재 단가 인상",
                effective_date=date(2025, 2, 1),
                before_cost=Decimal("1500.00"),
                after_cost=Decimal("1650.00"),
            ),
            PriceChange(
                change_id="CHG-002",
                product_id="P-WH-001",
                change_type=ChangeType.PROCESS,
                change_reason="C/T 단축",
                effective_date=date(2025, 3, 1),
                before_cost=Decimal("1650.00"),
                after_cost=Decimal("1600.00"),
            ),
        ]
        mock_repository.get_by_product_id.return_value = changes

        use_case = ListPriceChangesUseCase(mock_repository)

        # Act
        result = await use_case.execute(product_id="P-WH-001")

        # Assert
        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_list_price_changes_by_date_range(
        self, mock_repository: AsyncMock
    ) -> None:
        """기간별 단가 변경 이력 조회."""
        from backend.application.use_cases.price_change_use_cases import (
            ListPriceChangesUseCase,
        )

        changes = [
            PriceChange(
                change_id="CHG-001",
                product_id="P-WH-001",
                change_type=ChangeType.MATERIAL,
                change_reason="자재 단가 인상",
                effective_date=date(2025, 2, 1),
                before_cost=Decimal("1500.00"),
                after_cost=Decimal("1650.00"),
            ),
        ]
        mock_repository.get_by_date_range.return_value = changes

        use_case = ListPriceChangesUseCase(mock_repository)

        # Act
        result = await use_case.execute(
            start_date=date(2025, 1, 1),
            end_date=date(2025, 12, 31),
        )

        # Assert
        assert len(result) == 1


class TestCompareCostsUseCase:
    """변경 전/후 원가 비교 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock PriceChangeRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_compare_before_after_costs(
        self, mock_repository: AsyncMock
    ) -> None:
        """변경 전/후 원가 비교 상세."""
        from backend.application.use_cases.price_change_use_cases import (
            CompareCostsUseCase,
        )

        price_change = PriceChange(
            change_id="CHG-001",
            product_id="P-WH-001",
            change_type=ChangeType.MATERIAL,
            change_reason="자재 단가 인상",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1650.00"),
        )
        mock_repository.get_by_id.return_value = price_change

        use_case = CompareCostsUseCase(mock_repository)

        # Act
        result = await use_case.execute("CHG-001")

        # Assert
        assert result["before_cost"] == Decimal("1500.00")
        assert result["after_cost"] == Decimal("1650.00")
        assert result["difference"] == Decimal("150.00")
        assert result["change_rate"] == Decimal("10.00")  # 10% 인상
