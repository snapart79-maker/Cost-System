"""Price Change Use Cases.

단가 변경 등록 및 관리 유스케이스.
PRD 4.2.2 단가 변경 이력 및 5.5 변경 영향 계산 기반.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Any
from uuid import uuid4

from backend.application.dtos.price_change_dto import RegisterPriceChangeDTO
from backend.domain.entities.price_change import (
    ChangeType,
    MaterialChangeDetail,
    PriceChange,
    ProcessChangeDetail,
)
from backend.domain.repositories.bom_repository import BOMRepository
from backend.domain.repositories.material_repository import MaterialRepository
from backend.domain.repositories.price_change_repository import PriceChangeRepository
from backend.domain.repositories.process_repository import ProcessRepository
from backend.domain.repositories.product_repository import ProductRepository


class ProductNotFoundError(Exception):
    """완제품을 찾을 수 없는 경우."""

    pass


class RegisterPriceChangeUseCase:
    """단가 변경 등록 유스케이스.

    변경 사유 입력 시 자동 원가 재계산 및 변경 전/후 비교 생성.
    """

    def __init__(
        self,
        price_change_repo: PriceChangeRepository,
        material_repo: MaterialRepository,
        process_repo: ProcessRepository,
        product_repo: ProductRepository,
        bom_repo: BOMRepository,
    ) -> None:
        """초기화."""
        self._price_change_repo = price_change_repo
        self._material_repo = material_repo
        self._process_repo = process_repo
        self._product_repo = product_repo
        self._bom_repo = bom_repo

    async def execute(self, dto: RegisterPriceChangeDTO) -> PriceChange:
        """단가 변경 등록 실행.

        Args:
            dto: 단가 변경 등록 DTO

        Returns:
            등록된 단가 변경 엔티티

        Raises:
            ProductNotFoundError: 완제품을 찾을 수 없는 경우
        """
        # 완제품 확인
        product = await self._product_repo.get_by_id(dto.product_id)
        if not product:
            raise ProductNotFoundError(f"완제품 '{dto.product_id}'를 찾을 수 없습니다.")

        # 변경 전 원가 계산 (간소화된 버전 - 실제로는 더 복잡한 계산 필요)
        before_cost = await self._calculate_current_cost(dto.product_id)

        # 변경 후 원가 계산 (간소화된 버전)
        after_cost = await self._calculate_new_cost(dto)

        # 변경 ID 생성
        change_id = f"CHG-{uuid4().hex[:8].upper()}"

        # 단가 변경 엔티티 생성
        price_change = PriceChange(
            change_id=change_id,
            product_id=dto.product_id,
            change_type=ChangeType(dto.change_type),
            change_reason=dto.change_reason,
            effective_date=dto.effective_date,
            before_cost=before_cost,
            after_cost=after_cost,
            eco_number=dto.eco_number,
            created_by=dto.created_by,
        )

        # 상세 변경 내역 추가
        for mc in dto.material_changes:
            material = await self._material_repo.get_by_id(mc["material_id"])
            if material:
                detail = MaterialChangeDetail(
                    material_id=mc["material_id"],
                    before_price=material.unit_price,
                    after_price=mc.get("new_price", material.unit_price),
                )
                price_change.add_detail(detail)

        for pc in dto.process_changes:
            process = await self._process_repo.get_by_id(pc["process_id"])
            if process:
                proc_detail = ProcessChangeDetail(
                    process_id=pc["process_id"],
                    before_labor_rate=process.labor_rate,
                    after_labor_rate=pc.get("new_labor_rate", process.labor_rate),
                    before_machine_cost=process.machine_cost,
                    after_machine_cost=pc.get("new_machine_cost", process.machine_cost),
                )
                price_change.add_detail(proc_detail)

        return await self._price_change_repo.create(price_change)

    async def _calculate_current_cost(self, product_id: str) -> Decimal:
        """현재 원가 계산 (간소화 버전)."""
        # 실제 구현에서는 ManufacturingCostService를 사용
        bom = await self._bom_repo.get_by_product_id(product_id)
        if not bom:
            return Decimal("0")

        total = Decimal("0")
        for item in bom.items:
            material = await self._material_repo.get_by_id(item.material_id)
            if material:
                total += material.unit_price * item.quantity

        return total.quantize(Decimal("0.01"))

    async def _calculate_new_cost(self, dto: RegisterPriceChangeDTO) -> Decimal:
        """변경 후 원가 계산 (간소화 버전)."""
        current = await self._calculate_current_cost(dto.product_id)

        # 자재 단가 변경분 적용
        diff = Decimal("0")
        bom = await self._bom_repo.get_by_product_id(dto.product_id)
        if bom:
            for mc in dto.material_changes:
                material = await self._material_repo.get_by_id(mc["material_id"])
                if material:
                    # BOM에서 해당 자재의 수량 찾기
                    for item in bom.items:
                        if item.material_id == mc["material_id"]:
                            new_price_value = mc.get("new_price", material.unit_price)
                            # 문자열인 경우 Decimal로 변환
                            if isinstance(new_price_value, str):
                                new_price_value = Decimal(new_price_value)
                            price_diff = new_price_value - material.unit_price
                            diff += price_diff * item.quantity
                            break

        return (current + diff).quantize(Decimal("0.01"))


class GetPriceChangeUseCase:
    """단가 변경 이력 조회 유스케이스."""

    def __init__(self, repository: PriceChangeRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, change_id: str) -> PriceChange | None:
        """단가 변경 조회 실행.

        Args:
            change_id: 변경 ID

        Returns:
            단가 변경 엔티티 또는 None
        """
        return await self._repository.get_by_id(change_id)


class ListPriceChangesUseCase:
    """단가 변경 이력 목록 조회 유스케이스."""

    def __init__(self, repository: PriceChangeRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(
        self,
        product_id: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[PriceChange]:
        """단가 변경 목록 조회 실행.

        Args:
            product_id: 완제품 ID (선택)
            start_date: 시작일 (선택)
            end_date: 종료일 (선택)

        Returns:
            단가 변경 목록
        """
        if product_id:
            return await self._repository.get_by_product_id(product_id)
        if start_date and end_date:
            return await self._repository.get_by_date_range(start_date, end_date)
        return await self._repository.get_all()


class CompareCostsUseCase:
    """변경 전/후 원가 비교 유스케이스."""

    def __init__(self, repository: PriceChangeRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, change_id: str) -> dict[str, Any]:
        """원가 비교 실행.

        Args:
            change_id: 변경 ID

        Returns:
            원가 비교 결과
        """
        price_change = await self._repository.get_by_id(change_id)
        if not price_change:
            return {}

        difference = price_change.after_cost - price_change.before_cost
        if price_change.before_cost > 0:
            change_rate = (difference / price_change.before_cost * 100).quantize(
                Decimal("0.01")
            )
        else:
            change_rate = Decimal("0")

        return {
            "before_cost": price_change.before_cost,
            "after_cost": price_change.after_cost,
            "difference": difference,
            "change_rate": change_rate,
        }
