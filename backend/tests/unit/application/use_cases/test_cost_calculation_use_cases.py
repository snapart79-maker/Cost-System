"""Test 5.4: Cost Calculation Use Cases 테스트.

TDD RED Phase: 원가 계산서 생성 Use Cases 테스트.
PRD 5장 원가 계산 로직 기반.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from unittest.mock import AsyncMock

import pytest

from backend.domain.entities.bom import BOM, BOMItem, WorkType
from backend.domain.entities.material import Material, MaterialType, MaterialUnit
from backend.domain.entities.process import Process
from backend.domain.entities.process import WorkType as ProcessWorkType
from backend.domain.entities.product import Product, ProductStatus


class TestCalculateCostUseCase:
    """원가 계산 Use Case 테스트.

    PRD 5장 원가 계산 로직:
    - 제조원가 = 재료비 + 노무비 + 경비
    - 구매원가 = 제조원가 + 재료관리비 + 일반관리비 + 불량비 + 이윤
    """

    @pytest.fixture
    def mock_repositories(self) -> dict:
        """Mock Repositories."""
        return {
            "material": AsyncMock(),
            "process": AsyncMock(),
            "product": AsyncMock(),
            "bom": AsyncMock(),
        }

    @pytest.mark.asyncio
    async def test_calculate_full_cost_breakdown(
        self, mock_repositories: dict
    ) -> None:
        """전체 원가 명세 계산."""
        from backend.application.use_cases.cost_calculation_use_cases import (
            CalculateCostUseCase,
        )
        from backend.application.dtos.cost_calculation_dto import (
            CalculateCostDTO,
            ProcessInfo,
        )

        # Arrange - 자재 데이터
        materials = {
            "W-001": Material(
                material_id="W-001",
                material_name="AVS 0.5sq",
                material_type=MaterialType.WIRE,
                unit=MaterialUnit.MTR,
                unit_price=Decimal("15.00"),
                effective_date=date(2025, 1, 1),
                scrap_rate=Decimal("0.05"),
            ),
            "T-001": Material(
                material_id="T-001",
                material_name="터미널 A",
                material_type=MaterialType.TERMINAL,
                unit=MaterialUnit.EA,
                unit_price=Decimal("5.00"),
                effective_date=date(2025, 1, 1),
            ),
        }

        async def get_material(mid: str) -> Material | None:
            return materials.get(mid)

        mock_repositories["material"].get_by_id.side_effect = get_material

        # BOM 데이터
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
                    material_id="T-001",
                    quantity=Decimal("4"),
                    work_type=WorkType.IN_HOUSE,
                ),
            ],
        )
        mock_repositories["bom"].get_by_product_id.return_value = bom

        # 공정 데이터
        process = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=ProcessWorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
            efficiency=Decimal("100.00"),
        )
        mock_repositories["process"].get_by_id.return_value = process

        dto = CalculateCostDTO(
            product_id="P-WH-001",
            processes=[
                ProcessInfo(
                    process_id="P-001",
                    cycle_time=Decimal("10"),
                    workers=Decimal("1"),
                ),
            ],
        )

        use_case = CalculateCostUseCase(
            material_repo=mock_repositories["material"],
            process_repo=mock_repositories["process"],
            bom_repo=mock_repositories["bom"],
        )

        # Act
        result = await use_case.execute(dto)

        # Assert - 구조 검증
        assert result.product_id == "P-WH-001"
        assert result.net_material_cost > Decimal("0")
        assert result.labor_cost > Decimal("0")
        assert result.machine_cost > Decimal("0")
        assert result.manufacturing_cost > Decimal("0")
        assert result.purchase_cost > Decimal("0")

    @pytest.mark.asyncio
    async def test_calculate_material_cost_with_scrap(
        self, mock_repositories: dict
    ) -> None:
        """SCRAP비 포함 재료비 계산."""
        from backend.application.use_cases.cost_calculation_use_cases import (
            CalculateCostUseCase,
        )
        from backend.application.dtos.cost_calculation_dto import CalculateCostDTO

        material = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.00"),
            effective_date=date(2025, 1, 1),
            scrap_rate=Decimal("0.05"),  # 5%
        )
        mock_repositories["material"].get_by_id.return_value = material

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

        dto = CalculateCostDTO(product_id="P-WH-001", processes=[])

        use_case = CalculateCostUseCase(
            material_repo=mock_repositories["material"],
            process_repo=mock_repositories["process"],
            bom_repo=mock_repositories["bom"],
        )

        # Act
        result = await use_case.execute(dto)

        # Assert
        # 재료비: 10 × 15 = 150
        # SCRAP비: 150 × 0.05 = 7.5
        # 순재료비: 150 - 7.5 = 142.5
        assert result.gross_material_cost == Decimal("150.00")
        assert result.scrap_value == Decimal("7.50")
        assert result.net_material_cost == Decimal("142.50")


class TestCostBreakdownReportUseCase:
    """원가 명세서 생성 Use Case 테스트."""

    @pytest.fixture
    def mock_repositories(self) -> dict:
        """Mock Repositories."""
        return {
            "material": AsyncMock(),
            "process": AsyncMock(),
            "product": AsyncMock(),
            "bom": AsyncMock(),
        }

    @pytest.mark.asyncio
    async def test_generate_cost_breakdown_report(
        self, mock_repositories: dict
    ) -> None:
        """원가 명세서 생성."""
        from backend.application.use_cases.cost_calculation_use_cases import (
            GenerateCostBreakdownReportUseCase,
        )

        product = Product(
            product_id="P-WH-001",
            product_name="메인 와이어 하네스",
            status=ProductStatus.PRODUCTION,
            customer="현대자동차",
            car_model="아반떼 CN7",
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

        material = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.00"),
            effective_date=date(2025, 1, 1),
        )
        mock_repositories["material"].get_by_id.return_value = material

        use_case = GenerateCostBreakdownReportUseCase(
            material_repo=mock_repositories["material"],
            process_repo=mock_repositories["process"],
            product_repo=mock_repositories["product"],
            bom_repo=mock_repositories["bom"],
        )

        # Act
        result = await use_case.execute("P-WH-001")

        # Assert
        assert result.product_id == "P-WH-001"
        assert result.product_name == "메인 와이어 하네스"
        assert result.customer == "현대자동차"
        assert len(result.material_details) > 0
        assert result.total_cost > Decimal("0")


class TestCompareCostVersionsUseCase:
    """원가 버전 비교 Use Case 테스트."""

    @pytest.fixture
    def mock_repositories(self) -> dict:
        """Mock Repositories."""
        return {
            "material": AsyncMock(),
            "process": AsyncMock(),
            "bom": AsyncMock(),
        }

    @pytest.mark.asyncio
    async def test_compare_cost_with_new_prices(
        self, mock_repositories: dict
    ) -> None:
        """신규 단가 적용 시 원가 비교."""
        from backend.application.use_cases.cost_calculation_use_cases import (
            CompareCostVersionsUseCase,
        )
        from backend.application.dtos.cost_calculation_dto import (
            CompareCostDTO,
            PriceChange,
        )

        # 현재 자재
        current_material = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.00"),
            effective_date=date(2025, 1, 1),
        )
        mock_repositories["material"].get_by_id.return_value = current_material

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

        dto = CompareCostDTO(
            product_id="P-WH-001",
            price_changes=[
                PriceChange(
                    material_id="W-001",
                    new_price=Decimal("16.50"),  # 15 → 16.50 (10% 인상)
                ),
            ],
        )

        use_case = CompareCostVersionsUseCase(
            material_repo=mock_repositories["material"],
            process_repo=mock_repositories["process"],
            bom_repo=mock_repositories["bom"],
        )

        # Act
        result = await use_case.execute(dto)

        # Assert
        assert result.current_cost is not None
        assert result.new_cost is not None
        assert result.difference > Decimal("0")  # 인상
        assert result.change_rate > Decimal("0")
