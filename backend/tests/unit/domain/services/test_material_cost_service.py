"""Test 3.1: MaterialCostService 테스트.

TDD RED Phase: 재료비 계산 서비스 테스트.
PRD 5.2 재료비 계산 로직 기반.
"""

from datetime import date
from decimal import Decimal


class TestMaterialCostService:
    """MaterialCostService 테스트."""

    def test_calculate_single_material_cost(self):
        """단일 자재 재료비 계산."""
        from backend.domain.entities.bom import BOMItem, WorkType
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )
        from backend.domain.services.material_cost_service import MaterialCostService

        # Given: 자재와 BOM 항목
        material = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.5000"),
            effective_date=date(2025, 1, 1),
            scrap_rate=Decimal("0.05"),
        )

        bom_item = BOMItem(
            product_id="P-001",
            material_id="W-001",
            quantity=Decimal("10"),
            work_type=WorkType.IN_HOUSE,
        )

        service = MaterialCostService()

        # When: 재료비 계산
        result = service.calculate_item_cost(material, bom_item)

        # Then: 재료비 = 10 × 15.5 = 155원
        assert result.material_cost == Decimal("155.00")
        # SCRAP비 = 155 × 0.05 = 7.75원
        assert result.scrap_value == Decimal("7.75")
        # 순재료비 = 155 - 7.75 = 147.25원
        assert result.net_material_cost == Decimal("147.25")

    def test_calculate_multiple_materials_cost(self):
        """복수 자재 재료비 합산."""
        from backend.domain.entities.bom import BOMItem, WorkType
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )
        from backend.domain.services.material_cost_service import (
            MaterialCostInput,
            MaterialCostService,
        )

        materials = {
            "W-001": Material(
                material_id="W-001",
                material_name="AVS 0.5sq",
                material_type=MaterialType.WIRE,
                unit=MaterialUnit.MTR,
                unit_price=Decimal("15.5000"),
                effective_date=date(2025, 1, 1),
                scrap_rate=Decimal("0.05"),
            ),
            "T-001": Material(
                material_id="T-001",
                material_name="터미널 A",
                material_type=MaterialType.TERMINAL,
                unit=MaterialUnit.EA,
                unit_price=Decimal("5.0000"),
                effective_date=date(2025, 1, 1),
                scrap_rate=Decimal("0"),
            ),
        }

        bom_items = [
            BOMItem(
                product_id="P-001",
                material_id="W-001",
                quantity=Decimal("10"),
                work_type=WorkType.IN_HOUSE,
            ),
            BOMItem(
                product_id="P-001",
                material_id="T-001",
                quantity=Decimal("4"),
                work_type=WorkType.IN_HOUSE,
            ),
        ]

        service = MaterialCostService()
        inputs = [
            MaterialCostInput(material=materials[item.material_id], bom_item=item)
            for item in bom_items
        ]

        # When: 전체 재료비 계산
        result = service.calculate_total_cost(inputs)

        # Then:
        # W-001: 순재료비 = 147.25
        # T-001: 순재료비 = 20.00 (SCRAP 없음)
        # 합계 = 167.25
        assert result.total_net_material_cost == Decimal("167.25")

    def test_calculate_in_house_material_cost(self):
        """내작 자재 재료비 합산."""
        from backend.domain.entities.bom import BOMItem, WorkType
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )
        from backend.domain.services.material_cost_service import (
            MaterialCostInput,
            MaterialCostService,
        )

        materials = {
            "W-001": Material(
                material_id="W-001",
                material_name="AVS 0.5sq",
                material_type=MaterialType.WIRE,
                unit=MaterialUnit.MTR,
                unit_price=Decimal("10.0000"),
                effective_date=date(2025, 1, 1),
            ),
            "T-001": Material(
                material_id="T-001",
                material_name="터미널 A",
                material_type=MaterialType.TERMINAL,
                unit=MaterialUnit.EA,
                unit_price=Decimal("5.0000"),
                effective_date=date(2025, 1, 1),
            ),
        }

        bom_items = [
            BOMItem(
                product_id="P-001",
                material_id="W-001",
                quantity=Decimal("10"),
                work_type=WorkType.IN_HOUSE,  # 내작
            ),
            BOMItem(
                product_id="P-001",
                material_id="T-001",
                quantity=Decimal("4"),
                work_type=WorkType.OUTSOURCE,  # 외작
            ),
        ]

        service = MaterialCostService()
        inputs = [
            MaterialCostInput(material=materials[item.material_id], bom_item=item)
            for item in bom_items
        ]

        # When
        result = service.calculate_total_cost(inputs)

        # Then: 내작만 100원, 외작만 20원
        assert result.in_house_cost == Decimal("100.00")
        assert result.outsource_cost == Decimal("20.00")

    def test_calculate_with_zero_scrap_rate(self):
        """SCRAP율 0%일 때 계산."""
        from backend.domain.entities.bom import BOMItem, WorkType
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )
        from backend.domain.services.material_cost_service import MaterialCostService

        material = Material(
            material_id="T-001",
            material_name="터미널 A",
            material_type=MaterialType.TERMINAL,
            unit=MaterialUnit.EA,
            unit_price=Decimal("5.0000"),
            effective_date=date(2025, 1, 1),
            scrap_rate=Decimal("0"),
        )

        bom_item = BOMItem(
            product_id="P-001",
            material_id="T-001",
            quantity=Decimal("100"),
            work_type=WorkType.IN_HOUSE,
        )

        service = MaterialCostService()
        result = service.calculate_item_cost(material, bom_item)

        # 재료비 = 순재료비 (SCRAP 없음)
        assert result.material_cost == Decimal("500.00")
        assert result.scrap_value == Decimal("0.00")
        assert result.net_material_cost == Decimal("500.00")

    def test_empty_bom_returns_zero(self):
        """빈 BOM일 때 0 반환."""
        from backend.domain.services.material_cost_service import MaterialCostService

        service = MaterialCostService()
        result = service.calculate_total_cost([])

        assert result.total_material_cost == Decimal("0.00")
        assert result.total_scrap_value == Decimal("0.00")
        assert result.total_net_material_cost == Decimal("0.00")
