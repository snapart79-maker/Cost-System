"""Price Change Pydantic Schemas.

단가 변경 API 요청/응답 스키마.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class MaterialChangeRequest(BaseModel):
    """자재 단가 변경 요청."""

    material_id: str = Field(..., description="자재 ID")
    new_price: Decimal = Field(..., ge=0, description="변경 후 단가")


class ProcessChangeRequest(BaseModel):
    """공정 단가 변경 요청."""

    process_id: str = Field(..., description="공정 ID")
    new_labor_rate: Decimal | None = Field(None, ge=0, description="변경 후 임율")
    new_machine_cost: Decimal | None = Field(None, ge=0, description="변경 후 기계경비")


class PriceChangeCreate(BaseModel):
    """단가 변경 등록 요청 스키마."""

    product_id: str = Field(..., min_length=1, description="완제품 ID")
    change_type: str = Field(
        ..., description="변경 유형 (MATERIAL, PROCESS, COMPOSITE)"
    )
    change_reason: str = Field(..., min_length=1, description="변경 사유")
    effective_date: date = Field(..., description="적용일")
    eco_number: str | None = Field(None, description="ECO 번호")
    created_by: str | None = Field(None, description="작성자")
    material_changes: list[dict[str, Any]] = Field(
        default_factory=list, description="자재 변경 목록"
    )
    process_changes: list[dict[str, Any]] = Field(
        default_factory=list, description="공정 변경 목록"
    )


class PriceChangeResponse(BaseModel):
    """단가 변경 응답 스키마."""

    model_config = ConfigDict(from_attributes=True)

    change_id: str
    product_id: str
    change_type: str
    change_reason: str
    effective_date: date
    before_cost: Decimal
    after_cost: Decimal
    eco_number: str | None = None
    created_by: str | None = None


class CostComparisonResponse(BaseModel):
    """원가 비교 응답 스키마."""

    before_cost: Decimal
    after_cost: Decimal
    difference: Decimal
    change_rate: Decimal
