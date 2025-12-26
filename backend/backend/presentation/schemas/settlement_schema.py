"""Settlement Pydantic Schemas.

정산 API 요청/응답 스키마.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field


class SettlementCalculateRequest(BaseModel):
    """정산 금액 계산 요청 스키마."""

    change_id: str = Field(..., min_length=1, description="변경 ID")
    start_date: date = Field(..., description="시작일")
    end_date: date = Field(..., description="종료일")


class SettlementResultResponse(BaseModel):
    """정산 결과 응답 스키마."""

    change_id: str
    product_id: str
    start_date: date
    end_date: date
    total_quantity: Decimal
    unit_diff: Decimal
    settlement_amount: Decimal


class SettlementSummaryResponse(BaseModel):
    """정산 요약 응답 스키마."""

    start_date: date
    end_date: date
    total_changes: int
    increase_count: int
    decrease_count: int
    total_increase_amount: Decimal
    total_decrease_amount: Decimal
    net_amount: Decimal


class DailySettlementItemResponse(BaseModel):
    """일별 정산 항목 응답 스키마."""

    date: date
    quantity: Decimal
    amount: Decimal


class DailyBreakdownResponse(BaseModel):
    """일별 정산 상세 응답 스키마."""

    change_id: str
    product_id: str
    unit_diff: Decimal
    daily_items: list[DailySettlementItemResponse] = Field(default_factory=list)
    total_amount: Decimal = Field(default=Decimal("0"))
