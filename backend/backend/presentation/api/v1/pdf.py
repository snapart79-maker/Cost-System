"""PDF API Router.

PDF 보고서 생성 API 엔드포인트.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from backend.infrastructure.pdf import PDFService
from backend.presentation.api.dependencies import (
    BOMRepoDep,
    MaterialRepoDep,
    PriceChangeRepoDep,
    ProcessRepoDep,
    ProductRepoDep,
)

router = APIRouter(prefix="/pdf", tags=["PDF"])


def get_pdf_service() -> PDFService:
    """PDF 서비스 의존성."""
    return PDFService()


PDFServiceDep = Annotated[PDFService, Depends(get_pdf_service)]


@router.get(
    "/cost-breakdown/{product_id}",
    summary="원가 계산서 PDF 다운로드",
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "PDF 파일",
        }
    },
)
async def download_cost_breakdown_pdf(
    product_id: str,
    product_repo: ProductRepoDep,
    material_repo: MaterialRepoDep,
    process_repo: ProcessRepoDep,
    bom_repo: BOMRepoDep,
    pdf_service: PDFServiceDep,
) -> StreamingResponse:
    """완제품의 원가 계산서를 PDF로 다운로드합니다."""
    # 완제품 조회
    product = await product_repo.get_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{product_id}' not found",
        )

    # BOM 조회
    bom = await bom_repo.get_by_product_id(product_id)

    # 자재 및 공정 데이터 수집
    materials_data = []
    processes_data = []
    material_cost = Decimal("0")
    labor_cost = Decimal("0")
    overhead_cost = Decimal("0")

    if bom:
        for item in bom.items:
            material = await material_repo.get_by_id(item.material_id)
            if material:
                amount = material.unit_price * item.quantity
                material_cost += amount
                materials_data.append({
                    "material_id": material.material_id,
                    "material_name": material.material_name,
                    "specification": material.specification or "",
                    "unit": material.unit.value,
                    "quantity": item.quantity,
                    "unit_price": material.unit_price,
                    "amount": amount,
                })

    # 공정 조회
    all_processes = await process_repo.get_all()
    for proc in all_processes:
        proc_labor = proc.labor_rate
        proc_machine = proc.machine_cost
        labor_cost += proc_labor
        overhead_cost += proc_machine
        processes_data.append({
            "process_id": proc.process_id,
            "process_name": proc.process_name,
            "work_type": proc.work_type.value,
            "labor_cost": proc_labor,
            "machine_cost": proc_machine,
            "total_cost": proc_labor + proc_machine,
        })

    # 원가 계산
    manufacturing_cost = material_cost + labor_cost + overhead_cost
    material_mgmt_fee = manufacturing_cost * Decimal("0.03")
    general_admin_fee = manufacturing_cost * Decimal("0.05")
    defect_cost = manufacturing_cost * Decimal("0.01")
    profit = manufacturing_cost * Decimal("0.10")
    purchase_cost = manufacturing_cost + material_mgmt_fee + general_admin_fee + defect_cost + profit

    # PDF 데이터 구성
    pdf_data = {
        "product_id": product.product_id,
        "product_name": product.product_name,
        "customer": product.customer or "-",
        "car_model": product.car_model or "-",
        "calculation_date": date.today(),
        "version": "1.0",
        "material_cost": material_cost,
        "labor_cost": labor_cost,
        "overhead_cost": overhead_cost,
        "manufacturing_cost": manufacturing_cost,
        "material_management_fee": material_mgmt_fee,
        "general_admin_fee": general_admin_fee,
        "defect_cost": defect_cost,
        "profit": profit,
        "purchase_cost": purchase_cost,
        "materials": materials_data,
        "processes": processes_data,
    }

    pdf_buffer = pdf_service.generate_cost_breakdown(pdf_data)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=cost_breakdown_{product_id}.pdf"
        },
    )


@router.get(
    "/settlement/{change_id}",
    summary="정산 보고서 PDF 다운로드",
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "PDF 파일",
        }
    },
)
async def download_settlement_pdf(
    change_id: str,
    price_change_repo: PriceChangeRepoDep,
    product_repo: ProductRepoDep,
    pdf_service: PDFServiceDep,
) -> StreamingResponse:
    """단가 변경에 대한 정산 보고서를 PDF로 다운로드합니다."""
    # 단가 변경 조회
    price_change = await price_change_repo.get_by_id(change_id)
    if not price_change:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Price change '{change_id}' not found",
        )

    # 완제품 조회
    product = await product_repo.get_by_id(price_change.product_id)

    # PDF 데이터 구성
    pdf_data = {
        "product_id": price_change.product_id,
        "product_name": product.product_name if product else "-",
        "customer": product.customer if product else "-",
        "period_start": price_change.effective_date,
        "period_end": date.today(),
        "change_reason": price_change.change_reason,
        "eco_number": price_change.eco_number or "-",
        "effective_date": price_change.effective_date,
        "before_cost": price_change.before_cost,
        "after_cost": price_change.after_cost,
        "cost_difference": price_change.after_cost - price_change.before_cost,
        "change_rate": (
            ((price_change.after_cost - price_change.before_cost) / price_change.before_cost * 100)
            if price_change.before_cost > 0
            else Decimal("0")
        ),
        "total_quantity": Decimal("0"),  # Mock - 실제 입고 데이터 필요
        "settlement_amount": Decimal("0"),  # Mock - 실제 계산 필요
    }

    pdf_buffer = pdf_service.generate_settlement_report(pdf_data)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=settlement_{change_id}.pdf"
        },
    )


@router.get(
    "/materials",
    summary="자재 목록 PDF 다운로드",
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "PDF 파일",
        }
    },
)
async def download_materials_pdf(
    material_repo: MaterialRepoDep,
    pdf_service: PDFServiceDep,
) -> StreamingResponse:
    """자재 목록을 PDF로 다운로드합니다."""
    materials = await material_repo.get_all()

    materials_data = [
        {
            "material_id": m.material_id,
            "material_name": m.material_name,
            "material_type": m.material_type.value,
            "unit": m.unit.value,
            "unit_price": m.unit_price,
            "effective_date": m.effective_date,
        }
        for m in materials
    ]

    pdf_buffer = pdf_service.generate_material_list(materials_data)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=materials.pdf"},
    )
