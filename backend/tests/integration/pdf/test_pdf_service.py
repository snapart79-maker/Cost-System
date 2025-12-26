"""Test 8.1: PDF 생성 서비스 테스트.

TDD RED Phase: PDF 보고서 생성 테스트.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from io import BytesIO
from typing import TYPE_CHECKING

import pytest

if TYPE_CHECKING:
    from backend.infrastructure.pdf.pdf_service import PDFService


@pytest.fixture
def pdf_service() -> "PDFService":
    """PDF 서비스 픽스처."""
    from backend.infrastructure.pdf.pdf_service import PDFService

    return PDFService()


@pytest.fixture
def sample_cost_breakdown_data() -> dict:
    """샘플 원가 계산서 데이터."""
    return {
        "product_id": "P-WH-001",
        "product_name": "메인 와이어 하네스",
        "customer": "현대자동차",
        "car_model": "아반떼 CN7",
        "calculation_date": date(2025, 1, 15),
        "version": "1.0",
        "material_cost": Decimal("1500.00"),
        "labor_cost": Decimal("800.00"),
        "overhead_cost": Decimal("200.00"),
        "manufacturing_cost": Decimal("2500.00"),
        "material_management_fee": Decimal("75.00"),
        "general_admin_fee": Decimal("125.00"),
        "defect_cost": Decimal("25.00"),
        "profit": Decimal("275.00"),
        "purchase_cost": Decimal("3000.00"),
        "materials": [
            {
                "material_id": "W-001",
                "material_name": "AVS 0.5sq",
                "specification": "0.5sq 흑색",
                "unit": "MTR",
                "quantity": Decimal("10.5"),
                "unit_price": Decimal("15.5000"),
                "amount": Decimal("162.75"),
            },
            {
                "material_id": "W-002",
                "material_name": "AVS 0.75sq",
                "specification": "0.75sq 적색",
                "unit": "MTR",
                "quantity": Decimal("5.0"),
                "unit_price": Decimal("18.0000"),
                "amount": Decimal("90.00"),
            },
            {
                "material_id": "T-001",
                "material_name": "025 터미널",
                "specification": "025 암단자",
                "unit": "EA",
                "quantity": Decimal("4"),
                "unit_price": Decimal("5.2500"),
                "amount": Decimal("21.00"),
            },
        ],
        "processes": [
            {
                "process_id": "PR-001",
                "process_name": "절압착",
                "work_type": "IN_HOUSE",
                "labor_cost": Decimal("500.00"),
                "machine_cost": Decimal("100.00"),
                "total_cost": Decimal("600.00"),
            },
            {
                "process_id": "PR-002",
                "process_name": "테이핑",
                "work_type": "IN_HOUSE",
                "labor_cost": Decimal("200.00"),
                "machine_cost": Decimal("50.00"),
                "total_cost": Decimal("250.00"),
            },
        ],
    }


@pytest.fixture
def sample_settlement_data() -> dict:
    """샘플 정산 보고서 데이터."""
    return {
        "product_id": "P-WH-001",
        "product_name": "메인 와이어 하네스",
        "customer": "현대자동차",
        "period_start": date(2025, 1, 1),
        "period_end": date(2025, 1, 31),
        "change_reason": "원자재 가격 인상",
        "eco_number": "ECO-2025-001",
        "effective_date": date(2025, 1, 15),
        "before_cost": Decimal("2800.00"),
        "after_cost": Decimal("3000.00"),
        "cost_difference": Decimal("200.00"),
        "change_rate": Decimal("7.14"),
        "total_quantity": Decimal("1000"),
        "settlement_amount": Decimal("200000.00"),
        "daily_breakdown": [
            {
                "date": date(2025, 1, 15),
                "quantity": Decimal("200"),
                "unit_diff": Decimal("200.00"),
                "settlement": Decimal("40000.00"),
            },
            {
                "date": date(2025, 1, 16),
                "quantity": Decimal("150"),
                "unit_diff": Decimal("200.00"),
                "settlement": Decimal("30000.00"),
            },
            {
                "date": date(2025, 1, 17),
                "quantity": Decimal("180"),
                "unit_diff": Decimal("200.00"),
                "settlement": Decimal("36000.00"),
            },
            {
                "date": date(2025, 1, 20),
                "quantity": Decimal("220"),
                "unit_diff": Decimal("200.00"),
                "settlement": Decimal("44000.00"),
            },
            {
                "date": date(2025, 1, 21),
                "quantity": Decimal("250"),
                "unit_diff": Decimal("200.00"),
                "settlement": Decimal("50000.00"),
            },
        ],
        "material_changes": [
            {
                "material_id": "W-001",
                "material_name": "AVS 0.5sq",
                "before_price": Decimal("15.0000"),
                "after_price": Decimal("15.5000"),
                "difference": Decimal("0.5000"),
            },
        ],
    }


class TestPDFServiceCostBreakdown:
    """원가 계산서 PDF 생성 테스트."""

    def test_generate_cost_breakdown_pdf(
        self,
        pdf_service: "PDFService",
        sample_cost_breakdown_data: dict,
    ) -> None:
        """원가 계산서 PDF 생성 성공."""
        result = pdf_service.generate_cost_breakdown(sample_cost_breakdown_data)

        assert result is not None
        assert isinstance(result, BytesIO)

        # PDF 파일 시그니처 확인 (%PDF-)
        result.seek(0)
        header = result.read(5)
        assert header == b"%PDF-"

    def test_generate_cost_breakdown_pdf_with_materials(
        self,
        pdf_service: "PDFService",
        sample_cost_breakdown_data: dict,
    ) -> None:
        """재료비 상세가 포함된 원가 계산서 PDF."""
        result = pdf_service.generate_cost_breakdown(sample_cost_breakdown_data)

        assert result is not None
        # PDF 크기가 일정 이상 (내용이 있음)
        result.seek(0, 2)  # 끝으로 이동
        size = result.tell()
        assert size > 1000  # 최소 1KB 이상

    def test_generate_cost_breakdown_pdf_without_optional_data(
        self,
        pdf_service: "PDFService",
    ) -> None:
        """선택 데이터 없이 원가 계산서 PDF 생성."""
        minimal_data = {
            "product_id": "P-001",
            "product_name": "테스트 제품",
            "calculation_date": date(2025, 1, 1),
            "purchase_cost": Decimal("1000.00"),
        }

        result = pdf_service.generate_cost_breakdown(minimal_data)

        assert result is not None
        result.seek(0)
        header = result.read(5)
        assert header == b"%PDF-"


class TestPDFServiceSettlement:
    """정산 보고서 PDF 생성 테스트."""

    def test_generate_settlement_pdf(
        self,
        pdf_service: "PDFService",
        sample_settlement_data: dict,
    ) -> None:
        """정산 보고서 PDF 생성 성공."""
        result = pdf_service.generate_settlement_report(sample_settlement_data)

        assert result is not None
        assert isinstance(result, BytesIO)

        # PDF 파일 시그니처 확인
        result.seek(0)
        header = result.read(5)
        assert header == b"%PDF-"

    def test_generate_settlement_pdf_with_daily_breakdown(
        self,
        pdf_service: "PDFService",
        sample_settlement_data: dict,
    ) -> None:
        """일별 상세가 포함된 정산 보고서 PDF."""
        result = pdf_service.generate_settlement_report(sample_settlement_data)

        assert result is not None
        result.seek(0, 2)
        size = result.tell()
        assert size > 1000

    def test_generate_settlement_pdf_minimal(
        self,
        pdf_service: "PDFService",
    ) -> None:
        """최소 데이터로 정산 보고서 PDF 생성."""
        minimal_data = {
            "product_id": "P-001",
            "product_name": "테스트 제품",
            "period_start": date(2025, 1, 1),
            "period_end": date(2025, 1, 31),
            "before_cost": Decimal("1000.00"),
            "after_cost": Decimal("1100.00"),
            "settlement_amount": Decimal("10000.00"),
        }

        result = pdf_service.generate_settlement_report(minimal_data)

        assert result is not None
        result.seek(0)
        header = result.read(5)
        assert header == b"%PDF-"


class TestPDFServiceMaterialList:
    """자재 목록 PDF 생성 테스트."""

    def test_generate_material_list_pdf(
        self,
        pdf_service: "PDFService",
    ) -> None:
        """자재 목록 PDF 생성 성공."""
        materials = [
            {
                "material_id": "W-001",
                "material_name": "AVS 0.5sq",
                "material_type": "WIRE",
                "unit": "MTR",
                "unit_price": Decimal("15.5000"),
                "effective_date": date(2025, 1, 1),
            },
            {
                "material_id": "T-001",
                "material_name": "025 터미널",
                "material_type": "TERMINAL",
                "unit": "EA",
                "unit_price": Decimal("5.2500"),
                "effective_date": date(2025, 1, 1),
            },
        ]

        result = pdf_service.generate_material_list(materials)

        assert result is not None
        result.seek(0)
        header = result.read(5)
        assert header == b"%PDF-"

    def test_generate_material_list_pdf_empty(
        self,
        pdf_service: "PDFService",
    ) -> None:
        """빈 자재 목록 PDF 생성."""
        result = pdf_service.generate_material_list([])

        assert result is not None
        result.seek(0)
        header = result.read(5)
        assert header == b"%PDF-"
