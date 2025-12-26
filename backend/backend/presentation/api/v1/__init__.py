"""API v1.

API 버전 1 엔드포인트.
"""

from fastapi import APIRouter

from backend.presentation.api.v1.bom import router as bom_router
from backend.presentation.api.v1.cost_calculation import (
    router as cost_calculation_router,
)
from backend.presentation.api.v1.excel import router as excel_router
from backend.presentation.api.v1.materials import router as materials_router
from backend.presentation.api.v1.pdf import router as pdf_router
from backend.presentation.api.v1.price_changes import router as price_changes_router
from backend.presentation.api.v1.processes import router as processes_router
from backend.presentation.api.v1.products import router as products_router
from backend.presentation.api.v1.settlement import router as settlement_router

# Combined API v1 router
api_router = APIRouter(prefix="/api/v1")

# Include all routers
api_router.include_router(materials_router)
api_router.include_router(processes_router)
api_router.include_router(products_router)
api_router.include_router(bom_router)
api_router.include_router(price_changes_router)
api_router.include_router(settlement_router)
api_router.include_router(cost_calculation_router)
api_router.include_router(excel_router)
api_router.include_router(pdf_router)

__all__ = ["api_router"]
