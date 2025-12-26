"""Test 3.4: PriceChangeImpactService 테스트.

TDD RED Phase: 단가 변경 영향 분석 서비스 테스트.
PRD 5.5 변경 영향 계산 기반.
"""

from datetime import date
from decimal import Decimal


class TestPriceChangeImpactService:
    """PriceChangeImpactService 테스트.

    PRD 5.5:
    - 단가 변경분 = 변경 후 구매원가 - 변경 전 구매원가
    - 정산 금액 = Σ (변경 적용일 이후 일별 입고 수량 × 단가 변경분)
    """

    def test_calculate_cost_difference(self):
        """단가 변경분 계산."""
        from backend.domain.services.price_change_impact_service import (
            PriceChangeImpactService,
        )

        service = PriceChangeImpactService()

        before_cost = Decimal("1500.00")
        after_cost = Decimal("1650.00")

        diff = service.calculate_cost_difference(before_cost, after_cost)

        # 변경분 = 1650 - 1500 = 150
        assert diff == Decimal("150.00")

    def test_calculate_negative_cost_difference(self):
        """단가 인하 변경분 계산."""
        from backend.domain.services.price_change_impact_service import (
            PriceChangeImpactService,
        )

        service = PriceChangeImpactService()

        before_cost = Decimal("1500.00")
        after_cost = Decimal("1350.00")

        diff = service.calculate_cost_difference(before_cost, after_cost)

        # 변경분 = 1350 - 1500 = -150
        assert diff == Decimal("-150.00")

    def test_calculate_settlement_amount_simple(self):
        """단순 정산 금액 계산."""
        from backend.domain.services.price_change_impact_service import (
            PriceChangeImpactService,
            SettlementInput,
        )

        service = PriceChangeImpactService()

        input_data = SettlementInput(
            effective_date=date(2025, 2, 1),
            cost_difference=Decimal("150.00"),
            daily_quantities={
                date(2025, 2, 1): Decimal("100"),
                date(2025, 2, 2): Decimal("150"),
                date(2025, 2, 3): Decimal("200"),
            },
        )

        result = service.calculate_settlement(input_data)

        # 정산 금액 = (100 + 150 + 200) × 150 = 67,500
        assert result.total_quantity == Decimal("450")
        assert result.total_settlement == Decimal("67500.00")

    def test_calculate_settlement_excludes_before_effective_date(self):
        """적용일 이전 수량은 제외."""
        from backend.domain.services.price_change_impact_service import (
            PriceChangeImpactService,
            SettlementInput,
        )

        service = PriceChangeImpactService()

        input_data = SettlementInput(
            effective_date=date(2025, 2, 1),
            cost_difference=Decimal("100.00"),
            daily_quantities={
                date(2025, 1, 30): Decimal("50"),  # 제외
                date(2025, 1, 31): Decimal("50"),  # 제외
                date(2025, 2, 1): Decimal("100"),  # 포함
                date(2025, 2, 2): Decimal("100"),  # 포함
            },
        )

        result = service.calculate_settlement(input_data)

        # 정산 금액 = 200 × 100 = 20,000 (1월 수량 제외)
        assert result.total_quantity == Decimal("200")
        assert result.total_settlement == Decimal("20000.00")

    def test_calculate_settlement_with_period(self):
        """기간별 정산 금액 계산."""
        from backend.domain.services.price_change_impact_service import (
            PriceChangeImpactService,
            SettlementInput,
        )

        service = PriceChangeImpactService()

        input_data = SettlementInput(
            effective_date=date(2025, 2, 1),
            cost_difference=Decimal("100.00"),
            daily_quantities={
                date(2025, 2, 1): Decimal("100"),
                date(2025, 2, 2): Decimal("100"),
                date(2025, 2, 3): Decimal("100"),
                date(2025, 2, 4): Decimal("100"),
                date(2025, 2, 5): Decimal("100"),
            },
            start_date=date(2025, 2, 2),  # 기간 시작
            end_date=date(2025, 2, 4),  # 기간 종료
        )

        result = service.calculate_settlement(input_data)

        # 2/2 ~ 2/4만 포함: 300 × 100 = 30,000
        assert result.total_quantity == Decimal("300")
        assert result.total_settlement == Decimal("30000.00")

    def test_calculate_settlement_negative_diff(self):
        """단가 인하 시 정산 금액 (환급)."""
        from backend.domain.services.price_change_impact_service import (
            PriceChangeImpactService,
            SettlementInput,
        )

        service = PriceChangeImpactService()

        input_data = SettlementInput(
            effective_date=date(2025, 2, 1),
            cost_difference=Decimal("-50.00"),  # 인하
            daily_quantities={
                date(2025, 2, 1): Decimal("100"),
            },
        )

        result = service.calculate_settlement(input_data)

        # 정산 금액 = 100 × (-50) = -5,000 (환급)
        assert result.total_settlement == Decimal("-5000.00")

    def test_calculate_settlement_empty_quantities(self):
        """입고 수량이 없을 때."""
        from backend.domain.services.price_change_impact_service import (
            PriceChangeImpactService,
            SettlementInput,
        )

        service = PriceChangeImpactService()

        input_data = SettlementInput(
            effective_date=date(2025, 2, 1),
            cost_difference=Decimal("100.00"),
            daily_quantities={},
        )

        result = service.calculate_settlement(input_data)

        assert result.total_quantity == Decimal("0")
        assert result.total_settlement == Decimal("0.00")

    def test_calculate_daily_settlement_breakdown(self):
        """일별 정산 내역 상세."""
        from backend.domain.services.price_change_impact_service import (
            PriceChangeImpactService,
            SettlementInput,
        )

        service = PriceChangeImpactService()

        input_data = SettlementInput(
            effective_date=date(2025, 2, 1),
            cost_difference=Decimal("100.00"),
            daily_quantities={
                date(2025, 2, 1): Decimal("100"),
                date(2025, 2, 2): Decimal("150"),
            },
        )

        result = service.calculate_settlement(input_data)

        # 일별 상세 확인
        assert len(result.daily_breakdown) == 2
        assert result.daily_breakdown[date(2025, 2, 1)].quantity == Decimal("100")
        assert result.daily_breakdown[date(2025, 2, 1)].settlement == Decimal("10000.00")
        assert result.daily_breakdown[date(2025, 2, 2)].quantity == Decimal("150")
        assert result.daily_breakdown[date(2025, 2, 2)].settlement == Decimal("15000.00")

    def test_compare_before_after_costs(self):
        """변경 전후 원가 비교."""
        from backend.domain.services.manufacturing_cost_service import CostBreakdown
        from backend.domain.services.price_change_impact_service import (
            CostComparisonInput,
            PriceChangeImpactService,
        )

        service = PriceChangeImpactService()

        before = CostBreakdown(
            material_cost=Decimal("1000.00"),
            labor_cost=Decimal("200.00"),
            machine_cost=Decimal("100.00"),
            manufacturing_cost=Decimal("1300.00"),
            material_management_fee=Decimal("10.00"),
            general_admin_fee=Decimal("30.00"),
            defect_cost=Decimal("13.00"),
            profit=Decimal("33.00"),
            purchase_cost=Decimal("1386.00"),
        )

        after = CostBreakdown(
            material_cost=Decimal("1100.00"),  # 자재비 인상
            labor_cost=Decimal("200.00"),
            machine_cost=Decimal("100.00"),
            manufacturing_cost=Decimal("1400.00"),
            material_management_fee=Decimal("11.00"),
            general_admin_fee=Decimal("30.00"),
            defect_cost=Decimal("14.00"),
            profit=Decimal("33.00"),
            purchase_cost=Decimal("1488.00"),
        )

        input_data = CostComparisonInput(before=before, after=after)
        result = service.compare_costs(input_data)

        # 구매원가 변경분 = 1488 - 1386 = 102
        assert result.purchase_cost_diff == Decimal("102.00")
        # 재료비 변경분 = 1100 - 1000 = 100
        assert result.material_cost_diff == Decimal("100.00")
