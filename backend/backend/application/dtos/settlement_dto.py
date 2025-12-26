"""Settlement DTOs."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal


@dataclass
class CalculateSettlementDTO:
    """정산 금액 계산 DTO."""

    change_id: str
    start_date: date
    end_date: date


@dataclass
class SettlementResultDTO:
    """정산 결과 DTO."""

    change_id: str
    product_id: str
    start_date: date
    end_date: date
    total_quantity: Decimal
    unit_diff: Decimal
    settlement_amount: Decimal


@dataclass
class DailySettlementItem:
    """일별 정산 항목."""

    date: date
    quantity: Decimal
    amount: Decimal


@dataclass
class DailyBreakdownDTO:
    """일별 정산 내역."""

    change_id: str
    product_id: str
    unit_diff: Decimal
    daily_items: list[DailySettlementItem] = field(default_factory=list)
    total_amount: Decimal = Decimal("0")


@dataclass
class SettlementSummaryDTO:
    """정산 요약 DTO."""

    start_date: date
    end_date: date
    total_changes: int
    increase_count: int
    decrease_count: int
    total_increase_amount: Decimal = Decimal("0")
    total_decrease_amount: Decimal = Decimal("0")
    net_amount: Decimal = Decimal("0")
