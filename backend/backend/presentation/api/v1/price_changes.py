"""Price Changes API Router.

단가 변경 API 엔드포인트.
"""

from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.application.dtos.price_change_dto import RegisterPriceChangeDTO
from backend.application.use_cases.price_change_use_cases import (
    CompareCostsUseCase,
    GetPriceChangeUseCase,
    ListPriceChangesUseCase,
    ProductNotFoundError,
    RegisterPriceChangeUseCase,
)
from backend.presentation.api.dependencies import (
    get_compare_costs_use_case,
    get_get_price_change_use_case,
    get_list_price_changes_use_case,
    get_register_price_change_use_case,
)
from backend.presentation.schemas.price_change_schema import (
    CostComparisonResponse,
    PriceChangeCreate,
    PriceChangeResponse,
)

router = APIRouter(prefix="/price-changes", tags=["Price Changes"])


@router.post(
    "",
    response_model=PriceChangeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="단가 변경 등록",
)
async def register_price_change(
    data: PriceChangeCreate,
    use_case: Annotated[
        RegisterPriceChangeUseCase, Depends(get_register_price_change_use_case)
    ],
) -> PriceChangeResponse:
    """단가 변경을 등록합니다."""
    dto = RegisterPriceChangeDTO(
        product_id=data.product_id,
        change_type=data.change_type,
        change_reason=data.change_reason,
        effective_date=data.effective_date,
        eco_number=data.eco_number,
        created_by=data.created_by,
        material_changes=data.material_changes,
        process_changes=data.process_changes,
    )
    try:
        price_change = await use_case.execute(dto)
        return PriceChangeResponse(
            change_id=price_change.change_id,
            product_id=price_change.product_id,
            change_type=price_change.change_type.value,
            change_reason=price_change.change_reason,
            effective_date=price_change.effective_date,
            before_cost=price_change.before_cost,
            after_cost=price_change.after_cost,
            eco_number=price_change.eco_number,
            created_by=price_change.created_by,
        )
    except ProductNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/{change_id}",
    response_model=PriceChangeResponse,
    summary="단가 변경 조회",
)
async def get_price_change(
    change_id: str,
    use_case: Annotated[GetPriceChangeUseCase, Depends(get_get_price_change_use_case)],
) -> PriceChangeResponse:
    """단가 변경 ID로 조회합니다."""
    price_change = await use_case.execute(change_id)
    if not price_change:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"단가 변경 '{change_id}'를 찾을 수 없습니다.",
        )
    return PriceChangeResponse(
        change_id=price_change.change_id,
        product_id=price_change.product_id,
        change_type=price_change.change_type.value,
        change_reason=price_change.change_reason,
        effective_date=price_change.effective_date,
        before_cost=price_change.before_cost,
        after_cost=price_change.after_cost,
        eco_number=price_change.eco_number,
        created_by=price_change.created_by,
    )


@router.get(
    "",
    response_model=list[PriceChangeResponse],
    summary="단가 변경 목록 조회",
)
async def list_price_changes(
    use_case: Annotated[
        ListPriceChangesUseCase, Depends(get_list_price_changes_use_case)
    ],
    product_id: str | None = None,
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
) -> list[PriceChangeResponse]:
    """단가 변경 목록을 조회합니다."""
    changes = await use_case.execute(
        product_id=product_id,
        start_date=start_date,
        end_date=end_date,
    )
    return [
        PriceChangeResponse(
            change_id=c.change_id,
            product_id=c.product_id,
            change_type=c.change_type.value,
            change_reason=c.change_reason,
            effective_date=c.effective_date,
            before_cost=c.before_cost,
            after_cost=c.after_cost,
            eco_number=c.eco_number,
            created_by=c.created_by,
        )
        for c in changes
    ]


@router.get(
    "/{change_id}/compare",
    response_model=CostComparisonResponse,
    summary="원가 비교",
)
async def compare_costs(
    change_id: str,
    use_case: Annotated[CompareCostsUseCase, Depends(get_compare_costs_use_case)],
) -> CostComparisonResponse:
    """단가 변경 전/후 원가를 비교합니다."""
    result = await use_case.execute(change_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"단가 변경 '{change_id}'를 찾을 수 없습니다.",
        )
    return CostComparisonResponse(
        before_cost=result["before_cost"],
        after_cost=result["after_cost"],
        difference=result["difference"],
        change_rate=result["change_rate"],
    )
