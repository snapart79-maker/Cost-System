"""Product Entity - 완제품 마스터.

PRD 4.1.3 완제품 마스터 기반.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class ProductStatus(str, Enum):
    """제품 상태.

    PRD 정의:
    - 양산: 정상 생산 중인 제품
    - 개발: 개발 중인 제품
    - 단종: 생산 중단된 제품
    """

    PRODUCTION = "PRODUCTION"
    DEVELOPMENT = "DEVELOPMENT"
    DISCONTINUED = "DISCONTINUED"


@dataclass
class Product:
    """완제품 마스터 엔티티.

    PRD 4.1.3 완제품 마스터 테이블 기반:
    - product_id: 완제품 품번 (PK)
    - product_name: 품명
    - customer_pn: 고객사 품번
    - customer_name: 고객사명
    - vehicle_model: 차종
    - status: 상태 (양산/개발/단종)
    """

    product_id: str
    product_name: str
    status: ProductStatus
    customer: str | None = None
    car_model: str | None = None
    description: str | None = None

    def __post_init__(self) -> None:
        """유효성 검사."""
        if not self.product_id:
            raise ValueError("완제품 품번은 필수입니다.")
        if not self.product_name:
            raise ValueError("품명은 필수입니다.")

    def change_status(self, new_status: ProductStatus) -> None:
        """제품 상태 변경.

        Args:
            new_status: 새로운 상태
        """
        self.status = new_status
