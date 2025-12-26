"""Application Use Cases.

비즈니스 유스케이스 구현.
"""

from backend.application.use_cases.bom_use_cases import (
    AddBOMItemUseCase,
    BOMNotFoundError,
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
    MaterialAlreadyExistsError,
    MaterialNotFoundError,
    UpdateMaterialUseCase,
)
from backend.application.use_cases.price_change_use_cases import (
    CompareCostsUseCase,
    GetPriceChangeUseCase,
    ListPriceChangesUseCase,
    ProductNotFoundError,
    RegisterPriceChangeUseCase,
)
from backend.application.use_cases.process_use_cases import (
    CreateProcessUseCase,
    DeleteProcessUseCase,
    GetProcessUseCase,
    ListProcessesUseCase,
    ProcessAlreadyExistsError,
    ProcessNotFoundError,
    UpdateProcessUseCase,
)
from backend.application.use_cases.product_use_cases import (
    CreateProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    ListProductsUseCase,
    ProductAlreadyExistsError,
    UpdateProductUseCase,
)
from backend.application.use_cases.product_use_cases import (
    ProductNotFoundError as ProductUseCaseNotFoundError,
)
from backend.application.use_cases.settlement_use_cases import (
    CalculateSettlementUseCase,
    GetDailyBreakdownUseCase,
    GetSettlementSummaryUseCase,
)

__all__ = [
    # Material
    "CreateMaterialUseCase",
    "GetMaterialUseCase",
    "ListMaterialsUseCase",
    "UpdateMaterialUseCase",
    "DeleteMaterialUseCase",
    "MaterialAlreadyExistsError",
    "MaterialNotFoundError",
    # Process
    "CreateProcessUseCase",
    "GetProcessUseCase",
    "ListProcessesUseCase",
    "UpdateProcessUseCase",
    "DeleteProcessUseCase",
    "ProcessAlreadyExistsError",
    "ProcessNotFoundError",
    # Product
    "CreateProductUseCase",
    "GetProductUseCase",
    "ListProductsUseCase",
    "UpdateProductUseCase",
    "DeleteProductUseCase",
    "ProductAlreadyExistsError",
    "ProductUseCaseNotFoundError",
    # BOM
    "CreateBOMUseCase",
    "GetBOMUseCase",
    "AddBOMItemUseCase",
    "RemoveBOMItemUseCase",
    "DeleteBOMUseCase",
    "BOMNotFoundError",
    # Price Change
    "RegisterPriceChangeUseCase",
    "GetPriceChangeUseCase",
    "ListPriceChangesUseCase",
    "CompareCostsUseCase",
    "ProductNotFoundError",
    # Settlement
    "CalculateSettlementUseCase",
    "GetSettlementSummaryUseCase",
    "GetDailyBreakdownUseCase",
    # Cost Calculation
    "CalculateCostUseCase",
    "GenerateCostBreakdownReportUseCase",
    "CompareCostVersionsUseCase",
]
