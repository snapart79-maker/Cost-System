"""Test 2.4: BOM 엔티티 테스트.

TDD RED Phase: BOM(Bill of Materials) 엔티티 테스트.
PRD 4.2.1 BOM 데이터 기반.
"""

from decimal import Decimal

import pytest


class TestBOMItemEntity:
    """BOMItem 엔티티 테스트."""

    def test_create_bom_item_success(self):
        """BOM 항목 생성 성공 테스트."""
        from backend.domain.entities.bom import BOMItem, WorkType

        bom_item = BOMItem(
            bom_id=1,
            product_id="P-WH-001",
            material_id="W-001",
            quantity=Decimal("2.5"),
            work_type=WorkType.IN_HOUSE,
            sequence=1,
        )

        assert bom_item.bom_id == 1
        assert bom_item.product_id == "P-WH-001"
        assert bom_item.material_id == "W-001"
        assert bom_item.quantity == Decimal("2.5")
        assert bom_item.work_type == WorkType.IN_HOUSE
        assert bom_item.sequence == 1

    def test_create_bom_item_without_optional_fields(self):
        """선택 필드 없이 BOM 항목 생성."""
        from backend.domain.entities.bom import BOMItem, WorkType

        bom_item = BOMItem(
            product_id="P-WH-001",
            material_id="W-001",
            quantity=Decimal("2.5"),
            work_type=WorkType.IN_HOUSE,
        )

        assert bom_item.bom_id is None
        assert bom_item.sequence is None

    def test_create_bom_item_missing_product_id_raises_error(self):
        """완제품 품번 누락 시 ValueError."""
        from backend.domain.entities.bom import BOMItem, WorkType

        with pytest.raises(ValueError, match="완제품 품번은 필수"):
            BOMItem(
                product_id="",
                material_id="W-001",
                quantity=Decimal("2.5"),
                work_type=WorkType.IN_HOUSE,
            )

    def test_create_bom_item_missing_material_id_raises_error(self):
        """자재 품번 누락 시 ValueError."""
        from backend.domain.entities.bom import BOMItem, WorkType

        with pytest.raises(ValueError, match="자재 품번은 필수"):
            BOMItem(
                product_id="P-WH-001",
                material_id="",
                quantity=Decimal("2.5"),
                work_type=WorkType.IN_HOUSE,
            )

    def test_create_bom_item_zero_quantity_raises_error(self):
        """수량 0 시 ValueError."""
        from backend.domain.entities.bom import BOMItem, WorkType

        with pytest.raises(ValueError, match="소요량은 0보다 커야"):
            BOMItem(
                product_id="P-WH-001",
                material_id="W-001",
                quantity=Decimal("0"),
                work_type=WorkType.IN_HOUSE,
            )

    def test_create_bom_item_negative_quantity_raises_error(self):
        """음수 수량 시 ValueError."""
        from backend.domain.entities.bom import BOMItem, WorkType

        with pytest.raises(ValueError, match="소요량은 0보다 커야"):
            BOMItem(
                product_id="P-WH-001",
                material_id="W-001",
                quantity=Decimal("-2.5"),
                work_type=WorkType.IN_HOUSE,
            )


class TestBOMEntity:
    """BOM 엔티티 테스트 (완제품의 전체 BOM 목록)."""

    def test_create_bom_with_items(self):
        """BOM 목록 생성."""
        from backend.domain.entities.bom import BOM, BOMItem, WorkType

        items = [
            BOMItem(
                product_id="P-WH-001",
                material_id="W-001",
                quantity=Decimal("2.5"),
                work_type=WorkType.IN_HOUSE,
                sequence=1,
            ),
            BOMItem(
                product_id="P-WH-001",
                material_id="T-001",
                quantity=Decimal("4"),
                work_type=WorkType.IN_HOUSE,
                sequence=2,
            ),
        ]

        bom = BOM(product_id="P-WH-001", items=items)

        assert bom.product_id == "P-WH-001"
        assert len(bom.items) == 2

    def test_get_in_house_items(self):
        """내작 자재 목록 조회."""
        from backend.domain.entities.bom import BOM, BOMItem, WorkType

        items = [
            BOMItem(
                product_id="P-WH-001",
                material_id="W-001",
                quantity=Decimal("2.5"),
                work_type=WorkType.IN_HOUSE,
            ),
            BOMItem(
                product_id="P-WH-001",
                material_id="T-001",
                quantity=Decimal("4"),
                work_type=WorkType.OUTSOURCE,
            ),
            BOMItem(
                product_id="P-WH-001",
                material_id="C-001",
                quantity=Decimal("2"),
                work_type=WorkType.IN_HOUSE,
            ),
        ]

        bom = BOM(product_id="P-WH-001", items=items)
        in_house = bom.get_items_by_work_type(WorkType.IN_HOUSE)

        assert len(in_house) == 2

    def test_get_outsource_items(self):
        """외작 자재 목록 조회."""
        from backend.domain.entities.bom import BOM, BOMItem, WorkType

        items = [
            BOMItem(
                product_id="P-WH-001",
                material_id="W-001",
                quantity=Decimal("2.5"),
                work_type=WorkType.IN_HOUSE,
            ),
            BOMItem(
                product_id="P-WH-001",
                material_id="T-001",
                quantity=Decimal("4"),
                work_type=WorkType.OUTSOURCE,
            ),
        ]

        bom = BOM(product_id="P-WH-001", items=items)
        outsource = bom.get_items_by_work_type(WorkType.OUTSOURCE)

        assert len(outsource) == 1
        assert outsource[0].material_id == "T-001"
