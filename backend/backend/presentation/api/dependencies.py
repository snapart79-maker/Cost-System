"""API Dependencies.

FastAPI 의존성 주입 설정.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from datetime import date
from decimal import Decimal
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.application.use_cases.bom_use_cases import (
    AddBOMItemUseCase,
    CreateBOMUseCase,
    DeleteBOMUseCase,
    GetBOMUseCase,
    RemoveBOMItemUseCase,
)
from backend.application.use_cases.cost_calculation_use_cases import (
    CalculateCostUseCase,
    CompareCostVersionsUseCase,
    GenerateCostBreakdownReportUseCase,
)
from backend.application.use_cases.material_use_cases import (
    CreateMaterialUseCase,
    DeleteMaterialUseCase,
    GetMaterialUseCase,
    ListMaterialsUseCase,
    UpdateMaterialUseCase,
)
from backend.application.use_cases.price_change_use_cases import (
    CompareCostsUseCase,
    GetPriceChangeUseCase,
    ListPriceChangesUseCase,
    RegisterPriceChangeUseCase,
)
from backend.application.use_cases.process_use_cases import (
    CreateProcessUseCase,
    DeleteProcessUseCase,
    GetProcessUseCase,
    ListProcessesUseCase,
    UpdateProcessUseCase,
)
from backend.application.use_cases.product_use_cases import (
    CreateProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
)
from backend.application.use_cases.settlement_use_cases import (
    CalculateSettlementUseCase,
    GetDailyBreakdownUseCase,
    GetSettlementSummaryUseCase,
    ReceiptRepository,
)
from backend.infrastructure.persistence import get_async_session
from backend.infrastructure.persistence.repositories import (
    SQLAlchemyBOMRepository,
    SQLAlchemyMaterialRepository,
    SQLAlchemyPriceChangeRepository,
    SQLAlchemyProcessRepository,
    SQLAlchemyProductRepository,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """데이터베이스 세션 의존성."""
    async for session in get_async_session():
        yield session


# Type aliases for dependency injection
SessionDep = Annotated[AsyncSession, Depends(get_session)]


# Repository Dependencies
def get_material_repository(session: SessionDep) -> SQLAlchemyMaterialRepository:
    """자재 Repository 의존성."""
    return SQLAlchemyMaterialRepository(session)


def get_process_repository(session: SessionDep) -> SQLAlchemyProcessRepository:
    """공정 Repository 의존성."""
    return SQLAlchemyProcessRepository(session)


def get_product_repository(session: SessionDep) -> SQLAlchemyProductRepository:
    """완제품 Repository 의존성."""
    return SQLAlchemyProductRepository(session)


def get_bom_repository(session: SessionDep) -> SQLAlchemyBOMRepository:
    """BOM Repository 의존성."""
    return SQLAlchemyBOMRepository(session)


def get_price_change_repository(session: SessionDep) -> SQLAlchemyPriceChangeRepository:
    """단가 변경 Repository 의존성."""
    return SQLAlchemyPriceChangeRepository(session)


# Material Use Case Dependencies
MaterialRepoDep = Annotated[
    SQLAlchemyMaterialRepository, Depends(get_material_repository)
]


def get_create_material_use_case(
    repo: MaterialRepoDep,
) -> CreateMaterialUseCase:
    """자재 생성 Use Case 의존성."""
    return CreateMaterialUseCase(repo)


def get_get_material_use_case(
    repo: MaterialRepoDep,
) -> GetMaterialUseCase:
    """자재 조회 Use Case 의존성."""
    return GetMaterialUseCase(repo)


def get_list_materials_use_case(
    repo: MaterialRepoDep,
) -> ListMaterialsUseCase:
    """자재 목록 조회 Use Case 의존성."""
    return ListMaterialsUseCase(repo)


def get_update_material_use_case(
    repo: MaterialRepoDep,
) -> UpdateMaterialUseCase:
    """자재 수정 Use Case 의존성."""
    return UpdateMaterialUseCase(repo)


def get_delete_material_use_case(
    repo: MaterialRepoDep,
) -> DeleteMaterialUseCase:
    """자재 삭제 Use Case 의존성."""
    return DeleteMaterialUseCase(repo)


# Process Use Case Dependencies
ProcessRepoDep = Annotated[SQLAlchemyProcessRepository, Depends(get_process_repository)]


def get_create_process_use_case(
    repo: ProcessRepoDep,
) -> CreateProcessUseCase:
    """공정 생성 Use Case 의존성."""
    return CreateProcessUseCase(repo)


def get_get_process_use_case(
    repo: ProcessRepoDep,
) -> GetProcessUseCase:
    """공정 조회 Use Case 의존성."""
    return GetProcessUseCase(repo)


def get_list_processes_use_case(
    repo: ProcessRepoDep,
) -> ListProcessesUseCase:
    """공정 목록 조회 Use Case 의존성."""
    return ListProcessesUseCase(repo)


def get_update_process_use_case(
    repo: ProcessRepoDep,
) -> UpdateProcessUseCase:
    """공정 수정 Use Case 의존성."""
    return UpdateProcessUseCase(repo)


def get_delete_process_use_case(
    repo: ProcessRepoDep,
) -> DeleteProcessUseCase:
    """공정 삭제 Use Case 의존성."""
    return DeleteProcessUseCase(repo)


# Product Use Case Dependencies
ProductRepoDep = Annotated[SQLAlchemyProductRepository, Depends(get_product_repository)]


def get_create_product_use_case(
    repo: ProductRepoDep,
) -> CreateProductUseCase:
    """완제품 생성 Use Case 의존성."""
    return CreateProductUseCase(repo)


def get_get_product_use_case(
    repo: ProductRepoDep,
) -> GetProductUseCase:
    """완제품 조회 Use Case 의존성."""
    return GetProductUseCase(repo)


def get_list_products_use_case(
    repo: ProductRepoDep,
) -> ListProductsUseCase:
    """완제품 목록 조회 Use Case 의존성."""
    return ListProductsUseCase(repo)


def get_update_product_use_case(
    repo: ProductRepoDep,
) -> UpdateProductUseCase:
    """완제품 수정 Use Case 의존성."""
    return UpdateProductUseCase(repo)


def get_delete_product_use_case(
    repo: ProductRepoDep,
) -> DeleteProductUseCase:
    """완제품 삭제 Use Case 의존성."""
    return DeleteProductUseCase(repo)


# BOM Use Case Dependencies
BOMRepoDep = Annotated[SQLAlchemyBOMRepository, Depends(get_bom_repository)]


def get_create_bom_use_case(
    repo: BOMRepoDep,
) -> CreateBOMUseCase:
    """BOM 생성 Use Case 의존성."""
    return CreateBOMUseCase(repo)


def get_get_bom_use_case(
    repo: BOMRepoDep,
) -> GetBOMUseCase:
    """BOM 조회 Use Case 의존성."""
    return GetBOMUseCase(repo)


def get_add_bom_item_use_case(
    repo: BOMRepoDep,
) -> AddBOMItemUseCase:
    """BOM 항목 추가 Use Case 의존성."""
    return AddBOMItemUseCase(repo)


def get_remove_bom_item_use_case(
    repo: BOMRepoDep,
) -> RemoveBOMItemUseCase:
    """BOM 항목 삭제 Use Case 의존성."""
    return RemoveBOMItemUseCase(repo)


def get_delete_bom_use_case(
    repo: BOMRepoDep,
) -> DeleteBOMUseCase:
    """BOM 삭제 Use Case 의존성."""
    return DeleteBOMUseCase(repo)


# Price Change Use Case Dependencies
PriceChangeRepoDep = Annotated[
    SQLAlchemyPriceChangeRepository, Depends(get_price_change_repository)
]


def get_register_price_change_use_case(
    price_change_repo: PriceChangeRepoDep,
    material_repo: MaterialRepoDep,
    process_repo: ProcessRepoDep,
    product_repo: ProductRepoDep,
    bom_repo: BOMRepoDep,
) -> RegisterPriceChangeUseCase:
    """단가 변경 등록 Use Case 의존성."""
    return RegisterPriceChangeUseCase(
        price_change_repo=price_change_repo,
        material_repo=material_repo,
        process_repo=process_repo,
        product_repo=product_repo,
        bom_repo=bom_repo,
    )


def get_get_price_change_use_case(
    repo: PriceChangeRepoDep,
) -> GetPriceChangeUseCase:
    """단가 변경 조회 Use Case 의존성."""
    return GetPriceChangeUseCase(repo)


def get_list_price_changes_use_case(
    repo: PriceChangeRepoDep,
) -> ListPriceChangesUseCase:
    """단가 변경 목록 조회 Use Case 의존성."""
    return ListPriceChangesUseCase(repo)


def get_compare_costs_use_case(
    repo: PriceChangeRepoDep,
) -> CompareCostsUseCase:
    """원가 비교 Use Case 의존성."""
    return CompareCostsUseCase(repo)


# Cost Calculation Use Case Dependencies
def get_calculate_cost_use_case(
    material_repo: MaterialRepoDep,
    process_repo: ProcessRepoDep,
    bom_repo: BOMRepoDep,
) -> CalculateCostUseCase:
    """원가 계산 Use Case 의존성."""
    return CalculateCostUseCase(
        material_repo=material_repo,
        process_repo=process_repo,
        bom_repo=bom_repo,
    )


def get_generate_cost_report_use_case(
    material_repo: MaterialRepoDep,
    process_repo: ProcessRepoDep,
    product_repo: ProductRepoDep,
    bom_repo: BOMRepoDep,
) -> GenerateCostBreakdownReportUseCase:
    """원가 계산서 생성 Use Case 의존성."""
    return GenerateCostBreakdownReportUseCase(
        material_repo=material_repo,
        process_repo=process_repo,
        product_repo=product_repo,
        bom_repo=bom_repo,
    )


def get_compare_cost_versions_use_case(
    material_repo: MaterialRepoDep,
    process_repo: ProcessRepoDep,
    bom_repo: BOMRepoDep,
) -> CompareCostVersionsUseCase:
    """원가 버전 비교 Use Case 의존성."""
    return CompareCostVersionsUseCase(
        material_repo=material_repo,
        process_repo=process_repo,
        bom_repo=bom_repo,
    )


# Settlement Use Case Dependencies (Simplified - no actual Receipt Repository)
class MockReceiptRepository(ReceiptRepository):
    """Mock Receipt Repository (실제 구현 필요)."""

    async def get_daily_quantities(
        self,
        product_id: str,  # noqa: ARG002
        start_date: date,  # noqa: ARG002
        end_date: date,  # noqa: ARG002
    ) -> dict[date, Decimal]:
        """일별 입고 수량 조회 (Mock)."""
        return {}


def get_receipt_repository() -> MockReceiptRepository:
    """입고 Repository 의존성 (Mock)."""
    return MockReceiptRepository()


ReceiptRepoDep = Annotated[MockReceiptRepository, Depends(get_receipt_repository)]


def get_calculate_settlement_use_case(
    price_change_repo: PriceChangeRepoDep,
    receipt_repo: ReceiptRepoDep,
) -> CalculateSettlementUseCase:
    """정산 금액 계산 Use Case 의존성."""
    return CalculateSettlementUseCase(
        price_change_repo=price_change_repo,
        receipt_repo=receipt_repo,
    )


def get_settlement_summary_use_case(
    price_change_repo: PriceChangeRepoDep,
    receipt_repo: ReceiptRepoDep,
) -> GetSettlementSummaryUseCase:
    """정산 요약 Use Case 의존성."""
    return GetSettlementSummaryUseCase(
        price_change_repo=price_change_repo,
        receipt_repo=receipt_repo,
    )


def get_daily_breakdown_use_case(
    price_change_repo: PriceChangeRepoDep,
    receipt_repo: ReceiptRepoDep,
) -> GetDailyBreakdownUseCase:
    """일별 정산 상세 Use Case 의존성."""
    return GetDailyBreakdownUseCase(
        price_change_repo=price_change_repo,
        receipt_repo=receipt_repo,
    )
