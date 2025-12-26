"""Processes API Router.

공정 마스터 API 엔드포인트.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from backend.application.dtos.process_dto import CreateProcessDTO, UpdateProcessDTO
from backend.application.use_cases.process_use_cases import (
    CreateProcessUseCase,
    DeleteProcessUseCase,
    GetProcessUseCase,
    ListProcessesUseCase,
    ProcessAlreadyExistsError,
    ProcessNotFoundError,
    UpdateProcessUseCase,
)
from backend.domain.entities.process import WorkType
from backend.presentation.api.dependencies import (
    get_create_process_use_case,
    get_delete_process_use_case,
    get_get_process_use_case,
    get_list_processes_use_case,
    get_update_process_use_case,
)
from backend.presentation.schemas.process_schema import (
    ProcessCreate,
    ProcessResponse,
    ProcessUpdate,
)

router = APIRouter(prefix="/processes", tags=["Processes"])


@router.post(
    "",
    response_model=ProcessResponse,
    status_code=status.HTTP_201_CREATED,
    summary="공정 생성",
)
async def create_process(
    data: ProcessCreate,
    use_case: Annotated[CreateProcessUseCase, Depends(get_create_process_use_case)],
) -> ProcessResponse:
    """새 공정을 등록합니다."""
    dto = CreateProcessDTO(
        process_id=data.process_id,
        process_name=data.process_name,
        work_type=data.work_type,
        labor_rate=data.labor_rate,
        machine_cost=data.machine_cost,
        efficiency=data.efficiency,
    )
    try:
        process = await use_case.execute(dto)
        return ProcessResponse(
            process_id=process.process_id,
            process_name=process.process_name,
            work_type=process.work_type.value,
            labor_rate=process.labor_rate,
            machine_cost=process.machine_cost,
            efficiency=process.efficiency,
        )
    except ProcessAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get(
    "/{process_id}",
    response_model=ProcessResponse,
    summary="공정 조회",
)
async def get_process(
    process_id: str,
    use_case: Annotated[GetProcessUseCase, Depends(get_get_process_use_case)],
) -> ProcessResponse:
    """공정 ID로 조회합니다."""
    process = await use_case.execute(process_id)
    if not process:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"공정 '{process_id}'를 찾을 수 없습니다.",
        )
    return ProcessResponse(
        process_id=process.process_id,
        process_name=process.process_name,
        work_type=process.work_type.value,
        labor_rate=process.labor_rate,
        machine_cost=process.machine_cost,
        efficiency=process.efficiency,
    )


@router.get(
    "",
    response_model=list[ProcessResponse],
    summary="공정 목록 조회",
)
async def list_processes(
    use_case: Annotated[ListProcessesUseCase, Depends(get_list_processes_use_case)],
    work_type: str | None = None,
) -> list[ProcessResponse]:
    """공정 목록을 조회합니다."""
    if work_type:
        try:
            wt = WorkType(work_type)
            processes = await use_case.execute(work_type=wt)
        except ValueError:
            processes = await use_case.execute()
    else:
        processes = await use_case.execute()

    return [
        ProcessResponse(
            process_id=p.process_id,
            process_name=p.process_name,
            work_type=p.work_type.value,
            labor_rate=p.labor_rate,
            machine_cost=p.machine_cost,
            efficiency=p.efficiency,
        )
        for p in processes
    ]


@router.patch(
    "/{process_id}",
    response_model=ProcessResponse,
    summary="공정 수정",
)
async def update_process(
    process_id: str,
    data: ProcessUpdate,
    use_case: Annotated[UpdateProcessUseCase, Depends(get_update_process_use_case)],
) -> ProcessResponse:
    """공정 정보를 수정합니다."""
    dto = UpdateProcessDTO(
        process_id=process_id,
        process_name=data.process_name,
        labor_rate=data.labor_rate,
        machine_cost=data.machine_cost,
        efficiency=data.efficiency,
    )
    try:
        process = await use_case.execute(dto)
        return ProcessResponse(
            process_id=process.process_id,
            process_name=process.process_name,
            work_type=process.work_type.value,
            labor_rate=process.labor_rate,
            machine_cost=process.machine_cost,
            efficiency=process.efficiency,
        )
    except ProcessNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete(
    "/{process_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="공정 삭제",
)
async def delete_process(
    process_id: str,
    use_case: Annotated[DeleteProcessUseCase, Depends(get_delete_process_use_case)],
) -> None:
    """공정을 삭제합니다."""
    result = await use_case.execute(process_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"공정 '{process_id}'를 찾을 수 없습니다.",
        )
