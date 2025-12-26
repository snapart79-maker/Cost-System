"""재료비 계산 서비스.

PRD 5.2 재료비 계산 로직 기반.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

from backend.domain.entities.bom import BOMItem, WorkType
from backend.domain.entities.material import Material


@dataclass
class ItemCostResult:
    """단일 자재 원가 계산 결과."""

    material_cost: Decimal
    scrap_value: Decimal
    net_material_cost: Decimal


@dataclass
class MaterialCostInput:
    """재료비 계산 입력."""

    material: Material
    bom_item: BOMItem


@dataclass
class TotalCostResult:
    """전체 재료비 계산 결과."""

    total_material_cost: Decimal
    total_scrap_value: Decimal
    total_net_material_cost: Decimal
    in_house_cost: Decimal
    outsource_cost: Decimal


class MaterialCostService:
    """재료비 계산 서비스.

    PRD 5.2:
    - 재료비 = 수량 × 단가
    - SCRAP = 재료비 × SCRAP율
    - 순재료비 = 재료비 - SCRAP
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

    def calculate_item_cost(
        self, material: Material, bom_item: BOMItem
    ) -> ItemCostResult:
        """단일 자재 재료비 계산.

        Args:
            material: 자재 정보
            bom_item: BOM 항목

        Returns:
            ItemCostResult: 재료비 계산 결과
        """
        # 재료비 = 수량 × 단가
        material_cost = bom_item.quantity * material.unit_price
        material_cost = self._round(material_cost)

        # SCRAP = 재료비 × SCRAP율
        scrap_rate = material.scrap_rate or Decimal("0")
        scrap_value = material_cost * scrap_rate
        scrap_value = self._round(scrap_value)

        # 순재료비 = 재료비 - SCRAP
        net_material_cost = material_cost - scrap_value
        net_material_cost = self._round(net_material_cost)

        return ItemCostResult(
            material_cost=material_cost,
            scrap_value=scrap_value,
            net_material_cost=net_material_cost,
        )

    def calculate_total_cost(self, inputs: list[MaterialCostInput]) -> TotalCostResult:
        """전체 재료비 합산 계산.

        Args:
            inputs: 재료비 계산 입력 목록

        Returns:
            TotalCostResult: 전체 재료비 계산 결과
        """
        if not inputs:
            zero = Decimal("0.00")
            return TotalCostResult(
                total_material_cost=zero,
                total_scrap_value=zero,
                total_net_material_cost=zero,
                in_house_cost=zero,
                outsource_cost=zero,
            )

        total_material = Decimal("0")
        total_scrap = Decimal("0")
        total_net = Decimal("0")
        in_house = Decimal("0")
        outsource = Decimal("0")

        for inp in inputs:
            result = self.calculate_item_cost(inp.material, inp.bom_item)

            total_material += result.material_cost
            total_scrap += result.scrap_value
            total_net += result.net_material_cost

            # 내작/외작 분류
            if inp.bom_item.work_type == WorkType.IN_HOUSE:
                in_house += result.net_material_cost
            else:
                outsource += result.net_material_cost

        return TotalCostResult(
            total_material_cost=self._round(total_material),
            total_scrap_value=self._round(total_scrap),
            total_net_material_cost=self._round(total_net),
            in_house_cost=self._round(in_house),
            outsource_cost=self._round(outsource),
        )
