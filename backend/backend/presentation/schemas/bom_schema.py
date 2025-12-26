"""BOM Pydantic Schemas.

BOM API 요청/응답 스키마.
"""

from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class BOMItemBase(BaseModel):
    """BOM 항목 기본 스키마."""

    material_id: str = Field(..., min_length=1, description="자재 ID")
    quantity: Decimal = Field(..., ge=0, description="수량")
    work_type: str = Field(..., description="작업 유형 (IN_HOUSE, OUTSOURCE)")
    sequence: int = Field(default=0, ge=0, description="순서")


class BOMItemCreate(BOMItemBase):
    """BOM 항목 생성 요청 스키마."""

    pass


class BOMItemResponse(BOMItemBase):
    """BOM 항목 응답 스키마."""

    model_config = ConfigDict(from_attributes=True)

    product_id: str


class BOMCreate(BaseModel):
    """BOM 생성 요청 스키마."""

    product_id: str = Field(..., min_length=1, description="완제품 ID")
    version: str = Field(default="1.0", description="버전")
    items: list[BOMItemCreate] = Field(
        default_factory=list, description="BOM 항목 목록"
    )


class BOMResponse(BaseModel):
    """BOM 응답 스키마."""

    model_config = ConfigDict(from_attributes=True)

    product_id: str
    version: str
    items: list[BOMItemResponse] = Field(default_factory=list)
