"""PDF Service.

ReportLab을 사용한 PDF 보고서 생성 서비스.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from io import BytesIO
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


class PDFService:
    """PDF 생성 서비스."""

    def __init__(self) -> None:
        """서비스 초기화."""
        self._register_fonts()
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()

    def _register_fonts(self) -> None:
        """폰트 등록 (한글 지원)."""
        # 시스템 폰트 경로 시도
        font_paths = [
            # macOS
            "/System/Library/Fonts/AppleSDGothicNeo.ttc",
            "/Library/Fonts/AppleGothic.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            # Linux
            "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
            # Windows
            "C:/Windows/Fonts/malgun.ttf",
        ]

        font_registered = False
        for font_path in font_paths:
            try:
                pdfmetrics.registerFont(TTFont("Korean", font_path))
                font_registered = True
                break
            except Exception:
                continue

        if not font_registered:
            # 기본 폰트 사용 (한글이 깨질 수 있음)
            self.default_font = "Helvetica"
        else:
            self.default_font = "Korean"

    def _create_custom_styles(self) -> None:
        """커스텀 스타일 생성."""
        self.title_style = ParagraphStyle(
            "CustomTitle",
            parent=self.styles["Heading1"],
            fontSize=16,
            spaceAfter=20,
            alignment=1,  # Center
        )

        self.heading_style = ParagraphStyle(
            "CustomHeading",
            parent=self.styles["Heading2"],
            fontSize=12,
            spaceAfter=10,
            spaceBefore=15,
        )

        self.normal_style = ParagraphStyle(
            "CustomNormal",
            parent=self.styles["Normal"],
            fontSize=10,
            spaceAfter=5,
        )

    def generate_cost_breakdown(self, data: dict[str, Any]) -> BytesIO:
        """원가 계산서 PDF 생성.

        Args:
            data: 원가 계산 데이터

        Returns:
            BytesIO: PDF 파일 바이트 스트림
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20 * mm,
            leftMargin=20 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
        )

        elements = []

        # 제목
        elements.append(Paragraph("Cost Breakdown Report", self.title_style))
        elements.append(Spacer(1, 10 * mm))

        # 기본 정보 테이블
        info_data = [
            ["Product ID", str(data.get("product_id", ""))],
            ["Product Name", str(data.get("product_name", ""))],
            ["Customer", str(data.get("customer", "-"))],
            ["Car Model", str(data.get("car_model", "-"))],
            ["Date", self._format_date(data.get("calculation_date"))],
            ["Version", str(data.get("version", "1.0"))],
        ]

        info_table = Table(info_data, colWidths=[50 * mm, 100 * mm])
        info_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ]
            )
        )
        elements.append(info_table)
        elements.append(Spacer(1, 10 * mm))

        # 원가 요약 테이블
        elements.append(Paragraph("Cost Summary", self.heading_style))

        cost_data = [
            ["Item", "Amount"],
            ["Material Cost", self._format_decimal(data.get("material_cost"))],
            ["Labor Cost", self._format_decimal(data.get("labor_cost"))],
            ["Overhead Cost", self._format_decimal(data.get("overhead_cost"))],
            ["Manufacturing Cost", self._format_decimal(data.get("manufacturing_cost"))],
            ["Material Mgmt Fee", self._format_decimal(data.get("material_management_fee"))],
            ["General Admin Fee", self._format_decimal(data.get("general_admin_fee"))],
            ["Defect Cost", self._format_decimal(data.get("defect_cost"))],
            ["Profit", self._format_decimal(data.get("profit"))],
            ["Purchase Cost", self._format_decimal(data.get("purchase_cost"))],
        ]

        cost_table = Table(cost_data, colWidths=[80 * mm, 50 * mm])
        cost_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("BACKGROUND", (0, -1), (-1, -1), colors.lightblue),
                    ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ]
            )
        )
        elements.append(cost_table)
        elements.append(Spacer(1, 10 * mm))

        # 재료비 상세 테이블
        materials = data.get("materials", [])
        if materials:
            elements.append(Paragraph("Material Details", self.heading_style))

            material_data = [["ID", "Name", "Unit", "Qty", "Price", "Amount"]]
            for m in materials:
                material_data.append(
                    [
                        str(m.get("material_id", "")),
                        str(m.get("material_name", "")),
                        str(m.get("unit", "")),
                        self._format_decimal(m.get("quantity")),
                        self._format_decimal(m.get("unit_price")),
                        self._format_decimal(m.get("amount")),
                    ]
                )

            material_table = Table(
                material_data,
                colWidths=[25 * mm, 45 * mm, 15 * mm, 20 * mm, 25 * mm, 25 * mm],
            )
            material_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                        ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
                        ("FONTSIZE", (0, 0), (-1, -1), 9),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ]
                )
            )
            elements.append(material_table)
            elements.append(Spacer(1, 10 * mm))

        # 공정비 상세 테이블
        processes = data.get("processes", [])
        if processes:
            elements.append(Paragraph("Process Details", self.heading_style))

            process_data = [["ID", "Name", "Type", "Labor", "Machine", "Total"]]
            for p in processes:
                process_data.append(
                    [
                        str(p.get("process_id", "")),
                        str(p.get("process_name", "")),
                        str(p.get("work_type", "")),
                        self._format_decimal(p.get("labor_cost")),
                        self._format_decimal(p.get("machine_cost")),
                        self._format_decimal(p.get("total_cost")),
                    ]
                )

            process_table = Table(
                process_data,
                colWidths=[25 * mm, 40 * mm, 25 * mm, 25 * mm, 25 * mm, 25 * mm],
            )
            process_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                        ("ALIGN", (3, 1), (-1, -1), "RIGHT"),
                        ("FONTSIZE", (0, 0), (-1, -1), 9),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ]
                )
            )
            elements.append(process_table)

        doc.build(elements)
        buffer.seek(0)
        return buffer

    def generate_settlement_report(self, data: dict[str, Any]) -> BytesIO:
        """정산 보고서 PDF 생성.

        Args:
            data: 정산 데이터

        Returns:
            BytesIO: PDF 파일 바이트 스트림
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20 * mm,
            leftMargin=20 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
        )

        elements = []

        # 제목
        elements.append(Paragraph("Settlement Report", self.title_style))
        elements.append(Spacer(1, 10 * mm))

        # 기본 정보 테이블
        period_start = self._format_date(data.get("period_start"))
        period_end = self._format_date(data.get("period_end"))

        info_data = [
            ["Product ID", str(data.get("product_id", ""))],
            ["Product Name", str(data.get("product_name", ""))],
            ["Customer", str(data.get("customer", "-"))],
            ["Period", f"{period_start} ~ {period_end}"],
            ["Change Reason", str(data.get("change_reason", "-"))],
            ["ECO Number", str(data.get("eco_number", "-"))],
            ["Effective Date", self._format_date(data.get("effective_date"))],
        ]

        info_table = Table(info_data, colWidths=[50 * mm, 100 * mm])
        info_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ]
            )
        )
        elements.append(info_table)
        elements.append(Spacer(1, 10 * mm))

        # 정산 요약 테이블
        elements.append(Paragraph("Settlement Summary", self.heading_style))

        settlement_data = [
            ["Item", "Value"],
            ["Before Cost", self._format_decimal(data.get("before_cost"))],
            ["After Cost", self._format_decimal(data.get("after_cost"))],
            ["Cost Difference", self._format_decimal(data.get("cost_difference"))],
            ["Change Rate (%)", self._format_decimal(data.get("change_rate"))],
            ["Total Quantity", self._format_decimal(data.get("total_quantity"))],
            ["Settlement Amount", self._format_decimal(data.get("settlement_amount"))],
        ]

        settlement_table = Table(settlement_data, colWidths=[80 * mm, 50 * mm])
        settlement_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("BACKGROUND", (0, -1), (-1, -1), colors.lightblue),
                    ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ]
            )
        )
        elements.append(settlement_table)
        elements.append(Spacer(1, 10 * mm))

        # 일별 상세 테이블
        daily_breakdown = data.get("daily_breakdown", [])
        if daily_breakdown:
            elements.append(Paragraph("Daily Breakdown", self.heading_style))

            daily_data = [["Date", "Quantity", "Unit Diff", "Settlement"]]
            for d in daily_breakdown:
                daily_data.append(
                    [
                        self._format_date(d.get("date")),
                        self._format_decimal(d.get("quantity")),
                        self._format_decimal(d.get("unit_diff")),
                        self._format_decimal(d.get("settlement")),
                    ]
                )

            daily_table = Table(
                daily_data, colWidths=[40 * mm, 35 * mm, 35 * mm, 40 * mm]
            )
            daily_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                        ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
                        ("FONTSIZE", (0, 0), (-1, -1), 9),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ]
                )
            )
            elements.append(daily_table)
            elements.append(Spacer(1, 10 * mm))

        # 자재 변경 상세
        material_changes = data.get("material_changes", [])
        if material_changes:
            elements.append(Paragraph("Material Price Changes", self.heading_style))

            change_data = [["ID", "Name", "Before", "After", "Diff"]]
            for m in material_changes:
                change_data.append(
                    [
                        str(m.get("material_id", "")),
                        str(m.get("material_name", "")),
                        self._format_decimal(m.get("before_price")),
                        self._format_decimal(m.get("after_price")),
                        self._format_decimal(m.get("difference")),
                    ]
                )

            change_table = Table(
                change_data, colWidths=[25 * mm, 50 * mm, 30 * mm, 30 * mm, 25 * mm]
            )
            change_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                        ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
                        ("FONTSIZE", (0, 0), (-1, -1), 9),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ]
                )
            )
            elements.append(change_table)

        doc.build(elements)
        buffer.seek(0)
        return buffer

    def generate_material_list(self, materials: list[dict[str, Any]]) -> BytesIO:
        """자재 목록 PDF 생성.

        Args:
            materials: 자재 데이터 목록

        Returns:
            BytesIO: PDF 파일 바이트 스트림
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20 * mm,
            leftMargin=20 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
        )

        elements = []

        # 제목
        elements.append(Paragraph("Material List", self.title_style))
        elements.append(Spacer(1, 10 * mm))

        # 자재 목록 테이블
        table_data = [["ID", "Name", "Type", "Unit", "Price", "Eff. Date"]]

        if materials:
            for m in materials:
                table_data.append(
                    [
                        str(m.get("material_id", "")),
                        str(m.get("material_name", "")),
                        str(m.get("material_type", "")),
                        str(m.get("unit", "")),
                        self._format_decimal(m.get("unit_price")),
                        self._format_date(m.get("effective_date")),
                    ]
                )
        else:
            table_data.append(["No materials", "", "", "", "", ""])

        material_table = Table(
            table_data,
            colWidths=[25 * mm, 45 * mm, 25 * mm, 20 * mm, 25 * mm, 25 * mm],
        )
        material_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("ALIGN", (4, 1), (4, -1), "RIGHT"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ]
            )
        )
        elements.append(material_table)

        doc.build(elements)
        buffer.seek(0)
        return buffer

    def _format_decimal(self, value: Decimal | float | None) -> str:
        """Decimal 포맷팅."""
        if value is None:
            return "-"
        if isinstance(value, Decimal):
            return f"{value:,.2f}"
        return f"{value:,.2f}"

    def _format_date(self, value: date | str | None) -> str:
        """날짜 포맷팅."""
        if value is None:
            return "-"
        if isinstance(value, date):
            return value.strftime("%Y-%m-%d")
        return str(value)
