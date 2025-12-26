"""Process DTOs."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal


@dataclass
class CreateProcessDTO:
    """공정 생성 DTO."""

    process_id: str
    process_name: str
    work_type: str
    labor_rate: Decimal
    machine_cost: Decimal
    efficiency: Decimal | None = None
    description: str | None = None


@dataclass
class UpdateProcessDTO:
    """공정 수정 DTO."""

    process_id: str
    process_name: str | None = None
    work_type: str | None = None
    labor_rate: Decimal | None = None
    machine_cost: Decimal | None = None
    efficiency: Decimal | None = None
    description: str | None = None
