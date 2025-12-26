"""Domain Entities.

비즈니스 엔티티 클래스들을 정의.
- Material: 자재 마스터
- Process: 공정 마스터
- Product: 완제품 마스터
- BOM: Bill of Materials
- PriceChange: 단가 변경 이력
"""

from backend.domain.entities.bom import BOM, BOMItem
from backend.domain.entities.material import Material, MaterialType, MaterialUnit
from backend.domain.entities.price_change import (
    ChangeType,
    MaterialChangeDetail,
    PriceChange,
    ProcessChangeDetail,
)
from backend.domain.entities.process import Process, WorkType
from backend.domain.entities.product import Product, ProductStatus

__all__ = [
    "Material",
    "MaterialType",
    "MaterialUnit",
    "Process",
    "WorkType",
    "Product",
    "ProductStatus",
    "BOM",
    "BOMItem",
    "PriceChange",
    "ChangeType",
    "MaterialChangeDetail",
    "ProcessChangeDetail",
]
