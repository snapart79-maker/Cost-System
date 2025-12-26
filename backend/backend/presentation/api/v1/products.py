"""Products API Router.

완제품 마스터 API 엔드포인트.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from backend.application.dtos.product_dto import CreateProductDTO, UpdateProductDTO
from backend.application.use_cases.product_use_cases import (
    CreateProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    ListProductsUseCase,
    ProductAlreadyExistsError,
    ProductNotFoundError,
    UpdateProductUseCase,
)
from backend.domain.entities.product import ProductStatus
from backend.presentation.api.dependencies import (
    get_create_product_use_case,
    get_delete_product_use_case,
    get_get_product_use_case,
    get_list_products_use_case,
    get_update_product_use_case,
)
from backend.presentation.schemas.product_schema import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="완제품 생성",
)
async def create_product(
    data: ProductCreate,
    use_case: Annotated[CreateProductUseCase, Depends(get_create_product_use_case)],
) -> ProductResponse:
    """새 완제품을 등록합니다."""
    dto = CreateProductDTO(
        product_id=data.product_id,
        product_name=data.product_name,
        status=data.status,
        customer=data.customer,
        car_model=data.car_model,
    )
    try:
        product = await use_case.execute(dto)
        return ProductResponse(
            product_id=product.product_id,
            product_name=product.product_name,
            status=product.status.value,
            customer=product.customer,
            car_model=product.car_model,
        )
    except ProductAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="완제품 조회",
)
async def get_product(
    product_id: str,
    use_case: Annotated[GetProductUseCase, Depends(get_get_product_use_case)],
) -> ProductResponse:
    """완제품 ID로 조회합니다."""
    product = await use_case.execute(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"완제품 '{product_id}'를 찾을 수 없습니다.",
        )
    return ProductResponse(
        product_id=product.product_id,
        product_name=product.product_name,
        status=product.status.value,
        customer=product.customer,
        car_model=product.car_model,
    )


@router.get(
    "",
    response_model=list[ProductResponse],
    summary="완제품 목록 조회",
)
async def list_products(
    use_case: Annotated[ListProductsUseCase, Depends(get_list_products_use_case)],
    customer: str | None = None,
    status: str | None = None,
) -> list[ProductResponse]:
    """완제품 목록을 조회합니다."""
    import contextlib

    product_status = None
    if status:
        with contextlib.suppress(ValueError):
            product_status = ProductStatus(status)

    # Use Case는 status만 지원, customer 필터링은 결과에서 수행
    products = await use_case.execute(status=product_status)

    # customer 필터 적용
    if customer:
        products = [p for p in products if p.customer == customer]

    return [
        ProductResponse(
            product_id=p.product_id,
            product_name=p.product_name,
            status=p.status.value,
            customer=p.customer,
            car_model=p.car_model,
        )
        for p in products
    ]


@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
    summary="완제품 수정",
)
async def update_product(
    product_id: str,
    data: ProductUpdate,
    use_case: Annotated[UpdateProductUseCase, Depends(get_update_product_use_case)],
) -> ProductResponse:
    """완제품 정보를 수정합니다."""
    dto = UpdateProductDTO(
        product_id=product_id,
        product_name=data.product_name,
        status=data.status,
        customer=data.customer,
        car_model=data.car_model,
    )
    try:
        product = await use_case.execute(dto)
        return ProductResponse(
            product_id=product.product_id,
            product_name=product.product_name,
            status=product.status.value,
            customer=product.customer,
            car_model=product.car_model,
        )
    except ProductNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="완제품 삭제",
)
async def delete_product(
    product_id: str,
    use_case: Annotated[DeleteProductUseCase, Depends(get_delete_product_use_case)],
) -> None:
    """완제품을 삭제합니다."""
    result = await use_case.execute(product_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"완제품 '{product_id}'를 찾을 수 없습니다.",
        )
