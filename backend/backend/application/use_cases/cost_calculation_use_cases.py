"""Cost Calculation Use Cases.

원가 계산서 생성 유스케이스.
PRD 5장 원가 계산 로직 기반.
"""

from __future__ import annotations

from decimal import Decimal

from backend.application.dtos.cost_calculation_dto import (
    CalculateCostDTO,
    CompareCostDTO,
    CostBreakdownResultDTO,
    CostComparisonResultDTO,
    CostReportDTO,
    MaterialCostDetail,
    ProcessCostDetail,
    WorkTypeCostBreakdown,
)
from backend.domain.repositories.bom_repository import BOMRepository
from backend.domain.repositories.material_repository import MaterialRepository
from backend.domain.repositories.process_repository import ProcessRepository
from backend.domain.repositories.product_repository import ProductRepository
from backend.domain.services.manufacturing_cost_service import (
    CostInput,
    ManufacturingCostService,
)
from backend.domain.services.material_cost_service import MaterialCostService
from backend.domain.services.process_cost_service import ProcessCostService


class CalculateCostUseCase:
    """원가 계산 유스케이스.

    PRD 5장:
    - 제조원가 = 재료비 + 노무비 + 경비
    - 구매원가 = 제조원가 + 재료관리비 + 일반관리비 + 불량비 + 이윤
    """

    def __init__(
        self,
        material_repo: MaterialRepository,
        process_repo: ProcessRepository,
        bom_repo: BOMRepository,
    ) -> None:
        """초기화."""
        self._material_repo = material_repo
        self._process_repo = process_repo
        self._bom_repo = bom_repo
        self._material_cost_service = MaterialCostService()
        self._process_cost_service = ProcessCostService()
        self._manufacturing_cost_service = ManufacturingCostService()

    async def execute(self, dto: CalculateCostDTO) -> CostBreakdownResultDTO:
        """원가 계산 실행.

        Args:
            dto: 원가 계산 DTO

        Returns:
            원가 명세 결과 DTO (내작/외작 분리 포함)
        """
        # BOM 조회
        bom = await self._bom_repo.get_by_product_id(dto.product_id)
        if not bom:
            return CostBreakdownResultDTO(product_id=dto.product_id)

        # 자재 정보 수집 및 재료비 계산 (내작/외작 분리)
        material_details = []
        gross_material_cost = Decimal("0")
        scrap_value = Decimal("0")
        in_house_material = Decimal("0")
        outsource_material = Decimal("0")

        for item in bom.items:
            material = await self._material_repo.get_by_id(item.material_id)
            if material:
                mat_cost = material.calculate_material_cost(item.quantity)
                mat_scrap = material.calculate_scrap_value(item.quantity)
                net_cost = material.calculate_net_material_cost(item.quantity)

                gross_material_cost += mat_cost
                scrap_value += mat_scrap

                # 내작/외작 분류
                work_type_str = item.work_type.value
                if item.work_type.value == "IN_HOUSE":
                    in_house_material += net_cost
                else:
                    outsource_material += net_cost

                material_details.append(
                    MaterialCostDetail(
                        material_id=material.material_id,
                        material_name=material.material_name,
                        quantity=item.quantity,
                        unit_price=material.unit_price,
                        material_cost=mat_cost,
                        scrap_value=mat_scrap,
                        net_cost=net_cost,
                        work_type=work_type_str,
                    )
                )

        net_material_cost = gross_material_cost - scrap_value

        # 공정비 계산 (내작/외작 분리)
        labor_cost = Decimal("0")
        machine_cost = Decimal("0")
        in_house_labor = Decimal("0")
        in_house_machine = Decimal("0")
        outsource_labor = Decimal("0")
        outsource_machine = Decimal("0")
        process_details = []

        for proc_info in dto.processes:
            process = await self._process_repo.get_by_id(proc_info.process_id)
            if process:
                proc_labor = process.calculate_labor_cost(
                    proc_info.cycle_time, proc_info.workers
                )
                proc_machine = process.calculate_machine_cost(proc_info.cycle_time)

                labor_cost += proc_labor
                machine_cost += proc_machine

                # 내작/외작 분류
                work_type_str = process.work_type.value
                if process.work_type.value == "IN_HOUSE":
                    in_house_labor += proc_labor
                    in_house_machine += proc_machine
                else:
                    outsource_labor += proc_labor
                    outsource_machine += proc_machine

                process_details.append(
                    ProcessCostDetail(
                        process_id=process.process_id,
                        process_name=process.process_name,
                        cycle_time=proc_info.cycle_time,
                        workers=proc_info.workers,
                        labor_cost=proc_labor,
                        machine_cost=proc_machine,
                        total_cost=proc_labor + proc_machine,
                        work_type=work_type_str,
                    )
                )

        # 전체 제조원가 및 구매원가 계산
        cost_input = CostInput(
            material_cost=net_material_cost,
            labor_cost=labor_cost,
            machine_cost=machine_cost,
        )
        breakdown = self._manufacturing_cost_service.calculate(cost_input)

        # 내작 원가 계산
        in_house_input = CostInput(
            material_cost=in_house_material,
            labor_cost=in_house_labor,
            machine_cost=in_house_machine,
        )
        in_house_breakdown = self._manufacturing_cost_service.calculate(in_house_input)
        in_house_cost = WorkTypeCostBreakdown(
            material_cost=in_house_material,
            labor_cost=in_house_labor,
            machine_cost=in_house_machine,
            manufacturing_cost=in_house_breakdown.manufacturing_cost,
            material_management_fee=in_house_breakdown.material_management_fee,
            general_admin_fee=in_house_breakdown.general_admin_fee,
            defect_cost=in_house_breakdown.defect_cost,
            profit=in_house_breakdown.profit,
            purchase_cost=in_house_breakdown.purchase_cost,
        )

        # 외작 원가 계산
        outsource_input = CostInput(
            material_cost=outsource_material,
            labor_cost=outsource_labor,
            machine_cost=outsource_machine,
        )
        outsource_breakdown = self._manufacturing_cost_service.calculate(outsource_input)
        outsource_cost = WorkTypeCostBreakdown(
            material_cost=outsource_material,
            labor_cost=outsource_labor,
            machine_cost=outsource_machine,
            manufacturing_cost=outsource_breakdown.manufacturing_cost,
            material_management_fee=outsource_breakdown.material_management_fee,
            general_admin_fee=outsource_breakdown.general_admin_fee,
            defect_cost=outsource_breakdown.defect_cost,
            profit=outsource_breakdown.profit,
            purchase_cost=outsource_breakdown.purchase_cost,
        )

        return CostBreakdownResultDTO(
            product_id=dto.product_id,
            gross_material_cost=gross_material_cost,
            scrap_value=scrap_value,
            net_material_cost=net_material_cost,
            labor_cost=labor_cost,
            machine_cost=machine_cost,
            manufacturing_cost=breakdown.manufacturing_cost,
            material_management_fee=breakdown.material_management_fee,
            general_admin_fee=breakdown.general_admin_fee,
            defect_cost=breakdown.defect_cost,
            profit=breakdown.profit,
            purchase_cost=breakdown.purchase_cost,
            in_house=in_house_cost,
            outsource=outsource_cost,
            material_details=material_details,
            process_details=process_details,
        )


class GenerateCostBreakdownReportUseCase:
    """원가 명세서 생성 유스케이스."""

    def __init__(
        self,
        material_repo: MaterialRepository,
        process_repo: ProcessRepository,
        product_repo: ProductRepository,
        bom_repo: BOMRepository,
    ) -> None:
        """초기화."""
        self._material_repo = material_repo
        self._process_repo = process_repo
        self._product_repo = product_repo
        self._bom_repo = bom_repo
        self._calculate_cost_uc = CalculateCostUseCase(
            material_repo, process_repo, bom_repo
        )

    async def execute(self, product_id: str) -> CostReportDTO:
        """원가 명세서 생성 실행.

        Args:
            product_id: 완제품 ID

        Returns:
            원가 계산서 DTO
        """
        # 완제품 정보 조회
        product = await self._product_repo.get_by_id(product_id)
        if not product:
            return CostReportDTO(
                product_id=product_id,
                product_name="",
            )

        # 원가 계산 (공정 정보 없이 재료비만)
        from backend.application.dtos.cost_calculation_dto import CalculateCostDTO

        dto = CalculateCostDTO(product_id=product_id, processes=[])
        breakdown = await self._calculate_cost_uc.execute(dto)

        return CostReportDTO(
            product_id=product_id,
            product_name=product.product_name,
            customer=product.customer,
            car_model=product.car_model,
            material_details=breakdown.material_details,
            process_details=breakdown.process_details,
            total_cost=breakdown.purchase_cost,
            breakdown=breakdown,
        )


class CompareCostVersionsUseCase:
    """원가 버전 비교 유스케이스."""

    def __init__(
        self,
        material_repo: MaterialRepository,
        process_repo: ProcessRepository,
        bom_repo: BOMRepository,
    ) -> None:
        """초기화."""
        self._material_repo = material_repo
        self._process_repo = process_repo
        self._bom_repo = bom_repo

    async def execute(self, dto: CompareCostDTO) -> CostComparisonResultDTO:
        """원가 비교 실행.

        Args:
            dto: 원가 비교 DTO

        Returns:
            원가 비교 결과 DTO
        """
        # 현재 원가 계산
        current_cost = await self._calculate_cost(dto.product_id, {})

        # 변경 가격 맵 생성
        price_changes: dict[str, Decimal] = {}
        for change in dto.price_changes:
            if change.material_id and change.new_price:
                price_changes[change.material_id] = change.new_price

        # 새 원가 계산
        new_cost = await self._calculate_cost(dto.product_id, price_changes)

        difference = new_cost - current_cost
        if current_cost > 0:
            change_rate = (difference / current_cost * 100).quantize(Decimal("0.01"))
        else:
            change_rate = Decimal("0")

        return CostComparisonResultDTO(
            product_id=dto.product_id,
            current_cost=current_cost,
            new_cost=new_cost,
            difference=difference,
            change_rate=change_rate,
        )

    async def _calculate_cost(
        self,
        product_id: str,
        price_overrides: dict[str, Decimal],
    ) -> Decimal:
        """원가 계산 (내부 헬퍼)."""
        bom = await self._bom_repo.get_by_product_id(product_id)
        if not bom:
            return Decimal("0")

        total = Decimal("0")
        for item in bom.items:
            material = await self._material_repo.get_by_id(item.material_id)
            if material:
                # 가격 오버라이드 적용
                price = price_overrides.get(item.material_id, material.unit_price)
                total += price * item.quantity

        return total.quantize(Decimal("0.01"))
