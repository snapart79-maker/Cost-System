"""Product DTOs."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class CreateProductDTO:
    """완제품 생성 DTO."""

    product_id: str
    product_name: str
    status: str
    customer: str | None = None
    car_model: str | None = None
    description: str | None = None


@dataclass
class UpdateProductDTO:
    """완제품 수정 DTO."""

    product_id: str
    product_name: str | None = None
    status: str | None = None
    customer: str | None = None
    car_model: str | None = None
    description: str | None = None
