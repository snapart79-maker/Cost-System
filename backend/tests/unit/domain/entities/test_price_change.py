"""Test 2.5: PriceChange 엔티티 테스트.

TDD RED Phase: 단가 변경 이력 엔티티 테스트.
PRD 4.2.2 단가 변경 이력 및 5.5 변경 영향 계산 기반.
"""

from datetime import date
from decimal import Decimal

import pytest


class TestPriceChangeEntity:
    """PriceChange 엔티티 테스트."""

    def test_create_price_change_success(self):
        """단가 변경 생성 성공 테스트."""
        from backend.domain.entities.price_change import ChangeType, PriceChange

        price_change = PriceChange(
            change_id="CHG-001",
            product_id="P-WH-001",
            change_type=ChangeType.MATERIAL,
            change_reason="자재 단가 인상",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1650.00"),
            eco_number="ECO-2025-001",
            created_by="홍길동",
        )

        assert price_change.change_id == "CHG-001"
        assert price_change.product_id == "P-WH-001"
        assert price_change.change_type == ChangeType.MATERIAL
        assert price_change.change_reason == "자재 단가 인상"
        assert price_change.before_cost == Decimal("1500.00")
        assert price_change.after_cost == Decimal("1650.00")

    def test_create_price_change_without_optional_fields(self):
        """선택 필드 없이 단가 변경 생성."""
        from backend.domain.entities.price_change import ChangeType, PriceChange

        price_change = PriceChange(
            change_id="CHG-002",
            product_id="P-WH-001",
            change_type=ChangeType.MATERIAL,
            change_reason="자재 단가 인상",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1650.00"),
        )

        assert price_change.eco_number is None
        assert price_change.created_by is None

    def test_create_price_change_missing_product_id_raises_error(self):
        """완제품 품번 누락 시 ValueError."""
        from backend.domain.entities.price_change import ChangeType, PriceChange

        with pytest.raises(ValueError, match="완제품 품번은 필수"):
            PriceChange(
                change_id="CHG-003",
                product_id="",
                change_type=ChangeType.MATERIAL,
                change_reason="자재 단가 인상",
                effective_date=date(2025, 2, 1),
                before_cost=Decimal("1500.00"),
                after_cost=Decimal("1650.00"),
            )

    def test_create_price_change_missing_reason_raises_error(self):
        """변경 사유 누락 시 ValueError."""
        from backend.domain.entities.price_change import ChangeType, PriceChange

        with pytest.raises(ValueError, match="변경 사유는 필수"):
            PriceChange(
                change_id="CHG-004",
                product_id="P-WH-001",
                change_type=ChangeType.MATERIAL,
                change_reason="",
                effective_date=date(2025, 2, 1),
                before_cost=Decimal("1500.00"),
                after_cost=Decimal("1650.00"),
            )


class TestPriceChangeCostDiff:
    """PriceChange 단가 변경분 계산 테스트.

    PRD 5.5:
    - 단가 변경분 = 변경 후 구매원가 - 변경 전 구매원가
    """

    def test_calculate_cost_diff_positive(self):
        """단가 인상 변경분 계산."""
        from backend.domain.entities.price_change import ChangeType, PriceChange

        price_change = PriceChange(
            change_id="CHG-005",
            product_id="P-WH-001",
            change_type=ChangeType.MATERIAL,
            change_reason="자재 단가 인상",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1650.00"),
        )

        # 1650 - 1500 = 150
        assert price_change.cost_diff == Decimal("150.00")

    def test_calculate_cost_diff_negative(self):
        """단가 인하 변경분 계산."""
        from backend.domain.entities.price_change import ChangeType, PriceChange

        price_change = PriceChange(
            change_id="CHG-006",
            product_id="P-WH-001",
            change_type=ChangeType.MATERIAL,
            change_reason="CR 활동으로 단가 인하",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1350.00"),
        )

        # 1350 - 1500 = -150
        assert price_change.cost_diff == Decimal("-150.00")

    def test_calculate_cost_diff_zero(self):
        """변경 없음 (변경분 0)."""
        from backend.domain.entities.price_change import ChangeType, PriceChange

        price_change = PriceChange(
            change_id="CHG-007",
            product_id="P-WH-001",
            change_type=ChangeType.PROCESS,
            change_reason="공정 변경 (원가 영향 없음)",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1500.00"),
        )

        assert price_change.cost_diff == Decimal("0.00")


class TestChangeType:
    """ChangeType Enum 테스트."""

    def test_change_types(self):
        """변경 유형 Enum 값 확인."""
        from backend.domain.entities.price_change import ChangeType

        assert ChangeType.MATERIAL.value == "MATERIAL"
        assert ChangeType.PROCESS.value == "PROCESS"
        assert ChangeType.COMBINED.value == "COMBINED"


class TestPriceChangeDetails:
    """PriceChange 상세 변경 내역 테스트."""

    def test_add_material_change_detail(self):
        """재료비 변경 상세 내역 추가."""
        from backend.domain.entities.price_change import (
            ChangeType,
            MaterialChangeDetail,
            PriceChange,
        )

        price_change = PriceChange(
            change_id="CHG-008",
            product_id="P-WH-001",
            change_type=ChangeType.MATERIAL,
            change_reason="자재 단가 인상",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1650.00"),
        )

        detail = MaterialChangeDetail(
            material_id="W-001",
            before_price=Decimal("15.00"),
            after_price=Decimal("16.50"),
            reason="단가 변경",
        )
        price_change.add_detail(detail)

        assert price_change.material_changes is not None
        assert len(price_change.material_changes) == 1
        assert price_change.material_changes[0].material_id == "W-001"

    def test_add_process_change_detail(self):
        """가공비 변경 상세 내역 추가."""
        from backend.domain.entities.price_change import (
            ChangeType,
            PriceChange,
            ProcessChangeDetail,
        )

        price_change = PriceChange(
            change_id="CHG-009",
            product_id="P-WH-001",
            change_type=ChangeType.PROCESS,
            change_reason="C/T 단축",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1450.00"),
        )

        detail = ProcessChangeDetail(
            process_id="P-001",
            before_labor_rate=Decimal("25000.00"),
            after_labor_rate=Decimal("24000.00"),
            before_machine_cost=Decimal("5000.00"),
            after_machine_cost=Decimal("4800.00"),
            reason="C/T 변경",
        )
        price_change.add_detail(detail)

        assert price_change.process_changes is not None
        assert len(price_change.process_changes) == 1
        assert price_change.process_changes[0].process_id == "P-001"
