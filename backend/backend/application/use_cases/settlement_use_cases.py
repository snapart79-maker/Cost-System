"""Settlement Use Cases.

정산 금액 계산 유스케이스.
PRD 5.5 변경 영향 계산 기반.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date
from decimal import Decimal

from backend.application.dtos.settlement_dto import (
    CalculateSettlementDTO,
    DailyBreakdownDTO,
    DailySettlementItem,
    SettlementResultDTO,
    SettlementSummaryDTO,
)
from backend.domain.repositories.price_change_repository import PriceChangeRepository


class ReceiptRepository(ABC):
    """입고 데이터 Repository 인터페이스."""

    @abstractmethod
    async def get_daily_quantities(
        self,
        product_id: str,
        start_date: date,
        end_date: date,
    ) -> dict[date, Decimal]:
        """일별 입고 수량 조회."""
        ...


class CalculateSettlementUseCase:
    """정산 금액 계산 유스케이스.

    PRD 5.5:
    정산 금액 = Σ (변경 적용일 이후 일별 입고 수량 × 단가 변경분)
    """

    def __init__(
        self,
        price_change_repo: PriceChangeRepository,
        receipt_repo: ReceiptRepository,
    ) -> None:
        """초기화."""
        self._price_change_repo = price_change_repo
        self._receipt_repo = receipt_repo

    async def execute(self, dto: CalculateSettlementDTO) -> SettlementResultDTO:
        """정산 금액 계산 실행.

        Args:
            dto: 정산 계산 DTO

        Returns:
            정산 결과 DTO
        """
        # 단가 변경 정보 조회
        price_change = await self._price_change_repo.get_by_id(dto.change_id)
        if not price_change:
            return SettlementResultDTO(
                change_id=dto.change_id,
                product_id="",
                start_date=dto.start_date,
                end_date=dto.end_date,
                total_quantity=Decimal("0"),
                unit_diff=Decimal("0"),
                settlement_amount=Decimal("0"),
            )

        # 일별 입고 수량 조회
        daily_quantities = await self._receipt_repo.get_daily_quantities(
            price_change.product_id,
            dto.start_date,
            dto.end_date,
        )

        # 단가 변경분
        unit_diff = price_change.after_cost - price_change.before_cost

        # 적용일 이후 수량만 합산
        total_quantity = Decimal("0")
        for qty_date, quantity in daily_quantities.items():
            if qty_date >= price_change.effective_date:
                total_quantity += quantity

        # 정산 금액 계산
        settlement_amount = (total_quantity * unit_diff).quantize(Decimal("0.01"))

        return SettlementResultDTO(
            change_id=dto.change_id,
            product_id=price_change.product_id,
            start_date=dto.start_date,
            end_date=dto.end_date,
            total_quantity=total_quantity,
            unit_diff=unit_diff,
            settlement_amount=settlement_amount,
        )


class GetSettlementSummaryUseCase:
    """정산 요약 유스케이스."""

    def __init__(
        self,
        price_change_repo: PriceChangeRepository,
        receipt_repo: ReceiptRepository,
    ) -> None:
        """초기화."""
        self._price_change_repo = price_change_repo
        self._receipt_repo = receipt_repo

    async def execute(
        self,
        start_date: date,
        end_date: date,
    ) -> SettlementSummaryDTO:
        """정산 요약 조회 실행.

        Args:
            start_date: 시작일
            end_date: 종료일

        Returns:
            정산 요약 DTO
        """
        # 기간 내 단가 변경 조회
        changes = await self._price_change_repo.get_by_date_range(start_date, end_date)

        increase_count = 0
        decrease_count = 0
        total_increase = Decimal("0")
        total_decrease = Decimal("0")

        for change in changes:
            diff = change.after_cost - change.before_cost
            if diff > 0:
                increase_count += 1
                total_increase += diff
            elif diff < 0:
                decrease_count += 1
                total_decrease += abs(diff)

        return SettlementSummaryDTO(
            start_date=start_date,
            end_date=end_date,
            total_changes=len(changes),
            increase_count=increase_count,
            decrease_count=decrease_count,
            total_increase_amount=total_increase,
            total_decrease_amount=total_decrease,
            net_amount=total_increase - total_decrease,
        )


class GetDailyBreakdownUseCase:
    """일별 정산 내역 상세 유스케이스."""

    def __init__(
        self,
        price_change_repo: PriceChangeRepository,
        receipt_repo: ReceiptRepository,
    ) -> None:
        """초기화."""
        self._price_change_repo = price_change_repo
        self._receipt_repo = receipt_repo

    async def execute(
        self,
        change_id: str,
        start_date: date,
        end_date: date,
    ) -> DailyBreakdownDTO:
        """일별 정산 내역 조회 실행.

        Args:
            change_id: 변경 ID
            start_date: 시작일
            end_date: 종료일

        Returns:
            일별 정산 내역 DTO
        """
        # 단가 변경 정보 조회
        price_change = await self._price_change_repo.get_by_id(change_id)
        if not price_change:
            return DailyBreakdownDTO(
                change_id=change_id,
                product_id="",
                unit_diff=Decimal("0"),
            )

        # 일별 입고 수량 조회
        daily_quantities = await self._receipt_repo.get_daily_quantities(
            price_change.product_id,
            start_date,
            end_date,
        )

        # 단가 변경분
        unit_diff = price_change.after_cost - price_change.before_cost

        # 일별 항목 생성 (적용일 이후만)
        daily_items: list[DailySettlementItem] = []
        total_amount = Decimal("0")

        for qty_date in sorted(daily_quantities.keys()):
            if qty_date >= price_change.effective_date:
                quantity = daily_quantities[qty_date]
                amount = (quantity * unit_diff).quantize(Decimal("0.01"))
                daily_items.append(
                    DailySettlementItem(
                        date=qty_date,
                        quantity=quantity,
                        amount=amount,
                    )
                )
                total_amount += amount

        return DailyBreakdownDTO(
            change_id=change_id,
            product_id=price_change.product_id,
            unit_diff=unit_diff,
            daily_items=daily_items,
            total_amount=total_amount,
        )
