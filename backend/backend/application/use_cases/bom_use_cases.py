"""BOM Use Cases.

BOM 관리 CRUD 유스케이스.
"""

from __future__ import annotations

from backend.application.dtos.bom_dto import BOMItemDTO, CreateBOMDTO
from backend.domain.entities.bom import BOM, BOMItem, WorkType
from backend.domain.repositories.bom_repository import BOMRepository


class BOMNotFoundError(Exception):
    """BOM을 찾을 수 없는 경우."""

    pass


class CreateBOMUseCase:
    """BOM 생성 유스케이스."""

    def __init__(self, repository: BOMRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, dto: CreateBOMDTO) -> BOM:
        """BOM 생성 실행.

        Args:
            dto: BOM 생성 DTO

        Returns:
            생성된 BOM 엔티티
        """
        items = [
            BOMItem(
                product_id=dto.product_id,
                material_id=item.material_id,
                quantity=item.quantity,
                work_type=WorkType(item.work_type),
                sequence=item.sequence,
            )
            for item in dto.items
        ]

        bom = BOM(
            product_id=dto.product_id,
            version=dto.version,
            items=items,
        )

        return await self._repository.create(bom)


class GetBOMUseCase:
    """BOM 조회 유스케이스."""

    def __init__(self, repository: BOMRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, product_id: str) -> BOM | None:
        """BOM 조회 실행.

        Args:
            product_id: 완제품 ID

        Returns:
            BOM 엔티티 또는 None
        """
        return await self._repository.get_by_product_id(product_id)


class AddBOMItemUseCase:
    """BOM 항목 추가 유스케이스."""

    def __init__(self, repository: BOMRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, product_id: str, dto: BOMItemDTO) -> BOMItem:
        """BOM 항목 추가 실행.

        Args:
            product_id: 완제품 ID
            dto: BOM 항목 DTO

        Returns:
            추가된 BOM 항목

        Raises:
            BOMNotFoundError: BOM을 찾을 수 없는 경우
        """
        bom = await self._repository.get_by_product_id(product_id)
        if not bom:
            raise BOMNotFoundError(f"완제품 '{product_id}'의 BOM을 찾을 수 없습니다.")

        item = BOMItem(
            product_id=product_id,
            material_id=dto.material_id,
            quantity=dto.quantity,
            work_type=WorkType(dto.work_type),
            sequence=dto.sequence,
        )

        return await self._repository.add_item(item)


class RemoveBOMItemUseCase:
    """BOM 항목 삭제 유스케이스."""

    def __init__(self, repository: BOMRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, product_id: str, material_id: str) -> bool:
        """BOM 항목 삭제 실행.

        Args:
            product_id: 완제품 ID
            material_id: 자재 ID

        Returns:
            삭제 성공 여부
        """
        bom = await self._repository.get_by_product_id(product_id)
        if not bom:
            return False

        # BOM에서 해당 자재 항목 필터링 후 삭제
        original_count = len(bom.items)
        bom.items = [item for item in bom.items if item.material_id != material_id]

        return len(bom.items) < original_count


class DeleteBOMUseCase:
    """BOM 삭제 유스케이스."""

    def __init__(self, repository: BOMRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, product_id: str) -> bool:
        """BOM 삭제 실행.

        Args:
            product_id: 완제품 ID

        Returns:
            삭제 성공 여부
        """
        return await self._repository.delete(product_id)
