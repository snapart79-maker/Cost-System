"""BOM DTOs."""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal


@dataclass
class BOMItemDTO:
    """BOM 항목 DTO."""

    material_id: str
    quantity: Decimal
    work_type: str
    sequence: int | None = None


@dataclass
class CreateBOMDTO:
    """BOM 생성 DTO."""

    product_id: str
    version: str = "1.0"
    items: list[BOMItemDTO] = field(default_factory=list)


@dataclass
class UpdateBOMDTO:
    """BOM 수정 DTO."""

    product_id: str
    version: str | None = None
