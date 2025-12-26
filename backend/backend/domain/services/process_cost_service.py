"""가공비 계산 서비스.

PRD 5.3 가공비 계산 로직 기반.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

from backend.domain.entities.process import Process, WorkType


@dataclass
class ProcessCostInput:
    """공정 가공비 계산 입력."""

    process: Process
    cycle_time: Decimal  # 초
    workers: Decimal  # 인원


@dataclass
class ProcessCostResult:
    """단일 공정 가공비 결과."""

    labor_cost: Decimal  # 노무비
    machine_cost: Decimal  # 경비
    total_cost: Decimal  # 합계


@dataclass
class TotalProcessCostResult:
    """전체 공정 가공비 결과."""

    total_labor_cost: Decimal
    total_machine_cost: Decimal
    total_process_cost: Decimal
    in_house_cost: Decimal
    outsource_cost: Decimal


class ProcessCostService:
    """가공비 계산 서비스.

    PRD 5.3:
    - 생산량 = 3600 / C/T (시간당)
    - 노무비 = (임율 × 인원) / (생산량 × 효율)
    - 경비 = 설비비 / (생산량 × 효율)
    - 가공비 = 노무비 + 경비
    """

    SECONDS_PER_HOUR = Decimal("3600")
    DEFAULT_EFFICIENCY = Decimal("100")  # 100%

    def __init__(self, precision: int = 2) -> None:
        """서비스 초기화.

        Args:
            precision: 소수점 자릿수 (기본값: 2)
        """
        self.precision = precision
        self._quantize = Decimal(10) ** -precision

    def _round(self, value: Decimal) -> Decimal:
        """금액 반올림."""
        return value.quantize(self._quantize, rounding=ROUND_HALF_UP)

    def calculate_process_cost(self, input_data: ProcessCostInput) -> ProcessCostResult:
        """단일 공정 가공비 계산.

        Args:
            input_data: 공정 가공비 계산 입력

        Returns:
            ProcessCostResult: 가공비 계산 결과
        """
        process = input_data.process
        cycle_time = input_data.cycle_time
        workers = input_data.workers

        # 생산량 = 3600 / C/T
        production = self.SECONDS_PER_HOUR / cycle_time

        # 효율 적용 (기본값 100%)
        efficiency = process.efficiency or self.DEFAULT_EFFICIENCY
        efficiency_rate = efficiency / Decimal("100")
        effective_production = production * efficiency_rate

        # 노무비 = (임율 × 인원) / 생산량
        labor_cost = (process.labor_rate * workers) / effective_production
        labor_cost = self._round(labor_cost)

        # 경비 = 설비비 / 생산량
        machine_cost = process.machine_cost / effective_production
        machine_cost = self._round(machine_cost)

        # 가공비 = 노무비 + 경비
        total_cost = labor_cost + machine_cost

        return ProcessCostResult(
            labor_cost=labor_cost,
            machine_cost=machine_cost,
            total_cost=total_cost,
        )

    def calculate_total_cost(
        self, inputs: list[ProcessCostInput]
    ) -> TotalProcessCostResult:
        """전체 공정 가공비 합산.

        Args:
            inputs: 공정 가공비 계산 입력 목록

        Returns:
            TotalProcessCostResult: 전체 가공비 결과
        """
        if not inputs:
            zero = Decimal("0.00")
            return TotalProcessCostResult(
                total_labor_cost=zero,
                total_machine_cost=zero,
                total_process_cost=zero,
                in_house_cost=zero,
                outsource_cost=zero,
            )

        total_labor = Decimal("0")
        total_machine = Decimal("0")
        in_house = Decimal("0")
        outsource = Decimal("0")

        for inp in inputs:
            result = self.calculate_process_cost(inp)

            total_labor += result.labor_cost
            total_machine += result.machine_cost

            # 내작/외작 분류
            if inp.process.work_type == WorkType.IN_HOUSE:
                in_house += result.total_cost
            else:
                outsource += result.total_cost

        total_labor = self._round(total_labor)
        total_machine = self._round(total_machine)
        total_process = total_labor + total_machine

        return TotalProcessCostResult(
            total_labor_cost=total_labor,
            total_machine_cost=total_machine,
            total_process_cost=total_process,
            in_house_cost=self._round(in_house),
            outsource_cost=self._round(outsource),
        )
