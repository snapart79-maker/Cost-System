"""Cost Calculation Pydantic Schemas.

원가 계산 API 요청/응답 스키마.
"""

from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, Field


class ProcessInfoRequest(BaseModel):
    """공정 정보 요청 스키마."""

    process_id: str = Field(..., description="공정 ID")
    cycle_time: Decimal = Field(..., ge=0, description="C/T (초)")
    workers: Decimal = Field(default=Decimal("1"), ge=0, description="인원수")


class CalculateCostRequest(BaseModel):
    """원가 계산 요청 스키마."""

    product_id: str = Field(..., min_length=1, description="완제품 ID")
    processes: list[ProcessInfoRequest] = Field(
        default_factory=list, description="공정 정보 목록"
    )


class MaterialCostDetailResponse(BaseModel):
    """자재 원가 상세 응답 스키마."""

    material_id: str
    material_name: str
    quantity: Decimal
    unit_price: Decimal
    material_cost: Decimal
    scrap_value: Decimal
    net_cost: Decimal


class ProcessCostDetailResponse(BaseModel):
    """공정 원가 상세 응답 스키마."""

    process_id: str
    process_name: str
    cycle_time: Decimal
    workers: Decimal
    labor_cost: Decimal
    machine_cost: Decimal
    total_cost: Decimal


class CostBreakdownResponse(BaseModel):
    """원가 명세 응답 스키마."""

    product_id: str
    gross_material_cost: Decimal = Field(default=Decimal("0"))
    scrap_value: Decimal = Field(default=Decimal("0"))
    net_material_cost: Decimal = Field(default=Decimal("0"))
    labor_cost: Decimal = Field(default=Decimal("0"))
    machine_cost: Decimal = Field(default=Decimal("0"))
    manufacturing_cost: Decimal = Field(default=Decimal("0"))
    material_management_fee: Decimal = Field(default=Decimal("0"))
    general_admin_fee: Decimal = Field(default=Decimal("0"))
    defect_cost: Decimal = Field(default=Decimal("0"))
    profit: Decimal = Field(default=Decimal("0"))
    purchase_cost: Decimal = Field(default=Decimal("0"))
    material_details: list[MaterialCostDetailResponse] = Field(default_factory=list)
    process_details: list[ProcessCostDetailResponse] = Field(default_factory=list)


class CostReportResponse(BaseModel):
    """원가 계산서 응답 스키마."""

    product_id: str
    product_name: str
    customer: str | None = None
    car_model: str | None = None
    material_details: list[MaterialCostDetailResponse] = Field(default_factory=list)
    process_details: list[ProcessCostDetailResponse] = Field(default_factory=list)
    total_cost: Decimal = Field(default=Decimal("0"))


class PriceChangeRequest(BaseModel):
    """가격 변경 요청 스키마."""

    material_id: str | None = None
    process_id: str | None = None
    new_price: Decimal | None = None
    new_labor_rate: Decimal | None = None
    new_machine_cost: Decimal | None = None


class CompareCostRequest(BaseModel):
    """원가 비교 요청 스키마."""

    product_id: str = Field(..., min_length=1, description="완제품 ID")
    price_changes: list[PriceChangeRequest] = Field(
        default_factory=list, description="가격 변경 목록"
    )


class CostComparisonResponse(BaseModel):
    """원가 비교 응답 스키마."""

    product_id: str
    current_cost: Decimal
    new_cost: Decimal
    difference: Decimal
    change_rate: Decimal
