"""Product Pydantic Schemas.

완제품 API 요청/응답 스키마.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    """완제품 기본 스키마."""

    product_name: str = Field(..., min_length=1, description="완제품명")
    status: str = Field(
        default="PRODUCTION", description="상태 (PRODUCTION, DEVELOPMENT, DISCONTINUED)"
    )
    customer: str | None = Field(None, description="고객사")
    car_model: str | None = Field(None, description="차종")


class ProductCreate(ProductBase):
    """완제품 생성 요청 스키마."""

    product_id: str = Field(..., min_length=1, description="완제품 ID")


class ProductUpdate(BaseModel):
    """완제품 수정 요청 스키마."""

    product_name: str | None = Field(None, min_length=1)
    status: str | None = None
    customer: str | None = None
    car_model: str | None = None


class ProductResponse(ProductBase):
    """완제품 응답 스키마."""

    model_config = ConfigDict(from_attributes=True)

    product_id: str
