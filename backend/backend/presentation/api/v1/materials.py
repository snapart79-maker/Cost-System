"""Materials API Router.

자재 마스터 API 엔드포인트.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from backend.application.dtos.material_dto import CreateMaterialDTO, UpdateMaterialDTO
from backend.application.use_cases.material_use_cases import (
    CreateMaterialUseCase,
    DeleteMaterialUseCase,
    GetMaterialUseCase,
    ListMaterialsUseCase,
    MaterialAlreadyExistsError,
    MaterialNotFoundError,
    UpdateMaterialUseCase,
)
from backend.domain.entities.material import MaterialType
from backend.presentation.api.dependencies import (
    get_create_material_use_case,
    get_delete_material_use_case,
    get_get_material_use_case,
    get_list_materials_use_case,
    get_update_material_use_case,
)
from backend.presentation.schemas.material_schema import (
    MaterialCreate,
    MaterialResponse,
    MaterialUpdate,
)

router = APIRouter(prefix="/materials", tags=["Materials"])


@router.post(
    "",
    response_model=MaterialResponse,
    status_code=status.HTTP_201_CREATED,
    summary="자재 생성",
)
async def create_material(
    data: MaterialCreate,
    use_case: Annotated[CreateMaterialUseCase, Depends(get_create_material_use_case)],
) -> MaterialResponse:
    """새 자재를 등록합니다."""
    dto = CreateMaterialDTO(
        material_id=data.material_id,
        material_name=data.material_name,
        material_type=data.material_type,
        unit=data.unit,
        unit_price=data.unit_price,
        effective_date=data.effective_date,
        specification=data.specification,
        scrap_rate=data.scrap_rate,
    )
    try:
        material = await use_case.execute(dto)
        return MaterialResponse(
            material_id=material.material_id,
            material_name=material.material_name,
            material_type=material.material_type.value,
            unit=material.unit.value,
            unit_price=material.unit_price,
            effective_date=material.effective_date,
            specification=material.specification,
            scrap_rate=material.scrap_rate,
        )
    except MaterialAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get(
    "/{material_id}",
    response_model=MaterialResponse,
    summary="자재 조회",
)
async def get_material(
    material_id: str,
    use_case: Annotated[GetMaterialUseCase, Depends(get_get_material_use_case)],
) -> MaterialResponse:
    """자재 ID로 조회합니다."""
    material = await use_case.execute(material_id)
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"자재 '{material_id}'를 찾을 수 없습니다.",
        )
    return MaterialResponse(
        material_id=material.material_id,
        material_name=material.material_name,
        material_type=material.material_type.value,
        unit=material.unit.value,
        unit_price=material.unit_price,
        effective_date=material.effective_date,
        specification=material.specification,
        scrap_rate=material.scrap_rate,
    )


@router.get(
    "",
    response_model=list[MaterialResponse],
    summary="자재 목록 조회",
)
async def list_materials(
    use_case: Annotated[ListMaterialsUseCase, Depends(get_list_materials_use_case)],
    material_type: str | None = None,
) -> list[MaterialResponse]:
    """자재 목록을 조회합니다."""
    if material_type:
        try:
            mt = MaterialType(material_type)
            materials = await use_case.execute(material_type=mt)
        except ValueError:
            materials = await use_case.execute()
    else:
        materials = await use_case.execute()

    return [
        MaterialResponse(
            material_id=m.material_id,
            material_name=m.material_name,
            material_type=m.material_type.value,
            unit=m.unit.value,
            unit_price=m.unit_price,
            effective_date=m.effective_date,
            specification=m.specification,
            scrap_rate=m.scrap_rate,
        )
        for m in materials
    ]


@router.patch(
    "/{material_id}",
    response_model=MaterialResponse,
    summary="자재 수정",
)
async def update_material(
    material_id: str,
    data: MaterialUpdate,
    use_case: Annotated[UpdateMaterialUseCase, Depends(get_update_material_use_case)],
) -> MaterialResponse:
    """자재 정보를 수정합니다."""
    dto = UpdateMaterialDTO(
        material_id=material_id,
        material_name=data.material_name,
        unit_price=data.unit_price,
        effective_date=data.effective_date,
        specification=data.specification,
        scrap_rate=data.scrap_rate,
    )
    try:
        material = await use_case.execute(dto)
        return MaterialResponse(
            material_id=material.material_id,
            material_name=material.material_name,
            material_type=material.material_type.value,
            unit=material.unit.value,
            unit_price=material.unit_price,
            effective_date=material.effective_date,
            specification=material.specification,
            scrap_rate=material.scrap_rate,
        )
    except MaterialNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete(
    "/{material_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="자재 삭제",
)
async def delete_material(
    material_id: str,
    use_case: Annotated[DeleteMaterialUseCase, Depends(get_delete_material_use_case)],
) -> None:
    """자재를 삭제합니다."""
    result = await use_case.execute(material_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"자재 '{material_id}'를 찾을 수 없습니다.",
        )
