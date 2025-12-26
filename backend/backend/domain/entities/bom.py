"""BOM Entity - Bill of Materials.

PRD 4.2.1 BOM 데이터 기반.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum


class WorkType(str, Enum):
    """작업 유형 (내작/외작).

    BOM에서의 작업 유형 구분.
    """

    IN_HOUSE = "IN_HOUSE"
    OUTSOURCE = "OUTSOURCE"


@dataclass
class BOMItem:
    """BOM 항목 엔티티.

    PRD 4.2.1 BOM 데이터 테이블 기반:
    - bom_id: BOM ID (자동 생성)
    - product_id: 완제품 품번 (FK)
    - material_id: 자재 품번 (FK)
    - quantity: 소요량
    - work_type: 내작/외작
    - seq: 순번
    """

    product_id: str
    material_id: str
    quantity: Decimal
    work_type: WorkType
    bom_id: int | None = None
    sequence: int | None = None

    def __post_init__(self) -> None:
        """유효성 검사."""
        if not self.product_id:
            raise ValueError("완제품 품번은 필수입니다.")
        if not self.material_id:
            raise ValueError("자재 품번은 필수입니다.")
        if self.quantity <= 0:
            raise ValueError("소요량은 0보다 커야 합니다.")


@dataclass
class BOM:
    """BOM 엔티티 (완제품의 전체 BOM 목록).

    완제품 하나에 대한 모든 BOM 항목을 관리합니다.
    """

    product_id: str
    version: str = "1.0"
    items: list[BOMItem] = field(default_factory=list)

    def get_items_by_work_type(self, work_type: WorkType) -> list[BOMItem]:
        """작업 유형별 BOM 항목 조회.

        PRD 5.2.3 내작/외작 구분 합산을 위한 필터링.

        Args:
            work_type: 작업 유형 (내작/외작)

        Returns:
            해당 작업 유형의 BOM 항목 리스트
        """
        return [item for item in self.items if item.work_type == work_type]

    def add_item(self, item: BOMItem) -> None:
        """BOM 항목 추가.

        Args:
            item: 추가할 BOM 항목
        """
        self.items.append(item)

    def remove_item(self, material_id: str) -> bool:
        """BOM 항목 제거.

        Args:
            material_id: 제거할 자재 품번

        Returns:
            제거 성공 여부
        """
        for i, item in enumerate(self.items):
            if item.material_id == material_id:
                del self.items[i]
                return True
        return False
