"""Excel API Router.

Excel Import/Export API 엔드포인트.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse

from backend.infrastructure.excel import ExcelExportService, ExcelImportService
from backend.presentation.api.dependencies import (
    MaterialRepoDep,
    ProcessRepoDep,
)
from backend.presentation.schemas.excel_schema import (
    ExcelImportError,
    ExcelImportResponse,
)

router = APIRouter(prefix="/excel", tags=["Excel"])


def get_excel_import_service() -> ExcelImportService:
    """Excel Import 서비스 의존성."""
    return ExcelImportService()


def get_excel_export_service() -> ExcelExportService:
    """Excel Export 서비스 의존성."""
    return ExcelExportService()


ExcelImportDep = Annotated[ExcelImportService, Depends(get_excel_import_service)]
ExcelExportDep = Annotated[ExcelExportService, Depends(get_excel_export_service)]


@router.post(
    "/import/materials",
    response_model=ExcelImportResponse,
    summary="자재 데이터 Import",
)
async def import_materials(
    file: UploadFile = File(..., description="Excel 파일 (.xlsx)"),
    import_service: ExcelImportDep = None,  # type: ignore
) -> ExcelImportResponse:
    """Excel 파일에서 자재 데이터를 Import합니다."""
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Excel 파일(.xlsx, .xls)만 업로드 가능합니다.",
        )

    content = await file.read()
    from io import BytesIO

    result = import_service.import_materials(BytesIO(content))

    errors = [
        ExcelImportError(row=e.row, column=e.column, message=e.message)
        for e in result.errors
    ]

    return ExcelImportResponse(
        success=result.success,
        total_rows=result.total_rows,
        imported_count=result.imported_count,
        error_count=result.error_count,
        errors=errors,
    )


@router.post(
    "/import/bom",
    response_model=ExcelImportResponse,
    summary="BOM 데이터 Import",
)
async def import_bom(
    file: UploadFile = File(..., description="Excel 파일 (.xlsx)"),
    import_service: ExcelImportDep = None,  # type: ignore
) -> ExcelImportResponse:
    """Excel 파일에서 BOM 데이터를 Import합니다."""
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Excel 파일(.xlsx, .xls)만 업로드 가능합니다.",
        )

    content = await file.read()
    from io import BytesIO

    result = import_service.import_bom(BytesIO(content))

    errors = [
        ExcelImportError(row=e.row, column=e.column, message=e.message)
        for e in result.errors
    ]

    return ExcelImportResponse(
        success=result.success,
        total_rows=result.total_rows,
        imported_count=result.imported_count,
        error_count=result.error_count,
        errors=errors,
    )


@router.post(
    "/import/processes",
    response_model=ExcelImportResponse,
    summary="공정 데이터 Import",
)
async def import_processes(
    file: UploadFile = File(..., description="Excel 파일 (.xlsx)"),
    import_service: ExcelImportDep = None,  # type: ignore
) -> ExcelImportResponse:
    """Excel 파일에서 공정 데이터를 Import합니다."""
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Excel 파일(.xlsx, .xls)만 업로드 가능합니다.",
        )

    content = await file.read()
    from io import BytesIO

    result = import_service.import_processes(BytesIO(content))

    errors = [
        ExcelImportError(row=e.row, column=e.column, message=e.message)
        for e in result.errors
    ]

    return ExcelImportResponse(
        success=result.success,
        total_rows=result.total_rows,
        imported_count=result.imported_count,
        error_count=result.error_count,
        errors=errors,
    )


@router.get(
    "/export/materials",
    summary="자재 목록 Export",
    responses={
        200: {
            "content": {"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {}},
            "description": "Excel 파일",
        }
    },
)
async def export_materials(
    material_repo: MaterialRepoDep,
    export_service: ExcelExportDep,
) -> StreamingResponse:
    """자재 목록을 Excel 파일로 Export합니다."""
    materials = await material_repo.get_all()

    materials_data = [
        {
            "material_id": m.material_id,
            "material_name": m.material_name,
            "material_type": m.material_type.value,
            "unit": m.unit.value,
            "unit_price": m.unit_price,
            "effective_date": m.effective_date,
            "specification": m.specification,
            "scrap_rate": m.scrap_rate,
        }
        for m in materials
    ]

    excel_file = export_service.export_materials(materials_data)

    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=materials.xlsx"},
    )


@router.get(
    "/export/processes",
    summary="공정 목록 Export",
    responses={
        200: {
            "content": {"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {}},
            "description": "Excel 파일",
        }
    },
)
async def export_processes(
    process_repo: ProcessRepoDep,
    export_service: ExcelExportDep,
) -> StreamingResponse:
    """공정 목록을 Excel 파일로 Export합니다."""
    processes = await process_repo.get_all()

    processes_data = [
        {
            "process_id": p.process_id,
            "process_name": p.process_name,
            "work_type": p.work_type.value,
            "labor_rate": p.labor_rate,
            "machine_cost": p.machine_cost,
            "efficiency": p.efficiency,
        }
        for p in processes
    ]

    # 공정 데이터용 export 메서드 사용 (materials 형식으로 대체)
    excel_file = export_service.export_materials(processes_data)

    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=processes.xlsx"},
    )
