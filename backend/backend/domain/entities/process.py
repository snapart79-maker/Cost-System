"""Process Entity - 공정 마스터.

PRD 4.1.1 공정 마스터 및 5.3 가공비 계산 로직 기반.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal
from enum import Enum


class WorkType(str, Enum):
    """작업 유형 (내작/외작).

    PRD 정의:
    - 내작: 자사 내부에서 수행하는 작업
    - 외작: 외부 협력사에서 수행하는 작업
    """

    IN_HOUSE = "IN_HOUSE"
    OUTSOURCE = "OUTSOURCE"


@dataclass
class Process:
    """공정 마스터 엔티티.

    PRD 4.1.1 공정 마스터 테이블 기반:
    - process_id: 공정 코드 (PK)
    - process_name: 공정명 (절압착, 중간탈피 등)
    - equipment_name: 설비명
    - efficiency: 효율 (%, 기본 100)
    - labor_rate: 임율 (원/시간)
    - machine_cost: 기계경비 (원/시간)
    - work_type: 내작/외작 구분
    """

    process_id: str
    process_name: str
    work_type: WorkType
    labor_rate: Decimal
    machine_cost: Decimal
    efficiency: Decimal = field(default_factory=lambda: Decimal("100.00"))
    equipment_name: str | None = None
    description: str | None = None

    def __post_init__(self) -> None:
        """유효성 검사."""
        if not self.process_id:
            raise ValueError("공정 코드는 필수입니다.")
        if not self.process_name:
            raise ValueError("공정명은 필수입니다.")
        if self.labor_rate < 0:
            raise ValueError("임율은 0 이상이어야 합니다.")
        if self.machine_cost < 0:
            raise ValueError("기계경비는 0 이상이어야 합니다.")
        if self.efficiency <= 0:
            raise ValueError("효율은 0보다 커야 합니다.")

    def _calculate_production_rate(self, cycle_time: Decimal) -> Decimal:
        """시간당 생산량 계산.

        PRD 5.3:
        생산량 = 3600 / C/T (개/시간)

        Args:
            cycle_time: C/T (Cycle Time, 초)

        Returns:
            시간당 생산량

        Raises:
            ValueError: C/T가 0 이하인 경우
        """
        if cycle_time <= 0:
            raise ValueError("C/T는 0보다 커야 합니다.")

        return Decimal("3600") / cycle_time

    def calculate_labor_cost(
        self,
        cycle_time: Decimal,
        workers: Decimal = Decimal("1"),
    ) -> Decimal:
        """노무비 계산.

        PRD 5.3.1 공정별 노무비 계산:
        노무비 = (임율 × 인원) / (생산량 × 효율)

        Args:
            cycle_time: C/T (Cycle Time, 초)
            workers: 투입 인원 (명), 기본 1명

        Returns:
            노무비 (원/개), 소수점 2자리
        """
        production_rate = self._calculate_production_rate(cycle_time)
        efficiency_rate = self.efficiency / Decimal("100")

        labor_cost = (self.labor_rate * workers) / (production_rate * efficiency_rate)
        return labor_cost.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    def calculate_machine_cost(self, cycle_time: Decimal) -> Decimal:
        """경비(기계경비) 계산.

        PRD 5.3.2 공정별 경비 계산:
        경비 = 기계경비 / (생산량 × 효율)

        Args:
            cycle_time: C/T (Cycle Time, 초)

        Returns:
            경비 (원/개), 소수점 2자리
        """
        production_rate = self._calculate_production_rate(cycle_time)
        efficiency_rate = self.efficiency / Decimal("100")

        expense = self.machine_cost / (production_rate * efficiency_rate)
        return expense.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    def calculate_process_cost(
        self,
        cycle_time: Decimal,
        workers: Decimal = Decimal("1"),
    ) -> Decimal:
        """공정 가공비 계산.

        PRD 5.3.3:
        공정 가공비 = 노무비 + 경비

        Args:
            cycle_time: C/T (Cycle Time, 초)
            workers: 투입 인원 (명), 기본 1명

        Returns:
            가공비 (원/개), 소수점 2자리
        """
        labor_cost = self.calculate_labor_cost(cycle_time, workers)
        machine_cost = self.calculate_machine_cost(cycle_time)
        total = labor_cost + machine_cost
        return total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
