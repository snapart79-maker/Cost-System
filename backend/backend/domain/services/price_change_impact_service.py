"""단가 변경 영향 분석 서비스.

PRD 5.5 변경 영향 계산 기반.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from decimal import ROUND_HALF_UP, Decimal

from backend.domain.services.manufacturing_cost_service import CostBreakdown


@dataclass
class DailySettlement:
    """일별 정산 내역."""

    quantity: Decimal
    settlement: Decimal


@dataclass
class SettlementInput:
    """정산 계산 입력."""

    effective_date: date  # 변경 적용일
    cost_difference: Decimal  # 단가 변경분
    daily_quantities: dict[date, Decimal]  # 일별 입고 수량
    start_date: date | None = None  # 정산 시작일 (선택)
    end_date: date | None = None  # 정산 종료일 (선택)


@dataclass
class SettlementResult:
    """정산 계산 결과."""

    total_quantity: Decimal
    total_settlement: Decimal
    daily_breakdown: dict[date, DailySettlement] = field(default_factory=dict)


@dataclass
class CostComparisonInput:
    """원가 비교 입력."""

    before: CostBreakdown
    after: CostBreakdown


@dataclass
class CostComparisonResult:
    """원가 비교 결과."""

    purchase_cost_diff: Decimal
    material_cost_diff: Decimal
    labor_cost_diff: Decimal = Decimal("0")
    machine_cost_diff: Decimal = Decimal("0")
    manufacturing_cost_diff: Decimal = Decimal("0")


class PriceChangeImpactService:
    """단가 변경 영향 분석 서비스.

    PRD 5.5:
    - 단가 변경분 = 변경 후 구매원가 - 변경 전 구매원가
    - 정산 금액 = Σ (변경 적용일 이후 일별 입고 수량 × 단가 변경분)
    """

    def __init__(self, precision: int = 2) -> None:
        """서비스 초기화.

        Args:
            precision: 소수점 자릿수 (기본값: 2)
        """
        self.precision = precision
        self._quantize = Decimal(10) ** -precision

    def _round(self, value: Decimal) -> Decimal:
        """금액 반올림."""
        return value.quantize(self._quantize, rounding=ROUND_HALF_UP)

    def calculate_cost_difference(
        self, before_cost: Decimal, after_cost: Decimal
    ) -> Decimal:
        """단가 변경분 계산.

        Args:
            before_cost: 변경 전 원가
            after_cost: 변경 후 원가

        Returns:
            Decimal: 단가 변경분
        """
        return self._round(after_cost - before_cost)

    def calculate_settlement(self, input_data: SettlementInput) -> SettlementResult:
        """정산 금액 계산.

        Args:
            input_data: 정산 계산 입력

        Returns:
            SettlementResult: 정산 계산 결과
        """
        effective_date = input_data.effective_date
        cost_diff = input_data.cost_difference
        daily_quantities = input_data.daily_quantities
        start_date = input_data.start_date
        end_date = input_data.end_date

        total_quantity = Decimal("0")
        total_settlement = Decimal("0")
        daily_breakdown: dict[date, DailySettlement] = {}

        for day, quantity in sorted(daily_quantities.items()):
            # 적용일 이전은 제외
            if day < effective_date:
                continue

            # 기간 필터 적용
            if start_date and day < start_date:
                continue
            if end_date and day > end_date:
                continue

            # 정산 계산
            settlement = quantity * cost_diff
            settlement = self._round(settlement)

            total_quantity += quantity
            total_settlement += settlement

            daily_breakdown[day] = DailySettlement(
                quantity=quantity,
                settlement=settlement,
            )

        return SettlementResult(
            total_quantity=total_quantity,
            total_settlement=self._round(total_settlement),
            daily_breakdown=daily_breakdown,
        )

    def compare_costs(self, input_data: CostComparisonInput) -> CostComparisonResult:
        """변경 전후 원가 비교.

        Args:
            input_data: 원가 비교 입력

        Returns:
            CostComparisonResult: 원가 비교 결과
        """
        before = input_data.before
        after = input_data.after

        return CostComparisonResult(
            purchase_cost_diff=self._round(after.purchase_cost - before.purchase_cost),
            material_cost_diff=self._round(after.material_cost - before.material_cost),
            labor_cost_diff=self._round(after.labor_cost - before.labor_cost),
            machine_cost_diff=self._round(after.machine_cost - before.machine_cost),
            manufacturing_cost_diff=self._round(
                after.manufacturing_cost - before.manufacturing_cost
            ),
        )
