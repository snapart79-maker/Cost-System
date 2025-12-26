"""Price Change DTOs."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Any


@dataclass
class RegisterPriceChangeDTO:
    """단가 변경 등록 DTO."""

    product_id: str
    change_type: str
    change_reason: str
    effective_date: date
    eco_number: str | None = None
    created_by: str | None = None
    material_changes: list[dict[str, Any]] = field(default_factory=list)
    process_changes: list[dict[str, Any]] = field(default_factory=list)


@dataclass
class PriceChangeQueryDTO:
    """단가 변경 조회 DTO."""

    product_id: str | None = None
    change_type: str | None = None
    start_date: date | None = None
    end_date: date | None = None
