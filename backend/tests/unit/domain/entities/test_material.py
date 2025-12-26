"""Test 2.1: Material 엔티티 테스트.

TDD RED Phase: 자재 마스터 엔티티 테스트.
PRD 4.1.2 자재 마스터 및 5.2 재료비 계산 로직 기반.
"""

from datetime import date
from decimal import Decimal

import pytest


class TestMaterialEntity:
    """Material 엔티티 테스트."""

    def test_create_material_success(self):
        """자재 생성 성공 테스트."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )

        material = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.5000"),
            effective_date=date(2025, 1, 1),
            specification="0.5sq 흑색",
            scrap_rate=Decimal("0.05"),
        )

        assert material.material_id == "W-001"
        assert material.material_name == "AVS 0.5sq"
        assert material.material_type == MaterialType.WIRE
        assert material.unit == MaterialUnit.MTR
        assert material.unit_price == Decimal("15.5000")
        assert material.scrap_rate == Decimal("0.05")

    def test_create_material_without_optional_fields(self):
        """선택 필드 없이 자재 생성."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )

        material = Material(
            material_id="T-001",
            material_name="터미널 A",
            material_type=MaterialType.TERMINAL,
            unit=MaterialUnit.EA,
            unit_price=Decimal("5.0000"),
            effective_date=date(2025, 1, 1),
        )

        assert material.specification is None
        assert material.scrap_rate == Decimal("0")

    def test_create_material_missing_required_field_raises_error(self):
        """필수 필드 누락 시 ValueError."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )

        with pytest.raises(ValueError, match="자재 품번은 필수"):
            Material(
                material_id="",  # 빈 문자열
                material_name="터미널 A",
                material_type=MaterialType.TERMINAL,
                unit=MaterialUnit.EA,
                unit_price=Decimal("5.0000"),
                effective_date=date(2025, 1, 1),
            )

    def test_create_material_missing_name_raises_error(self):
        """품명 누락 시 ValueError."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )

        with pytest.raises(ValueError, match="품명은 필수"):
            Material(
                material_id="T-001",
                material_name="",  # 빈 문자열
                material_type=MaterialType.TERMINAL,
                unit=MaterialUnit.EA,
                unit_price=Decimal("5.0000"),
                effective_date=date(2025, 1, 1),
            )

    def test_create_material_negative_price_raises_error(self):
        """음수 단가 시 ValueError."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )

        with pytest.raises(ValueError, match="단가는 0 이상"):
            Material(
                material_id="T-001",
                material_name="터미널 A",
                material_type=MaterialType.TERMINAL,
                unit=MaterialUnit.EA,
                unit_price=Decimal("-5.0000"),
                effective_date=date(2025, 1, 1),
            )

    def test_create_material_invalid_scrap_rate_raises_error(self):
        """유효하지 않은 SCRAP 비율 시 ValueError."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )

        with pytest.raises(ValueError, match="SCRAP 비율은 0~1"):
            Material(
                material_id="T-001",
                material_name="터미널 A",
                material_type=MaterialType.TERMINAL,
                unit=MaterialUnit.EA,
                unit_price=Decimal("5.0000"),
                effective_date=date(2025, 1, 1),
                scrap_rate=Decimal("1.5"),  # 150%는 불가
            )


class TestMaterialCostCalculation:
    """Material 재료비 계산 테스트.

    PRD 5.2 재료비 계산 로직:
    - 전선류: 길이(MTR) × 단가(원/MTR)
    - 터미널/커넥터: 수량(EA) × 단가(원/EA)
    - SCRAP비 = 재료비 × SCRAP율
    - 순재료비 = 재료비 - SCRAP비
    """

    def test_calculate_material_cost_wire(self):
        """전선류 재료비 계산: 길이 × 단가."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )

        material = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.5000"),
            effective_date=date(2025, 1, 1),
        )

        # 10MTR × 15.5원/MTR = 155원
        cost = material.calculate_material_cost(Decimal("10"))
        assert cost == Decimal("155.0000")

    def test_calculate_material_cost_terminal(self):
        """터미널 재료비 계산: 수량 × 단가."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )

        material = Material(
            material_id="T-001",
            material_name="터미널 A",
            material_type=MaterialType.TERMINAL,
            unit=MaterialUnit.EA,
            unit_price=Decimal("5.2500"),
            effective_date=date(2025, 1, 1),
        )

        # 100EA × 5.25원/EA = 525원
        cost = material.calculate_material_cost(Decimal("100"))
        assert cost == Decimal("525.0000")

    def test_calculate_material_cost_with_decimal_quantity(self):
        """소수점 수량 재료비 계산."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )

        material = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.5000"),
            effective_date=date(2025, 1, 1),
        )

        # 2.5MTR × 15.5원/MTR = 38.75원
        cost = material.calculate_material_cost(Decimal("2.5"))
        assert cost == Decimal("38.7500")

    def test_calculate_scrap_value(self):
        """SCRAP비 계산: 재료비 × SCRAP율."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )

        material = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.5000"),
            effective_date=date(2025, 1, 1),
            scrap_rate=Decimal("0.05"),  # 5%
        )

        # 재료비 = 10MTR × 15.5원 = 155원
        # SCRAP비 = 155원 × 0.05 = 7.75원
        scrap = material.calculate_scrap_value(Decimal("10"))
        assert scrap == Decimal("7.75")

    def test_calculate_scrap_value_zero_rate(self):
        """SCRAP율 0%일 때 SCRAP비 = 0."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )

        material = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.5000"),
            effective_date=date(2025, 1, 1),
            scrap_rate=Decimal("0"),
        )

        scrap = material.calculate_scrap_value(Decimal("10"))
        assert scrap == Decimal("0.00")

    def test_calculate_net_material_cost(self):
        """순재료비 계산: 재료비 - SCRAP비."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )

        material = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.5000"),
            effective_date=date(2025, 1, 1),
            scrap_rate=Decimal("0.05"),  # 5%
        )

        # 재료비 = 10MTR × 15.5원 = 155원
        # SCRAP비 = 155원 × 0.05 = 7.75원
        # 순재료비 = 155원 - 7.75원 = 147.25원
        net_cost = material.calculate_net_material_cost(Decimal("10"))
        assert net_cost == Decimal("147.25")

    def test_calculate_cost_negative_quantity_raises_error(self):
        """음수 수량 시 ValueError."""
        from backend.domain.entities.material import (
            Material,
            MaterialType,
            MaterialUnit,
        )

        material = Material(
            material_id="W-001",
            material_name="AVS 0.5sq",
            material_type=MaterialType.WIRE,
            unit=MaterialUnit.MTR,
            unit_price=Decimal("15.5000"),
            effective_date=date(2025, 1, 1),
        )

        with pytest.raises(ValueError, match="소요량은 0 이상"):
            material.calculate_material_cost(Decimal("-10"))


class TestMaterialType:
    """MaterialType Enum 테스트."""

    def test_material_types(self):
        """자재 유형 Enum 값 확인."""
        from backend.domain.entities.material import MaterialType

        assert MaterialType.WIRE.value == "WIRE"
        assert MaterialType.TERMINAL.value == "TERMINAL"
        assert MaterialType.CONNECTOR.value == "CONNECTOR"
        assert MaterialType.TAPE.value == "TAPE"
        assert MaterialType.TUBE.value == "TUBE"
        assert MaterialType.ACCESSORY.value == "ACCESSORY"


class TestMaterialUnit:
    """MaterialUnit Enum 테스트."""

    def test_material_units(self):
        """자재 단위 Enum 값 확인."""
        from backend.domain.entities.material import MaterialUnit

        assert MaterialUnit.MTR.value == "MTR"
        assert MaterialUnit.EA.value == "EA"
        assert MaterialUnit.SET.value == "SET"
        assert MaterialUnit.M.value == "M"
