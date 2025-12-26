"""Settlement API Router.

정산 API 엔드포인트.
"""

from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.application.dtos.settlement_dto import CalculateSettlementDTO
from backend.application.use_cases.settlement_use_cases import (
    CalculateSettlementUseCase,
    GetDailyBreakdownUseCase,
    GetSettlementSummaryUseCase,
)
from backend.presentation.api.dependencies import (
    get_calculate_settlement_use_case,
    get_daily_breakdown_use_case,
    get_settlement_summary_use_case,
)
from backend.presentation.schemas.settlement_schema import (
    DailyBreakdownResponse,
    DailySettlementItemResponse,
    SettlementCalculateRequest,
    SettlementResultResponse,
    SettlementSummaryResponse,
)

router = APIRouter(prefix="/settlement", tags=["Settlement"])


@router.post(
    "/calculate",
    response_model=SettlementResultResponse,
    summary="정산 금액 계산",
)
async def calculate_settlement(
    data: SettlementCalculateRequest,
    use_case: Annotated[
        CalculateSettlementUseCase, Depends(get_calculate_settlement_use_case)
    ],
) -> SettlementResultResponse:
    """정산 금액을 계산합니다."""
    dto = CalculateSettlementDTO(
        change_id=data.change_id,
        start_date=data.start_date,
        end_date=data.end_date,
    )
    result = await use_case.execute(dto)
    if not result.product_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"단가 변경 '{data.change_id}'를 찾을 수 없습니다.",
        )
    return SettlementResultResponse(
        change_id=result.change_id,
        product_id=result.product_id,
        start_date=result.start_date,
        end_date=result.end_date,
        total_quantity=result.total_quantity,
        unit_diff=result.unit_diff,
        settlement_amount=result.settlement_amount,
    )


@router.get(
    "/summary",
    response_model=SettlementSummaryResponse,
    summary="정산 요약 조회",
)
async def get_settlement_summary(
    use_case: Annotated[
        GetSettlementSummaryUseCase, Depends(get_settlement_summary_use_case)
    ],
    start_date: date = Query(..., description="시작일"),
    end_date: date = Query(..., description="종료일"),
) -> SettlementSummaryResponse:
    """기간별 정산 요약을 조회합니다."""
    result = await use_case.execute(start_date, end_date)
    return SettlementSummaryResponse(
        start_date=result.start_date,
        end_date=result.end_date,
        total_changes=result.total_changes,
        increase_count=result.increase_count,
        decrease_count=result.decrease_count,
        total_increase_amount=result.total_increase_amount,
        total_decrease_amount=result.total_decrease_amount,
        net_amount=result.net_amount,
    )


@router.get(
    "/{change_id}/daily",
    response_model=DailyBreakdownResponse,
    summary="일별 정산 상세 조회",
)
async def get_daily_breakdown(
    change_id: str,
    use_case: Annotated[
        GetDailyBreakdownUseCase, Depends(get_daily_breakdown_use_case)
    ],
    start_date: date = Query(..., description="시작일"),
    end_date: date = Query(..., description="종료일"),
) -> DailyBreakdownResponse:
    """일별 정산 상세를 조회합니다."""
    result = await use_case.execute(change_id, start_date, end_date)
    if not result.product_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"단가 변경 '{change_id}'를 찾을 수 없습니다.",
        )
    return DailyBreakdownResponse(
        change_id=result.change_id,
        product_id=result.product_id,
        unit_diff=result.unit_diff,
        daily_items=[
            DailySettlementItemResponse(
                date=item.date,
                quantity=item.quantity,
                amount=item.amount,
            )
            for item in result.daily_items
        ],
        total_amount=result.total_amount,
    )
