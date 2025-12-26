"""Domain Repository Interfaces.

Repository 패턴의 인터페이스(ABC) 정의.
실제 구현은 infrastructure 계층에서 담당.
"""

from backend.domain.repositories.base import BaseRepository
from backend.domain.repositories.bom_repository import BOMRepository
from backend.domain.repositories.material_repository import MaterialRepository
from backend.domain.repositories.price_change_repository import PriceChangeRepository
from backend.domain.repositories.process_repository import ProcessRepository
from backend.domain.repositories.product_repository import ProductRepository

__all__ = [
    "BaseRepository",
    "MaterialRepository",
    "ProcessRepository",
    "ProductRepository",
    "BOMRepository",
    "PriceChangeRepository",
]
