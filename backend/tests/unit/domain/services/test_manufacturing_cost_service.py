"""Test 3.3: ManufacturingCostService 테스트.

TDD RED Phase: 제조원가 및 구매원가 계산 서비스 테스트.
PRD 5.4 원가 요소 계산 로직 기반.
"""

from decimal import Decimal


class TestManufacturingCostService:
    """ManufacturingCostService 테스트.

    PRD 5.4 원가 요소 계산:
    - 제조원가 = 재료비 + 노무비 + 경비
    - 재료관리비 = 재료비 × 1%
    - 일반관리비 = (노무비 + 경비) × 10%
    - 불량비 = 제조원가 × 1%
    - 이윤 = (노무비 + 경비 + 일반관리비) × 10%
    - 구매원가 = 제조원가 + 재료관리비 + 일반관리비 + 불량비 + 이윤
    """

    def test_calculate_manufacturing_cost(self):
        """제조원가 계산: 재료비 + 노무비 + 경비."""
        from backend.domain.services.manufacturing_cost_service import (
            CostInput,
            ManufacturingCostService,
        )

        service = ManufacturingCostService()

        input_data = CostInput(
            material_cost=Decimal("1000.00"),
            labor_cost=Decimal("200.00"),
            machine_cost=Decimal("100.00"),
        )

        result = service.calculate(input_data)

        # 제조원가 = 1000 + 200 + 100 = 1300
        assert result.manufacturing_cost == Decimal("1300.00")

    def test_calculate_material_management_fee(self):
        """재료관리비 계산: 재료비 × 1%."""
        from backend.domain.services.manufacturing_cost_service import (
            CostInput,
            ManufacturingCostService,
        )

        service = ManufacturingCostService()

        input_data = CostInput(
            material_cost=Decimal("1000.00"),
            labor_cost=Decimal("200.00"),
            machine_cost=Decimal("100.00"),
        )

        result = service.calculate(input_data)

        # 재료관리비 = 1000 × 0.01 = 10
        assert result.material_management_fee == Decimal("10.00")

    def test_calculate_general_admin_fee(self):
        """일반관리비 계산: (노무비 + 경비) × 10%."""
        from backend.domain.services.manufacturing_cost_service import (
            CostInput,
            ManufacturingCostService,
        )

        service = ManufacturingCostService()

        input_data = CostInput(
            material_cost=Decimal("1000.00"),
            labor_cost=Decimal("200.00"),
            machine_cost=Decimal("100.00"),
        )

        result = service.calculate(input_data)

        # 일반관리비 = (200 + 100) × 0.10 = 30
        assert result.general_admin_fee == Decimal("30.00")

    def test_calculate_defect_cost(self):
        """불량비 계산: 제조원가 × 1%."""
        from backend.domain.services.manufacturing_cost_service import (
            CostInput,
            ManufacturingCostService,
        )

        service = ManufacturingCostService()

        input_data = CostInput(
            material_cost=Decimal("1000.00"),
            labor_cost=Decimal("200.00"),
            machine_cost=Decimal("100.00"),
        )

        result = service.calculate(input_data)

        # 불량비 = 1300 × 0.01 = 13
        assert result.defect_cost == Decimal("13.00")

    def test_calculate_profit(self):
        """이윤 계산: (노무비 + 경비 + 일반관리비) × 10%."""
        from backend.domain.services.manufacturing_cost_service import (
            CostInput,
            ManufacturingCostService,
        )

        service = ManufacturingCostService()

        input_data = CostInput(
            material_cost=Decimal("1000.00"),
            labor_cost=Decimal("200.00"),
            machine_cost=Decimal("100.00"),
        )

        result = service.calculate(input_data)

        # 이윤 = (200 + 100 + 30) × 0.10 = 33
        assert result.profit == Decimal("33.00")

    def test_calculate_purchase_cost(self):
        """구매원가 계산: 제조원가 + 각종 비용."""
        from backend.domain.services.manufacturing_cost_service import (
            CostInput,
            ManufacturingCostService,
        )

        service = ManufacturingCostService()

        input_data = CostInput(
            material_cost=Decimal("1000.00"),
            labor_cost=Decimal("200.00"),
            machine_cost=Decimal("100.00"),
        )

        result = service.calculate(input_data)

        # 구매원가 = 1300 + 10 + 30 + 13 + 33 = 1386
        assert result.purchase_cost == Decimal("1386.00")

    def test_calculate_with_custom_rates(self):
        """커스텀 비율로 계산."""
        from backend.domain.services.manufacturing_cost_service import (
            CostInput,
            CostRates,
            ManufacturingCostService,
        )

        # 커스텀 비율 설정
        custom_rates = CostRates(
            material_management_rate=Decimal("0.02"),  # 2%
            general_admin_rate=Decimal("0.15"),  # 15%
            defect_rate=Decimal("0.02"),  # 2%
            profit_rate=Decimal("0.15"),  # 15%
        )

        service = ManufacturingCostService(rates=custom_rates)

        input_data = CostInput(
            material_cost=Decimal("1000.00"),
            labor_cost=Decimal("200.00"),
            machine_cost=Decimal("100.00"),
        )

        result = service.calculate(input_data)

        # 재료관리비 = 1000 × 0.02 = 20
        assert result.material_management_fee == Decimal("20.00")
        # 일반관리비 = 300 × 0.15 = 45
        assert result.general_admin_fee == Decimal("45.00")
        # 불량비 = 1300 × 0.02 = 26
        assert result.defect_cost == Decimal("26.00")
        # 이윤 = (300 + 45) × 0.15 = 51.75
        assert result.profit == Decimal("51.75")

    def test_calculate_with_zero_costs(self):
        """비용이 0일 때 계산."""
        from backend.domain.services.manufacturing_cost_service import (
            CostInput,
            ManufacturingCostService,
        )

        service = ManufacturingCostService()

        input_data = CostInput(
            material_cost=Decimal("0.00"),
            labor_cost=Decimal("0.00"),
            machine_cost=Decimal("0.00"),
        )

        result = service.calculate(input_data)

        assert result.manufacturing_cost == Decimal("0.00")
        assert result.purchase_cost == Decimal("0.00")

    def test_cost_breakdown_contains_all_elements(self):
        """원가 분석 결과에 모든 요소 포함 확인."""
        from backend.domain.services.manufacturing_cost_service import (
            CostInput,
            ManufacturingCostService,
        )

        service = ManufacturingCostService()

        input_data = CostInput(
            material_cost=Decimal("1000.00"),
            labor_cost=Decimal("200.00"),
            machine_cost=Decimal("100.00"),
        )

        result = service.calculate(input_data)

        # 모든 필드가 존재하는지 확인
        assert hasattr(result, "material_cost")
        assert hasattr(result, "labor_cost")
        assert hasattr(result, "machine_cost")
        assert hasattr(result, "manufacturing_cost")
        assert hasattr(result, "material_management_fee")
        assert hasattr(result, "general_admin_fee")
        assert hasattr(result, "defect_cost")
        assert hasattr(result, "profit")
        assert hasattr(result, "purchase_cost")
