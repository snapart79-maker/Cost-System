"""Material Use Cases.

자재 마스터 CRUD 유스케이스.
"""

from __future__ import annotations

from backend.application.dtos.material_dto import CreateMaterialDTO, UpdateMaterialDTO
from backend.domain.entities.material import Material, MaterialType, MaterialUnit
from backend.domain.repositories.material_repository import MaterialRepository


class MaterialAlreadyExistsError(Exception):
    """자재가 이미 존재하는 경우."""

    pass


class MaterialNotFoundError(Exception):
    """자재를 찾을 수 없는 경우."""

    pass


class CreateMaterialUseCase:
    """자재 생성 유스케이스."""

    def __init__(self, repository: MaterialRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, dto: CreateMaterialDTO) -> Material:
        """자재 생성 실행.

        Args:
            dto: 자재 생성 DTO

        Returns:
            생성된 자재 엔티티

        Raises:
            MaterialAlreadyExistsError: 이미 존재하는 자재인 경우
        """
        # 중복 검사
        existing = await self._repository.get_by_id(dto.material_id)
        if existing:
            raise MaterialAlreadyExistsError(
                f"자재 '{dto.material_id}'가 이미 존재합니다."
            )

        # 엔티티 생성
        from decimal import Decimal

        material = Material(
            material_id=dto.material_id,
            material_name=dto.material_name,
            material_type=MaterialType(dto.material_type),
            unit=MaterialUnit(dto.unit),
            unit_price=dto.unit_price,
            effective_date=dto.effective_date,
            scrap_rate=dto.scrap_rate or Decimal("0"),
            supplier=dto.supplier,
            specification=dto.specification,
        )

        return await self._repository.create(material)


class GetMaterialUseCase:
    """자재 조회 유스케이스."""

    def __init__(self, repository: MaterialRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, material_id: str) -> Material | None:
        """자재 조회 실행.

        Args:
            material_id: 자재 ID

        Returns:
            자재 엔티티 또는 None
        """
        return await self._repository.get_by_id(material_id)


class ListMaterialsUseCase:
    """자재 목록 조회 유스케이스."""

    def __init__(self, repository: MaterialRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(
        self, material_type: MaterialType | None = None
    ) -> list[Material]:
        """자재 목록 조회 실행.

        Args:
            material_type: 자재 유형 (선택)

        Returns:
            자재 목록
        """
        if material_type:
            return await self._repository.get_by_type(material_type)
        return await self._repository.get_all()


class UpdateMaterialUseCase:
    """자재 수정 유스케이스."""

    def __init__(self, repository: MaterialRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, dto: UpdateMaterialDTO) -> Material:
        """자재 수정 실행.

        Args:
            dto: 자재 수정 DTO

        Returns:
            수정된 자재 엔티티

        Raises:
            MaterialNotFoundError: 자재를 찾을 수 없는 경우
        """
        existing = await self._repository.get_by_id(dto.material_id)
        if not existing:
            raise MaterialNotFoundError(f"자재 '{dto.material_id}'를 찾을 수 없습니다.")

        # 수정 가능한 필드 업데이트
        from backend.domain.entities.material import Material

        updated = Material(
            material_id=existing.material_id,
            material_name=dto.material_name or existing.material_name,
            material_type=(
                MaterialType(dto.material_type)
                if dto.material_type
                else existing.material_type
            ),
            unit=MaterialUnit(dto.unit) if dto.unit else existing.unit,
            unit_price=dto.unit_price or existing.unit_price,
            effective_date=dto.effective_date or existing.effective_date,
            scrap_rate=dto.scrap_rate
            if dto.scrap_rate is not None
            else existing.scrap_rate,
            supplier=dto.supplier if dto.supplier is not None else existing.supplier,
            specification=(
                dto.specification
                if dto.specification is not None
                else existing.specification
            ),
        )

        return await self._repository.update(updated)


class DeleteMaterialUseCase:
    """자재 삭제 유스케이스."""

    def __init__(self, repository: MaterialRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, material_id: str) -> bool:
        """자재 삭제 실행.

        Args:
            material_id: 자재 ID

        Returns:
            삭제 성공 여부
        """
        return await self._repository.delete(material_id)
