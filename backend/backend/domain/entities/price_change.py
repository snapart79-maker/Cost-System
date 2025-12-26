"""PriceChange Entity - 단가 변경 이력.

PRD 4.2.2 단가 변경 이력 및 5.5 변경 영향 계산 기반.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Union


class ChangeType(str, Enum):
    """변경 유형.

    PRD 정의:
    - 재료비: 자재 관련 변경 (단가, 수량, 자재 추가/삭제)
    - 가공비: 공정 관련 변경 (C/T, 인원, 공정 추가/삭제)
    - 복합: 재료비와 가공비 동시 변경
    """

    MATERIAL = "MATERIAL"
    PROCESS = "PROCESS"
    COMBINED = "COMBINED"


@dataclass
class MaterialChangeDetail:
    """재료비 변경 상세 내역.

    자재 관련 변경 사항을 기록합니다.
    """

    material_id: str
    before_price: Decimal
    after_price: Decimal
    reason: str | None = None


@dataclass
class ProcessChangeDetail:
    """가공비 변경 상세 내역.

    공정 관련 변경 사항을 기록합니다.
    """

    process_id: str
    before_labor_rate: Decimal
    after_labor_rate: Decimal
    before_machine_cost: Decimal
    after_machine_cost: Decimal
    reason: str | None = None


# 변경 상세 내역 타입
ChangeDetail = Union[MaterialChangeDetail, ProcessChangeDetail]


@dataclass
class PriceChange:
    """단가 변경 이력 엔티티.

    PRD 4.2.2 단가 변경 이력 테이블 기반:
    - change_id: 변경 ID
    - product_id: 대상 완제품 (FK)
    - change_type: 변경 유형 (재료비/가공비/복합)
    - change_reason: 변경 사유 상세
    - eco_number: ECO/CR 번호
    - effective_date: 변경 적용일
    - before_cost: 변경 전 구매원가
    - after_cost: 변경 후 구매원가
    - created_at: 등록 일시
    - created_by: 등록자
    """

    change_id: str
    product_id: str
    change_type: ChangeType
    change_reason: str
    effective_date: date
    before_cost: Decimal
    after_cost: Decimal
    created_by: str | None = None
    eco_number: str | None = None
    created_at: datetime | None = None
    material_changes: list[MaterialChangeDetail] | None = None
    process_changes: list[ProcessChangeDetail] | None = None

    def __post_init__(self) -> None:
        """유효성 검사."""
        if not self.product_id:
            raise ValueError("완제품 품번은 필수입니다.")
        if not self.change_reason:
            raise ValueError("변경 사유는 필수입니다.")

        # created_at 기본값 설정
        if self.created_at is None:
            self.created_at = datetime.now()

    @property
    def cost_diff(self) -> Decimal:
        """단가 변경분 계산.

        PRD 5.5:
        단가 변경분 = 변경 후 구매원가 - 변경 전 구매원가

        Returns:
            단가 변경분 (양수: 인상, 음수: 인하)
        """
        return self.after_cost - self.before_cost

    def add_detail(self, detail: ChangeDetail) -> None:
        """변경 상세 내역 추가.

        Args:
            detail: 변경 상세 내역 (재료비 또는 가공비)
        """
        if isinstance(detail, MaterialChangeDetail):
            if self.material_changes is None:
                self.material_changes = []
            self.material_changes.append(detail)
        elif isinstance(detail, ProcessChangeDetail):
            if self.process_changes is None:
                self.process_changes = []
            self.process_changes.append(detail)

    def calculate_settlement_amount(
        self,
        daily_quantities: dict[date, Decimal],
    ) -> Decimal:
        """정산 금액 계산.

        PRD 5.5:
        정산 금액 = Σ (변경 적용일 이후 일별 입고 수량 × 단가 변경분)

        Args:
            daily_quantities: 일별 입고 수량 딕셔너리 {날짜: 수량}

        Returns:
            총 정산 금액
        """
        total = Decimal("0")
        cost_diff = self.cost_diff

        for qty_date, quantity in daily_quantities.items():
            if qty_date >= self.effective_date:
                total += quantity * cost_diff

        return total.quantize(Decimal("0.01"))
