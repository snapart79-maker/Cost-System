"""Cost Calculation API Router.

원가 계산 API 엔드포인트.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from backend.application.dtos.cost_calculation_dto import (
    CalculateCostDTO,
    CompareCostDTO,
    PriceChange,
    ProcessInfo,
)
from backend.application.use_cases.cost_calculation_use_cases import (
    CalculateCostUseCase,
    CompareCostVersionsUseCase,
    GenerateCostBreakdownReportUseCase,
)
from backend.presentation.api.dependencies import (
    get_calculate_cost_use_case,
    get_compare_cost_versions_use_case,
    get_generate_cost_report_use_case,
)
from backend.presentation.schemas.cost_calculation_schema import (
    CalculateCostRequest,
    CompareCostRequest,
    CostBreakdownResponse,
    CostComparisonResponse,
    CostReportResponse,
    MaterialCostDetailResponse,
    ProcessCostDetailResponse,
    WorkTypeCostBreakdownResponse,
)

router = APIRouter(prefix="/cost-calculation", tags=["Cost Calculation"])


@router.post(
    "/calculate",
    response_model=CostBreakdownResponse,
    summary="원가 계산",
)
async def calculate_cost(
    data: CalculateCostRequest,
    use_case: Annotated[CalculateCostUseCase, Depends(get_calculate_cost_use_case)],
) -> CostBreakdownResponse:
    """원가를 계산합니다."""
    dto = CalculateCostDTO(
        product_id=data.product_id,
        processes=[
            ProcessInfo(
                process_id=p.process_id,
                cycle_time=p.cycle_time,
                workers=p.workers,
            )
            for p in data.processes
        ],
    )
    result = await use_case.execute(dto)

    # 내작/외작 원가 변환
    in_house_response = None
    if result.in_house:
        in_house_response = WorkTypeCostBreakdownResponse(
            material_cost=result.in_house.material_cost,
            labor_cost=result.in_house.labor_cost,
            machine_cost=result.in_house.machine_cost,
            manufacturing_cost=result.in_house.manufacturing_cost,
            material_management_fee=result.in_house.material_management_fee,
            general_admin_fee=result.in_house.general_admin_fee,
            defect_cost=result.in_house.defect_cost,
            profit=result.in_house.profit,
            purchase_cost=result.in_house.purchase_cost,
        )

    outsource_response = None
    if result.outsource:
        outsource_response = WorkTypeCostBreakdownResponse(
            material_cost=result.outsource.material_cost,
            labor_cost=result.outsource.labor_cost,
            machine_cost=result.outsource.machine_cost,
            manufacturing_cost=result.outsource.manufacturing_cost,
            material_management_fee=result.outsource.material_management_fee,
            general_admin_fee=result.outsource.general_admin_fee,
            defect_cost=result.outsource.defect_cost,
            profit=result.outsource.profit,
            purchase_cost=result.outsource.purchase_cost,
        )

    return CostBreakdownResponse(
        product_id=result.product_id,
        gross_material_cost=result.gross_material_cost,
        scrap_value=result.scrap_value,
        net_material_cost=result.net_material_cost,
        labor_cost=result.labor_cost,
        machine_cost=result.machine_cost,
        manufacturing_cost=result.manufacturing_cost,
        material_management_fee=result.material_management_fee,
        general_admin_fee=result.general_admin_fee,
        defect_cost=result.defect_cost,
        profit=result.profit,
        purchase_cost=result.purchase_cost,
        in_house=in_house_response,
        outsource=outsource_response,
        material_details=[
            MaterialCostDetailResponse(
                material_id=m.material_id,
                material_name=m.material_name,
                quantity=m.quantity,
                unit_price=m.unit_price,
                material_cost=m.material_cost,
                scrap_value=m.scrap_value,
                net_cost=m.net_cost,
                work_type=m.work_type,
            )
            for m in result.material_details
        ],
        process_details=[
            ProcessCostDetailResponse(
                process_id=p.process_id,
                process_name=p.process_name,
                cycle_time=p.cycle_time,
                workers=p.workers,
                labor_cost=p.labor_cost,
                machine_cost=p.machine_cost,
                total_cost=p.total_cost,
                work_type=p.work_type,
            )
            for p in result.process_details
        ],
    )


@router.get(
    "/report/{product_id}",
    response_model=CostReportResponse,
    summary="원가 계산서 생성",
)
async def generate_cost_report(
    product_id: str,
    use_case: Annotated[
        GenerateCostBreakdownReportUseCase, Depends(get_generate_cost_report_use_case)
    ],
) -> CostReportResponse:
    """원가 계산서를 생성합니다."""
    result = await use_case.execute(product_id)
    if not result.product_name:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"완제품 '{product_id}'를 찾을 수 없습니다.",
        )
    return CostReportResponse(
        product_id=result.product_id,
        product_name=result.product_name,
        customer=result.customer,
        car_model=result.car_model,
        material_details=[
            MaterialCostDetailResponse(
                material_id=m.material_id,
                material_name=m.material_name,
                quantity=m.quantity,
                unit_price=m.unit_price,
                material_cost=m.material_cost,
                scrap_value=m.scrap_value,
                net_cost=m.net_cost,
            )
            for m in result.material_details
        ],
        process_details=[
            ProcessCostDetailResponse(
                process_id=p.process_id,
                process_name=p.process_name,
                cycle_time=p.cycle_time,
                workers=p.workers,
                labor_cost=p.labor_cost,
                machine_cost=p.machine_cost,
                total_cost=p.total_cost,
            )
            for p in result.process_details
        ],
        total_cost=result.total_cost,
    )


@router.post(
    "/compare",
    response_model=CostComparisonResponse,
    summary="원가 버전 비교",
)
async def compare_cost_versions(
    data: CompareCostRequest,
    use_case: Annotated[
        CompareCostVersionsUseCase, Depends(get_compare_cost_versions_use_case)
    ],
) -> CostComparisonResponse:
    """원가 버전을 비교합니다."""
    dto = CompareCostDTO(
        product_id=data.product_id,
        price_changes=[
            PriceChange(
                material_id=p.material_id,
                process_id=p.process_id,
                new_price=p.new_price,
                new_labor_rate=p.new_labor_rate,
                new_machine_cost=p.new_machine_cost,
            )
            for p in data.price_changes
        ],
    )
    result = await use_case.execute(dto)
    return CostComparisonResponse(
        product_id=result.product_id,
        current_cost=result.current_cost,
        new_cost=result.new_cost,
        difference=result.difference,
        change_rate=result.change_rate,
    )
