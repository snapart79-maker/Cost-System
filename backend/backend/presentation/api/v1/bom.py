"""BOM API Router.

BOM API 엔드포인트.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from backend.application.dtos.bom_dto import BOMItemDTO, CreateBOMDTO
from backend.application.use_cases.bom_use_cases import (
    AddBOMItemUseCase,
    BOMNotFoundError,
    CreateBOMUseCase,
    DeleteBOMUseCase,
    GetBOMUseCase,
    RemoveBOMItemUseCase,
)
from backend.presentation.api.dependencies import (
    get_add_bom_item_use_case,
    get_create_bom_use_case,
    get_delete_bom_use_case,
    get_get_bom_use_case,
    get_remove_bom_item_use_case,
)
from backend.presentation.schemas.bom_schema import (
    BOMCreate,
    BOMItemCreate,
    BOMItemResponse,
    BOMResponse,
)

router = APIRouter(prefix="/bom", tags=["BOM"])


@router.post(
    "",
    response_model=BOMResponse,
    status_code=status.HTTP_201_CREATED,
    summary="BOM 생성",
)
async def create_bom(
    data: BOMCreate,
    use_case: Annotated[CreateBOMUseCase, Depends(get_create_bom_use_case)],
) -> BOMResponse:
    """새 BOM을 등록합니다."""
    items = [
        BOMItemDTO(
            material_id=item.material_id,
            quantity=item.quantity,
            work_type=item.work_type,
            sequence=item.sequence,
        )
        for item in data.items
    ]
    dto = CreateBOMDTO(
        product_id=data.product_id,
        version=data.version,
        items=items,
    )
    bom = await use_case.execute(dto)
    return BOMResponse(
        product_id=bom.product_id,
        version=bom.version,
        items=[
            BOMItemResponse(
                product_id=item.product_id,
                material_id=item.material_id,
                quantity=item.quantity,
                work_type=item.work_type.value,
                sequence=item.sequence or 0,
            )
            for item in bom.items
        ],
    )


@router.get(
    "/{product_id}",
    response_model=BOMResponse,
    summary="BOM 조회",
)
async def get_bom(
    product_id: str,
    use_case: Annotated[GetBOMUseCase, Depends(get_get_bom_use_case)],
) -> BOMResponse:
    """완제품 ID로 BOM을 조회합니다."""
    bom = await use_case.execute(product_id)
    if not bom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"완제품 '{product_id}'의 BOM을 찾을 수 없습니다.",
        )
    return BOMResponse(
        product_id=bom.product_id,
        version=bom.version,
        items=[
            BOMItemResponse(
                product_id=item.product_id,
                material_id=item.material_id,
                quantity=item.quantity,
                work_type=item.work_type.value,
                sequence=item.sequence or 0,
            )
            for item in bom.items
        ],
    )


@router.get(
    "/{product_id}/items",
    response_model=list[BOMItemResponse],
    summary="BOM 항목 목록 조회",
)
async def get_bom_items(
    product_id: str,
    use_case: Annotated[GetBOMUseCase, Depends(get_get_bom_use_case)],
) -> list[BOMItemResponse]:
    """BOM 항목 목록을 조회합니다."""
    bom = await use_case.execute(product_id)
    if not bom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"완제품 '{product_id}'의 BOM을 찾을 수 없습니다.",
        )
    return [
        BOMItemResponse(
            product_id=item.product_id,
            material_id=item.material_id,
            quantity=item.quantity,
            work_type=item.work_type.value,
            sequence=item.sequence or 0,
        )
        for item in bom.items
    ]


@router.post(
    "/{product_id}/items",
    response_model=BOMItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="BOM 항목 추가",
)
async def add_bom_item(
    product_id: str,
    data: BOMItemCreate,
    use_case: Annotated[AddBOMItemUseCase, Depends(get_add_bom_item_use_case)],
) -> BOMItemResponse:
    """BOM에 항목을 추가합니다."""
    dto = BOMItemDTO(
        material_id=data.material_id,
        quantity=data.quantity,
        work_type=data.work_type,
        sequence=data.sequence,
    )
    try:
        item = await use_case.execute(product_id, dto)
        return BOMItemResponse(
            product_id=item.product_id,
            material_id=item.material_id,
            quantity=item.quantity,
            work_type=item.work_type.value,
            sequence=item.sequence or 0,
        )
    except BOMNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete(
    "/{product_id}/items/{material_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="BOM 항목 삭제",
)
async def remove_bom_item(
    product_id: str,
    material_id: str,
    use_case: Annotated[RemoveBOMItemUseCase, Depends(get_remove_bom_item_use_case)],
) -> None:
    """BOM에서 항목을 삭제합니다."""
    result = await use_case.execute(product_id, material_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM 항목을 찾을 수 없습니다.",
        )


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="BOM 삭제",
)
async def delete_bom(
    product_id: str,
    use_case: Annotated[DeleteBOMUseCase, Depends(get_delete_bom_use_case)],
) -> None:
    """BOM을 삭제합니다."""
    result = await use_case.execute(product_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"완제품 '{product_id}'의 BOM을 찾을 수 없습니다.",
        )
