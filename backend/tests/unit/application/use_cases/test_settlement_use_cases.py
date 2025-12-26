"""Test 5.3: Settlement Use Cases 테스트.

TDD RED Phase: 정산 금액 계산 Use Cases 테스트.
PRD 5.5 변경 영향 계산 기반.
"""

from datetime import date
from decimal import Decimal
from unittest.mock import AsyncMock

import pytest

from backend.domain.entities.price_change import ChangeType, PriceChange


class TestCalculateSettlementUseCase:
    """정산 금액 계산 Use Case 테스트.

    PRD 5.5:
    정산 금액 = Σ (변경 적용일 이후 일별 입고 수량 × 단가 변경분)
    """

    @pytest.fixture
    def mock_repositories(self) -> dict:
        """Mock Repositories."""
        return {
            "price_change": AsyncMock(),
            "receipt": AsyncMock(),  # 입고 데이터 Repository
        }

    @pytest.mark.asyncio
    async def test_calculate_settlement_for_single_change(
        self, mock_repositories: dict
    ) -> None:
        """단일 변경건 정산 금액 계산."""
        from backend.application.use_cases.settlement_use_cases import (
            CalculateSettlementUseCase,
        )
        from backend.application.dtos.settlement_dto import CalculateSettlementDTO

        # Arrange
        price_change = PriceChange(
            change_id="CHG-001",
            product_id="P-WH-001",
            change_type=ChangeType.MATERIAL,
            change_reason="자재 단가 인상",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1650.00"),
        )
        mock_repositories["price_change"].get_by_id.return_value = price_change

        # 일별 입고 수량
        daily_receipts = {
            date(2025, 2, 1): Decimal("100"),  # 적용일 당일
            date(2025, 2, 2): Decimal("150"),
            date(2025, 2, 3): Decimal("120"),
        }
        mock_repositories["receipt"].get_daily_quantities.return_value = daily_receipts

        dto = CalculateSettlementDTO(
            change_id="CHG-001",
            start_date=date(2025, 2, 1),
            end_date=date(2025, 2, 28),
        )

        use_case = CalculateSettlementUseCase(
            price_change_repo=mock_repositories["price_change"],
            receipt_repo=mock_repositories["receipt"],
        )

        # Act
        result = await use_case.execute(dto)

        # Assert
        # 단가 변경분: 1650 - 1500 = 150
        # 정산 금액: (100 + 150 + 120) × 150 = 55,500
        assert result.total_quantity == Decimal("370")
        assert result.unit_diff == Decimal("150.00")
        assert result.settlement_amount == Decimal("55500.00")

    @pytest.mark.asyncio
    async def test_calculate_settlement_excludes_before_effective_date(
        self, mock_repositories: dict
    ) -> None:
        """적용일 이전 입고 수량은 정산에서 제외."""
        from backend.application.use_cases.settlement_use_cases import (
            CalculateSettlementUseCase,
        )
        from backend.application.dtos.settlement_dto import CalculateSettlementDTO

        price_change = PriceChange(
            change_id="CHG-001",
            product_id="P-WH-001",
            change_type=ChangeType.MATERIAL,
            change_reason="자재 단가 인상",
            effective_date=date(2025, 2, 15),  # 2월 15일부터 적용
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1650.00"),
        )
        mock_repositories["price_change"].get_by_id.return_value = price_change

        # 2월 1일~28일 입고 수량 (15일 이전 포함)
        daily_receipts = {
            date(2025, 2, 10): Decimal("100"),  # 제외
            date(2025, 2, 14): Decimal("100"),  # 제외
            date(2025, 2, 15): Decimal("100"),  # 포함
            date(2025, 2, 20): Decimal("100"),  # 포함
        }
        mock_repositories["receipt"].get_daily_quantities.return_value = daily_receipts

        dto = CalculateSettlementDTO(
            change_id="CHG-001",
            start_date=date(2025, 2, 1),
            end_date=date(2025, 2, 28),
        )

        use_case = CalculateSettlementUseCase(
            price_change_repo=mock_repositories["price_change"],
            receipt_repo=mock_repositories["receipt"],
        )

        # Act
        result = await use_case.execute(dto)

        # Assert
        # 적용일 이후 수량만: 100 + 100 = 200
        # 정산 금액: 200 × 150 = 30,000
        assert result.total_quantity == Decimal("200")
        assert result.settlement_amount == Decimal("30000.00")

    @pytest.mark.asyncio
    async def test_calculate_settlement_negative_diff(
        self, mock_repositories: dict
    ) -> None:
        """단가 인하 시 음수 정산 (환불)."""
        from backend.application.use_cases.settlement_use_cases import (
            CalculateSettlementUseCase,
        )
        from backend.application.dtos.settlement_dto import CalculateSettlementDTO

        price_change = PriceChange(
            change_id="CHG-002",
            product_id="P-WH-001",
            change_type=ChangeType.MATERIAL,
            change_reason="CR 활동 단가 인하",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1650.00"),
            after_cost=Decimal("1500.00"),  # 인하
        )
        mock_repositories["price_change"].get_by_id.return_value = price_change

        daily_receipts = {
            date(2025, 2, 1): Decimal("100"),
        }
        mock_repositories["receipt"].get_daily_quantities.return_value = daily_receipts

        dto = CalculateSettlementDTO(
            change_id="CHG-002",
            start_date=date(2025, 2, 1),
            end_date=date(2025, 2, 28),
        )

        use_case = CalculateSettlementUseCase(
            price_change_repo=mock_repositories["price_change"],
            receipt_repo=mock_repositories["receipt"],
        )

        # Act
        result = await use_case.execute(dto)

        # Assert
        # 단가 변경분: 1500 - 1650 = -150
        # 정산 금액: 100 × (-150) = -15,000 (환불)
        assert result.unit_diff == Decimal("-150.00")
        assert result.settlement_amount == Decimal("-15000.00")


class TestSettlementSummaryUseCase:
    """정산 요약 Use Case 테스트."""

    @pytest.fixture
    def mock_repositories(self) -> dict:
        """Mock Repositories."""
        return {
            "price_change": AsyncMock(),
            "receipt": AsyncMock(),
        }

    @pytest.mark.asyncio
    async def test_get_settlement_summary_by_period(
        self, mock_repositories: dict
    ) -> None:
        """기간별 정산 요약."""
        from backend.application.use_cases.settlement_use_cases import (
            GetSettlementSummaryUseCase,
        )
        from backend.application.dtos.settlement_dto import SettlementSummaryDTO

        # Arrange - 여러 변경건
        changes = [
            PriceChange(
                change_id="CHG-001",
                product_id="P-WH-001",
                change_type=ChangeType.MATERIAL,
                change_reason="자재 단가 인상",
                effective_date=date(2025, 2, 1),
                before_cost=Decimal("1500.00"),
                after_cost=Decimal("1650.00"),
            ),
            PriceChange(
                change_id="CHG-002",
                product_id="P-WH-002",
                change_type=ChangeType.PROCESS,
                change_reason="C/T 단축",
                effective_date=date(2025, 2, 15),
                before_cost=Decimal("2000.00"),
                after_cost=Decimal("1900.00"),
            ),
        ]
        mock_repositories["price_change"].get_by_date_range.return_value = changes

        use_case = GetSettlementSummaryUseCase(
            price_change_repo=mock_repositories["price_change"],
            receipt_repo=mock_repositories["receipt"],
        )

        # Act
        result = await use_case.execute(
            start_date=date(2025, 2, 1),
            end_date=date(2025, 2, 28),
        )

        # Assert
        assert result.total_changes == 2
        assert result.increase_count == 1  # 인상 건수
        assert result.decrease_count == 1  # 인하 건수


class TestDailySettlementBreakdownUseCase:
    """일별 정산 내역 상세 Use Case 테스트."""

    @pytest.fixture
    def mock_repositories(self) -> dict:
        """Mock Repositories."""
        return {
            "price_change": AsyncMock(),
            "receipt": AsyncMock(),
        }

    @pytest.mark.asyncio
    async def test_get_daily_breakdown(self, mock_repositories: dict) -> None:
        """일별 정산 내역 상세 조회."""
        from backend.application.use_cases.settlement_use_cases import (
            GetDailyBreakdownUseCase,
        )

        price_change = PriceChange(
            change_id="CHG-001",
            product_id="P-WH-001",
            change_type=ChangeType.MATERIAL,
            change_reason="자재 단가 인상",
            effective_date=date(2025, 2, 1),
            before_cost=Decimal("1500.00"),
            after_cost=Decimal("1650.00"),
        )
        mock_repositories["price_change"].get_by_id.return_value = price_change

        daily_receipts = {
            date(2025, 2, 1): Decimal("100"),
            date(2025, 2, 2): Decimal("150"),
            date(2025, 2, 3): Decimal("120"),
        }
        mock_repositories["receipt"].get_daily_quantities.return_value = daily_receipts

        use_case = GetDailyBreakdownUseCase(
            price_change_repo=mock_repositories["price_change"],
            receipt_repo=mock_repositories["receipt"],
        )

        # Act
        result = await use_case.execute(
            change_id="CHG-001",
            start_date=date(2025, 2, 1),
            end_date=date(2025, 2, 3),
        )

        # Assert
        assert len(result.daily_items) == 3
        assert result.daily_items[0].date == date(2025, 2, 1)
        assert result.daily_items[0].quantity == Decimal("100")
        assert result.daily_items[0].amount == Decimal("15000.00")  # 100 × 150
