"""Material Entity - 자재 마스터.

PRD 4.1.2 자재 마스터 및 5.2 재료비 계산 로직 기반.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from decimal import ROUND_HALF_UP, Decimal
from enum import Enum


class MaterialType(str, Enum):
    """자재 유형.

    PRD 정의:
    - 전선: 자동차 배선용 전선
    - 터미널: 전선 끝단 연결 부품
    - 커넥터: 터미널 삽입 하우징
    - 테이프: 배선 묶음/보호용
    - 튜브: 배선 보호용 튜브
    - 부자재: 기타 부속품
    """

    WIRE = "WIRE"
    TERMINAL = "TERMINAL"
    CONNECTOR = "CONNECTOR"
    TAPE = "TAPE"
    TUBE = "TUBE"
    ACCESSORY = "ACCESSORY"


class MaterialUnit(str, Enum):
    """자재 단위.

    PRD 정의:
    - MTR: 미터 (전선류)
    - EA: 개수 (터미널, 커넥터)
    - SET: 세트
    - M: 미터 (테이프, 튜브)
    """

    MTR = "MTR"
    EA = "EA"
    SET = "SET"
    M = "M"


@dataclass
class Material:
    """자재 마스터 엔티티.

    PRD 4.1.2 자재 마스터 테이블 기반:
    - material_id: 자재 품번 (PK)
    - material_name: 품명
    - material_type: 자재 유형
    - unit: 단위
    - unit_price: 단가 (소수점 4자리)
    - effective_date: 단가 적용일
    - spec: 규격
    - scrap_rate: SCRAP 비율 (0~1)
    """

    material_id: str
    material_name: str
    material_type: MaterialType
    unit: MaterialUnit
    unit_price: Decimal
    effective_date: date
    scrap_rate: Decimal = field(default_factory=lambda: Decimal("0"))
    supplier: str | None = None
    specification: str | None = None

    def __post_init__(self) -> None:
        """유효성 검사."""
        if not self.material_id:
            raise ValueError("자재 품번은 필수입니다.")
        if not self.material_name:
            raise ValueError("품명은 필수입니다.")
        if self.unit_price < 0:
            raise ValueError("단가는 0 이상이어야 합니다.")
        if self.scrap_rate < 0 or self.scrap_rate > 1:
            raise ValueError("SCRAP 비율은 0~1 사이여야 합니다.")

    def calculate_material_cost(self, quantity: Decimal) -> Decimal:
        """자재비(재료비) 계산.

        PRD 5.2.1 자재별 재료비 계산:
        - 전선류: 길이(MTR) × 단가(원/MTR)
        - 터미널/커넥터: 수량(EA) × 단가(원/EA)
        - 테이프/튜브: 길이(M) × 단가(원/M)
        - 부자재: 수량(EA/SET) × 단가

        Args:
            quantity: 소요량

        Returns:
            재료비 (원), 소수점 4자리

        Raises:
            ValueError: 소요량이 음수인 경우
        """
        if quantity < 0:
            raise ValueError("소요량은 0 이상이어야 합니다.")

        result = self.unit_price * quantity
        return result.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)

    def calculate_scrap_value(self, quantity: Decimal) -> Decimal:
        """SCRAP비 계산.

        PRD 5.2.2:
        SCRAP비 = 재료비 × SCRAP율

        SCRAP비는 재료 손실분에 대한 회수 금액입니다.

        Args:
            quantity: 소요량

        Returns:
            SCRAP비 (원), 소수점 2자리
        """
        material_cost = self.calculate_material_cost(quantity)
        scrap_value = material_cost * self.scrap_rate
        return scrap_value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    def calculate_net_material_cost(self, quantity: Decimal) -> Decimal:
        """순재료비 계산.

        PRD 5.2.2:
        순재료비 = 재료비 - SCRAP비

        Args:
            quantity: 소요량

        Returns:
            순재료비 (원), 소수점 2자리
        """
        material_cost = self.calculate_material_cost(quantity)
        scrap_value = self.calculate_scrap_value(quantity)
        net_cost = material_cost - scrap_value
        return net_cost.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
