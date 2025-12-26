"""Material DTOs."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal


@dataclass
class CreateMaterialDTO:
    """자재 생성 DTO."""

    material_id: str
    material_name: str
    material_type: str
    unit: str
    unit_price: Decimal
    effective_date: date
    scrap_rate: Decimal | None = None
    supplier: str | None = None
    specification: str | None = None


@dataclass
class UpdateMaterialDTO:
    """자재 수정 DTO."""

    material_id: str
    material_name: str | None = None
    material_type: str | None = None
    unit: str | None = None
    unit_price: Decimal | None = None
    effective_date: date | None = None
    scrap_rate: Decimal | None = None
    supplier: str | None = None
    specification: str | None = None
