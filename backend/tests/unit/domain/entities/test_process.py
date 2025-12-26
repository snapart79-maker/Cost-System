"""Test 2.2: Process 엔티티 테스트.

TDD RED Phase: 공정 마스터 엔티티 테스트.
PRD 4.1.1 공정 마스터 및 5.3 가공비 계산 로직 기반.
"""

from decimal import Decimal

import pytest


class TestProcessEntity:
    """Process 엔티티 테스트."""

    def test_create_process_success(self):
        """공정 생성 성공 테스트."""
        from backend.domain.entities.process import Process, WorkType

        process = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
            efficiency=Decimal("100.00"),
            equipment_name="자동압착기 1호",
        )

        assert process.process_id == "P-001"
        assert process.process_name == "절압착"
        assert process.work_type == WorkType.IN_HOUSE
        assert process.labor_rate == Decimal("25000.00")
        assert process.machine_cost == Decimal("5000.00")
        assert process.efficiency == Decimal("100.00")

    def test_create_process_without_optional_fields(self):
        """선택 필드 없이 공정 생성."""
        from backend.domain.entities.process import Process, WorkType

        process = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
        )

        assert process.equipment_name is None
        assert process.efficiency == Decimal("100.00")  # 기본값

    def test_create_process_missing_id_raises_error(self):
        """공정 코드 누락 시 ValueError."""
        from backend.domain.entities.process import Process, WorkType

        with pytest.raises(ValueError, match="공정 코드는 필수"):
            Process(
                process_id="",
                process_name="절압착",
                work_type=WorkType.IN_HOUSE,
                labor_rate=Decimal("25000.00"),
                machine_cost=Decimal("5000.00"),
            )

    def test_create_process_missing_name_raises_error(self):
        """공정명 누락 시 ValueError."""
        from backend.domain.entities.process import Process, WorkType

        with pytest.raises(ValueError, match="공정명은 필수"):
            Process(
                process_id="P-001",
                process_name="",
                work_type=WorkType.IN_HOUSE,
                labor_rate=Decimal("25000.00"),
                machine_cost=Decimal("5000.00"),
            )

    def test_create_process_negative_labor_rate_raises_error(self):
        """음수 임율 시 ValueError."""
        from backend.domain.entities.process import Process, WorkType

        with pytest.raises(ValueError, match="임율은 0 이상"):
            Process(
                process_id="P-001",
                process_name="절압착",
                work_type=WorkType.IN_HOUSE,
                labor_rate=Decimal("-25000.00"),
                machine_cost=Decimal("5000.00"),
            )

    def test_create_process_invalid_efficiency_raises_error(self):
        """유효하지 않은 효율 시 ValueError."""
        from backend.domain.entities.process import Process, WorkType

        with pytest.raises(ValueError, match="효율은 0보다 커야"):
            Process(
                process_id="P-001",
                process_name="절압착",
                work_type=WorkType.IN_HOUSE,
                labor_rate=Decimal("25000.00"),
                machine_cost=Decimal("5000.00"),
                efficiency=Decimal("0"),  # 0%는 불가
            )


class TestProcessCostCalculation:
    """Process 가공비 계산 테스트.

    PRD 5.3 가공비 계산 로직:
    - 노무비 = (임율 × 인원) / (생산량 × 효율)
    - 경비 = (기계경비 × C/T) / (생산량 × 효율)
    - 생산량 = 3600 / C/T
    - 공정 가공비 = 노무비 + 경비
    """

    def test_calculate_labor_cost(self):
        """노무비 계산: (임율 × 인원) / (생산량 × 효율).

        예시:
        - 임율: 25,000원/시간
        - 인원: 1명
        - C/T: 10초
        - 생산량: 3600/10 = 360개/시간
        - 효율: 100%
        - 노무비 = (25000 × 1) / (360 × 1.0) = 69.44원/개
        """
        from backend.domain.entities.process import Process, WorkType

        process = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
            efficiency=Decimal("100.00"),
        )

        labor_cost = process.calculate_labor_cost(
            cycle_time=Decimal("10"),  # 10초
            workers=Decimal("1"),
        )

        # 생산량 = 3600/10 = 360
        # 노무비 = 25000 / 360 = 69.4444...
        assert labor_cost == Decimal("69.44")

    def test_calculate_labor_cost_with_multiple_workers(self):
        """다수 인원 노무비 계산."""
        from backend.domain.entities.process import Process, WorkType

        process = Process(
            process_id="P-001",
            process_name="조립",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
            efficiency=Decimal("100.00"),
        )

        labor_cost = process.calculate_labor_cost(
            cycle_time=Decimal("20"),  # 20초
            workers=Decimal("2"),  # 2명
        )

        # 생산량 = 3600/20 = 180
        # 노무비 = (25000 × 2) / 180 = 277.77...
        assert labor_cost == Decimal("277.78")

    def test_calculate_labor_cost_with_efficiency(self):
        """효율 반영 노무비 계산."""
        from backend.domain.entities.process import Process, WorkType

        process = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
            efficiency=Decimal("90.00"),  # 90% 효율
        )

        labor_cost = process.calculate_labor_cost(
            cycle_time=Decimal("10"),
            workers=Decimal("1"),
        )

        # 생산량 = 3600/10 = 360
        # 노무비 = 25000 / (360 × 0.9) = 25000 / 324 = 77.16...
        assert labor_cost == Decimal("77.16")

    def test_calculate_machine_cost(self):
        """경비(기계경비) 계산: 기계경비 / 생산량."""
        from backend.domain.entities.process import Process, WorkType

        process = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
            efficiency=Decimal("100.00"),
        )

        machine_cost = process.calculate_machine_cost(
            cycle_time=Decimal("10"),
        )

        # 생산량 = 3600/10 = 360
        # 경비 = 5000 / 360 = 13.88...
        assert machine_cost == Decimal("13.89")

    def test_calculate_process_cost(self):
        """공정 가공비 계산: 노무비 + 경비."""
        from backend.domain.entities.process import Process, WorkType

        process = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
            efficiency=Decimal("100.00"),
        )

        process_cost = process.calculate_process_cost(
            cycle_time=Decimal("10"),
            workers=Decimal("1"),
        )

        # 노무비 = 69.44원
        # 경비 = 13.89원
        # 가공비 = 83.33원
        assert process_cost == Decimal("83.33")

    def test_calculate_cost_zero_cycle_time_raises_error(self):
        """C/T 0초 시 ValueError."""
        from backend.domain.entities.process import Process, WorkType

        process = Process(
            process_id="P-001",
            process_name="절압착",
            work_type=WorkType.IN_HOUSE,
            labor_rate=Decimal("25000.00"),
            machine_cost=Decimal("5000.00"),
        )

        with pytest.raises(ValueError, match="C/T는 0보다 커야"):
            process.calculate_labor_cost(
                cycle_time=Decimal("0"),
                workers=Decimal("1"),
            )


class TestWorkType:
    """WorkType Enum 테스트."""

    def test_work_types(self):
        """작업 유형 Enum 값 확인."""
        from backend.domain.entities.process import WorkType

        assert WorkType.IN_HOUSE.value == "IN_HOUSE"
        assert WorkType.OUTSOURCE.value == "OUTSOURCE"
