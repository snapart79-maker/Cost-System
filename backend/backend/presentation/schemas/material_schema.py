"""Material Pydantic Schemas.

자재 API 요청/응답 스키마.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class MaterialBase(BaseModel):
    """자재 기본 스키마."""

    material_name: str = Field(..., min_length=1, description="자재명")
    material_type: str = Field(
        ..., description="자재 유형 (WIRE, TERMINAL, CONNECTOR, etc.)"
    )
    unit: str = Field(..., description="단위 (MTR, EA, SET)")
    unit_price: Decimal = Field(..., ge=0, decimal_places=4, description="단가")
    effective_date: date = Field(..., description="적용일")
    specification: str | None = Field(None, description="규격")
    scrap_rate: Decimal | None = Field(None, ge=0, le=1, description="SCRAP율")


class MaterialCreate(MaterialBase):
    """자재 생성 요청 스키마."""

    material_id: str = Field(..., min_length=1, description="자재 ID")


class MaterialUpdate(BaseModel):
    """자재 수정 요청 스키마."""

    material_name: str | None = Field(None, min_length=1)
    unit_price: Decimal | None = Field(None, ge=0, decimal_places=4)
    effective_date: date | None = None
    specification: str | None = None
    scrap_rate: Decimal | None = Field(None, ge=0, le=1)


class MaterialResponse(MaterialBase):
    """자재 응답 스키마."""

    model_config = ConfigDict(from_attributes=True)

    material_id: str
