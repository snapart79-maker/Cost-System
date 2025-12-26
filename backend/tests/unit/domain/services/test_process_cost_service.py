"""Test 3.2: ProcessCostService 테스트.

TDD RED Phase: 가공비 계산 서비스 테스트.
PRD 5.3 가공비 계산 로직 기반.
"""

from decimal import Decimal


class TestProcessCostService:
    """ProcessCostService 테스트."""

    def test_calculate_single_process_cost(self):
        """단일 공정 가공비 계산."""
        from backend.domain.entities.process import Process, WorkType
        from backend.domain.services.process_cost_service import (
            ProcessCostInput,
            ProcessCostService,
        )

        # Given: 공정 정보
        process = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
            efficiency=Decimal("100.00"),
        )

        input_data = ProcessCostInput(
            process=process,
            cycle_time=Decimal("10"),  # 10초
            workers=Decimal("1"),
        )

        service = ProcessCostService()

        # When: 가공비 계산
        result = service.calculate_process_cost(input_data)

        # Then:
        # 생산량 = 3600/10 = 360
        # 노무비 = 25000/360 = 69.44
        # 경비 = 5000/360 = 13.89
        # 가공비 = 83.33
        assert result.labor_cost == Decimal("69.44")
        assert result.machine_cost == Decimal("13.89")
        assert result.total_cost == Decimal("83.33")

    def test_calculate_multiple_processes_cost(self):
        """복수 공정 가공비 합산."""
        from backend.domain.entities.process import Process, WorkType
        from backend.domain.services.process_cost_service import (
            ProcessCostInput,
            ProcessCostService,
        )

        processes = [
            ProcessCostInput(
                process=Process(
                    process_id="P-001",
                    process_name="절압착",
                    work_type=WorkType.IN_HOUSE,
                    labor_rate=Decimal("25000.00"),
                    machine_cost=Decimal("5000.00"),
                ),
                cycle_time=Decimal("10"),
                workers=Decimal("1"),
            ),
            ProcessCostInput(
                process=Process(
                    process_id="P-002",
                    process_name="테이핑",
                    work_type=WorkType.IN_HOUSE,
                    labor_rate=Decimal("20000.00"),
                    machine_cost=Decimal("3000.00"),
                ),
                cycle_time=Decimal("5"),
                workers=Decimal("1"),
            ),
        ]

        service = ProcessCostService()

        # When
        result = service.calculate_total_cost(processes)

        # Then:
        # P-001: 노무비=69.44, 경비=13.89, 합계=83.33
        # P-002: 노무비=27.78, 경비=4.17, 합계=31.95
        # (생산량=720, 노무비=20000/720, 경비=3000/720)
        assert result.total_labor_cost == Decimal("97.22")
        assert result.total_machine_cost == Decimal("18.06")
        assert result.total_process_cost == Decimal("115.28")

    def test_calculate_in_house_vs_outsource(self):
        """내작/외작 공정 분리 계산."""
        from backend.domain.entities.process import Process, WorkType
        from backend.domain.services.process_cost_service import (
            ProcessCostInput,
            ProcessCostService,
        )

        processes = [
            ProcessCostInput(
                process=Process(
                    process_id="P-001",
                    process_name="절압착",
                    work_type=WorkType.IN_HOUSE,
                    labor_rate=Decimal("25000.00"),
                    machine_cost=Decimal("5000.00"),
                ),
                cycle_time=Decimal("10"),
                workers=Decimal("1"),
            ),
            ProcessCostInput(
                process=Process(
                    process_id="P-002",
                    process_name="외주가공",
                    work_type=WorkType.OUTSOURCE,
                    labor_rate=Decimal("20000.00"),
                    machine_cost=Decimal("3000.00"),
                ),
                cycle_time=Decimal("5"),
                workers=Decimal("1"),
            ),
        ]

        service = ProcessCostService()
        result = service.calculate_total_cost(processes)

        # Then
        assert result.in_house_cost == Decimal("83.33")
        assert result.outsource_cost == Decimal("31.95")

    def test_calculate_with_efficiency(self):
        """효율 반영 가공비 계산."""
        from backend.domain.entities.process import Process, WorkType
        from backend.domain.services.process_cost_service import (
            ProcessCostInput,
            ProcessCostService,
        )

        process = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
            efficiency=Decimal("90.00"),  # 90% 효율
        )

        input_data = ProcessCostInput(
            process=process,
            cycle_time=Decimal("10"),
            workers=Decimal("1"),
        )

        service = ProcessCostService()
        result = service.calculate_process_cost(input_data)

        # 생산량 = 3600/10 = 360
        # 효율 적용 생산량 = 360 × 0.9 = 324
        # 노무비 = 25000/324 = 77.16
        # 경비 = 5000/324 = 15.43
        assert result.labor_cost == Decimal("77.16")
        assert result.machine_cost == Decimal("15.43")

    def test_calculate_with_multiple_workers(self):
        """다수 인원 가공비 계산."""
        from backend.domain.entities.process import Process, WorkType
        from backend.domain.services.process_cost_service import (
            ProcessCostInput,
            ProcessCostService,
        )

        process = Process(
            process_id="P-001",
            process_name="조립",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
        )

        input_data = ProcessCostInput(
            process=process,
            cycle_time=Decimal("20"),
            workers=Decimal("2"),  # 2명
        )

        service = ProcessCostService()
        result = service.calculate_process_cost(input_data)

        # 생산량 = 3600/20 = 180
        # 노무비 = (25000 × 2) / 180 = 277.78
        # 경비 = 5000/180 = 27.78
        assert result.labor_cost == Decimal("277.78")
        assert result.machine_cost == Decimal("27.78")

    def test_empty_processes_returns_zero(self):
        """빈 공정 목록일 때 0 반환."""
        from backend.domain.services.process_cost_service import ProcessCostService

        service = ProcessCostService()
        result = service.calculate_total_cost([])

        assert result.total_labor_cost == Decimal("0.00")
        assert result.total_machine_cost == Decimal("0.00")
        assert result.total_process_cost == Decimal("0.00")
