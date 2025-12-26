"""Pydantic Schemas.

API 요청/응답 스키마 정의.
"""

from backend.presentation.schemas.bom_schema import (
    BOMCreate,
    BOMItemCreate,
    BOMItemResponse,
    BOMResponse,
)
from backend.presentation.schemas.cost_calculation_schema import (
    CalculateCostRequest,
    CompareCostRequest,
    CostBreakdownResponse,
    CostComparisonResponse,
    CostReportResponse,
    MaterialCostDetailResponse,
    ProcessCostDetailResponse,
    ProcessInfoRequest,
)
from backend.presentation.schemas.material_schema import (
    MaterialCreate,
    MaterialResponse,
    MaterialUpdate,
)
from backend.presentation.schemas.price_change_schema import (
    CostComparisonResponse as PriceChangeCostComparisonResponse,
)
from backend.presentation.schemas.price_change_schema import (
    PriceChangeCreate,
    PriceChangeResponse,
)
from backend.presentation.schemas.process_schema import (
    ProcessCreate,
    ProcessResponse,
    ProcessUpdate,
)
from backend.presentation.schemas.product_schema import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from backend.presentation.schemas.settlement_schema import (
    DailyBreakdownResponse,
    SettlementCalculateRequest,
    SettlementResultResponse,
    SettlementSummaryResponse,
)

__all__ = [
    # Material
    "MaterialCreate",
    "MaterialUpdate",
    "MaterialResponse",
    # Process
    "ProcessCreate",
    "ProcessUpdate",
    "ProcessResponse",
    # Product
    "ProductCreate",
    "ProductUpdate",
    "ProductResponse",
    # BOM
    "BOMCreate",
    "BOMItemCreate",
    "BOMItemResponse",
    "BOMResponse",
    # Price Change
    "PriceChangeCreate",
    "PriceChangeResponse",
    "PriceChangeCostComparisonResponse",
    # Settlement
    "SettlementCalculateRequest",
    "SettlementResultResponse",
    "SettlementSummaryResponse",
    "DailyBreakdownResponse",
    # Cost Calculation
    "CalculateCostRequest",
    "ProcessInfoRequest",
    "CostBreakdownResponse",
    "CostReportResponse",
    "CompareCostRequest",
    "CostComparisonResponse",
    "MaterialCostDetailResponse",
    "ProcessCostDetailResponse",
]
