"""제조원가 및 구매원가 계산 서비스.

PRD 5.4 원가 요소 계산 로직 기반.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal


@dataclass
class CostInput:
    """원가 계산 입력."""

    material_cost: Decimal  # 재료비
    labor_cost: Decimal  # 노무비
    machine_cost: Decimal  # 경비


@dataclass
class CostRates:
    """원가 계산 비율."""

    material_management_rate: Decimal = Decimal("0.01")  # 재료관리비율 1%
    general_admin_rate: Decimal = Decimal("0.10")  # 일반관리비율 10%
    defect_rate: Decimal = Decimal("0.01")  # 불량비율 1%
    profit_rate: Decimal = Decimal("0.10")  # 이윤율 10%


@dataclass
class CostBreakdown:
    """원가 분석 결과."""

    material_cost: Decimal  # 재료비
    labor_cost: Decimal  # 노무비
    machine_cost: Decimal  # 경비
    manufacturing_cost: Decimal  # 제조원가
    material_management_fee: Decimal  # 재료관리비
    general_admin_fee: Decimal  # 일반관리비
    defect_cost: Decimal  # 불량비
    profit: Decimal  # 이윤
    purchase_cost: Decimal  # 구매원가


class ManufacturingCostService:
    """제조원가 및 구매원가 계산 서비스.

    PRD 5.4:
    - 제조원가 = 재료비 + 노무비 + 경비
    - 재료관리비 = 재료비 × 1%
    - 일반관리비 = (노무비 + 경비) × 10%
    - 불량비 = 제조원가 × 1%
    - 이윤 = (노무비 + 경비 + 일반관리비) × 10%
    - 구매원가 = 제조원가 + 재료관리비 + 일반관리비 + 불량비 + 이윤
    """

    def __init__(self, rates: CostRates | None = None, precision: int = 2) -> None:
        """서비스 초기화.

        Args:
            rates: 원가 계산 비율 (기본값 사용 시 None)
            precision: 소수점 자릿수 (기본값: 2)
        """
        self.rates = rates or CostRates()
        self.precision = precision
        self._quantize = Decimal(10) ** -precision

    def _round(self, value: Decimal) -> Decimal:
        """금액 반올림."""
        return value.quantize(self._quantize, rounding=ROUND_HALF_UP)

    def calculate(self, input_data: CostInput) -> CostBreakdown:
        """원가 계산.

        Args:
            input_data: 원가 계산 입력

        Returns:
            CostBreakdown: 원가 분석 결과
        """
        material = input_data.material_cost
        labor = input_data.labor_cost
        machine = input_data.machine_cost

        # 제조원가 = 재료비 + 노무비 + 경비
        manufacturing_cost = material + labor + machine
        manufacturing_cost = self._round(manufacturing_cost)

        # 재료관리비 = 재료비 × 재료관리비율
        material_management_fee = material * self.rates.material_management_rate
        material_management_fee = self._round(material_management_fee)

        # 일반관리비 = (노무비 + 경비) × 일반관리비율
        general_admin_fee = (labor + machine) * self.rates.general_admin_rate
        general_admin_fee = self._round(general_admin_fee)

        # 불량비 = 제조원가 × 불량비율
        defect_cost = manufacturing_cost * self.rates.defect_rate
        defect_cost = self._round(defect_cost)

        # 이윤 = (노무비 + 경비 + 일반관리비) × 이윤율
        profit = (labor + machine + general_admin_fee) * self.rates.profit_rate
        profit = self._round(profit)

        # 구매원가 = 제조원가 + 재료관리비 + 일반관리비 + 불량비 + 이윤
        purchase_cost = (
            manufacturing_cost
            + material_management_fee
            + general_admin_fee
            + defect_cost
            + profit
        )
        purchase_cost = self._round(purchase_cost)

        return CostBreakdown(
            material_cost=self._round(material),
            labor_cost=self._round(labor),
            machine_cost=self._round(machine),
            manufacturing_cost=manufacturing_cost,
            material_management_fee=material_management_fee,
            general_admin_fee=general_admin_fee,
            defect_cost=defect_cost,
            profit=profit,
            purchase_cost=purchase_cost,
        )
