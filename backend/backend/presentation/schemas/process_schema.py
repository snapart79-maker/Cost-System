"""Process Pydantic Schemas.

공정 API 요청/응답 스키마.
"""

from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProcessBase(BaseModel):
    """공정 기본 스키마."""

    process_name: str = Field(..., min_length=1, description="공정명")
    work_type: str = Field(..., description="작업 유형 (IN_HOUSE, OUTSOURCE)")
    labor_rate: Decimal = Field(..., ge=0, description="임율 (원/시간)")
    machine_cost: Decimal = Field(default=Decimal("0"), ge=0, description="기계경비")
    efficiency: Decimal = Field(
        default=Decimal("100"), ge=0, le=200, description="효율 (%)"
    )


class ProcessCreate(ProcessBase):
    """공정 생성 요청 스키마."""

    process_id: str = Field(..., min_length=1, description="공정 ID")


class ProcessUpdate(BaseModel):
    """공정 수정 요청 스키마."""

    process_name: str | None = Field(None, min_length=1)
    labor_rate: Decimal | None = Field(None, ge=0)
    machine_cost: Decimal | None = Field(None, ge=0)
    efficiency: Decimal | None = Field(None, ge=0, le=200)


class ProcessResponse(ProcessBase):
    """공정 응답 스키마."""

    model_config = ConfigDict(from_attributes=True)

    process_id: str
