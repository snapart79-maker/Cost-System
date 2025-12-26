"""Cost Calculation DTOs."""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal


@dataclass
class ProcessInfo:
    """공정 정보 DTO."""

    process_id: str
    cycle_time: Decimal
    workers: Decimal = Decimal("1")


@dataclass
class CalculateCostDTO:
    """원가 계산 요청 DTO."""

    product_id: str
    processes: list[ProcessInfo] = field(default_factory=list)


@dataclass
class MaterialCostDetail:
    """자재별 원가 상세."""

    material_id: str
    material_name: str
    quantity: Decimal
    unit_price: Decimal
    material_cost: Decimal
    scrap_value: Decimal
    net_cost: Decimal
    work_type: str = "IN_HOUSE"  # IN_HOUSE or OUTSOURCE


@dataclass
class ProcessCostDetail:
    """공정별 원가 상세."""

    process_id: str
    process_name: str
    cycle_time: Decimal
    workers: Decimal
    labor_cost: Decimal
    machine_cost: Decimal
    total_cost: Decimal


@dataclass
class CostBreakdownResultDTO:
    """원가 명세 결과 DTO."""

    product_id: str
    gross_material_cost: Decimal = Decimal("0")
    scrap_value: Decimal = Decimal("0")
    net_material_cost: Decimal = Decimal("0")
    labor_cost: Decimal = Decimal("0")
    machine_cost: Decimal = Decimal("0")
    manufacturing_cost: Decimal = Decimal("0")
    material_management_fee: Decimal = Decimal("0")
    general_admin_fee: Decimal = Decimal("0")
    defect_cost: Decimal = Decimal("0")
    profit: Decimal = Decimal("0")
    purchase_cost: Decimal = Decimal("0")

    # 선택적 상세 정보
    material_details: list[MaterialCostDetail] = field(default_factory=list)
    process_details: list[ProcessCostDetail] = field(default_factory=list)


@dataclass
class CostReportDTO:
    """원가 계산서 DTO."""

    product_id: str
    product_name: str
    customer: str | None = None
    car_model: str | None = None
    material_details: list[MaterialCostDetail] = field(default_factory=list)
    process_details: list[ProcessCostDetail] = field(default_factory=list)
    total_cost: Decimal = Decimal("0")
    breakdown: CostBreakdownResultDTO | None = None


@dataclass
class PriceChange:
    """단가 변경 정보."""

    material_id: str | None = None
    process_id: str | None = None
    new_price: Decimal | None = None
    new_labor_rate: Decimal | None = None
    new_machine_cost: Decimal | None = None


@dataclass
class CompareCostDTO:
    """원가 비교 DTO."""

    product_id: str
    price_changes: list[PriceChange] = field(default_factory=list)


@dataclass
class CostComparisonResultDTO:
    """원가 비교 결과 DTO."""

    product_id: str
    current_cost: Decimal
    new_cost: Decimal
    difference: Decimal
    change_rate: Decimal
