"""Product Use Cases.

완제품 마스터 CRUD 유스케이스.
"""

from __future__ import annotations

from backend.application.dtos.product_dto import CreateProductDTO, UpdateProductDTO
from backend.domain.entities.product import Product, ProductStatus
from backend.domain.repositories.product_repository import ProductRepository


class ProductAlreadyExistsError(Exception):
    """완제품이 이미 존재하는 경우."""

    pass


class ProductNotFoundError(Exception):
    """완제품을 찾을 수 없는 경우."""

    pass


class CreateProductUseCase:
    """완제품 생성 유스케이스."""

    def __init__(self, repository: ProductRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, dto: CreateProductDTO) -> Product:
        """완제품 생성 실행.

        Args:
            dto: 완제품 생성 DTO

        Returns:
            생성된 완제품 엔티티

        Raises:
            ProductAlreadyExistsError: 이미 존재하는 완제품인 경우
        """
        existing = await self._repository.get_by_id(dto.product_id)
        if existing:
            raise ProductAlreadyExistsError(
                f"완제품 '{dto.product_id}'가 이미 존재합니다."
            )

        product = Product(
            product_id=dto.product_id,
            product_name=dto.product_name,
            status=ProductStatus(dto.status),
            customer=dto.customer,
            car_model=dto.car_model,
            description=dto.description,
        )

        return await self._repository.create(product)


class GetProductUseCase:
    """완제품 조회 유스케이스."""

    def __init__(self, repository: ProductRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, product_id: str) -> Product | None:
        """완제품 조회 실행.

        Args:
            product_id: 완제품 ID

        Returns:
            완제품 엔티티 또는 None
        """
        return await self._repository.get_by_id(product_id)


class ListProductsUseCase:
    """완제품 목록 조회 유스케이스."""

    def __init__(self, repository: ProductRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, status: ProductStatus | None = None) -> list[Product]:
        """완제품 목록 조회 실행.

        Args:
            status: 제품 상태 (선택)

        Returns:
            완제품 목록
        """
        if status:
            return await self._repository.get_by_status(status)
        return await self._repository.get_all()


class UpdateProductUseCase:
    """완제품 수정 유스케이스."""

    def __init__(self, repository: ProductRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, dto: UpdateProductDTO) -> Product:
        """완제품 수정 실행.

        Args:
            dto: 완제품 수정 DTO

        Returns:
            수정된 완제품 엔티티

        Raises:
            ProductNotFoundError: 완제품을 찾을 수 없는 경우
        """
        existing = await self._repository.get_by_id(dto.product_id)
        if not existing:
            raise ProductNotFoundError(f"완제품 '{dto.product_id}'를 찾을 수 없습니다.")

        updated = Product(
            product_id=existing.product_id,
            product_name=dto.product_name or existing.product_name,
            status=ProductStatus(dto.status) if dto.status else existing.status,
            customer=dto.customer if dto.customer is not None else existing.customer,
            car_model=(
                dto.car_model if dto.car_model is not None else existing.car_model
            ),
            description=(
                dto.description if dto.description is not None else existing.description
            ),
        )

        return await self._repository.update(updated)


class DeleteProductUseCase:
    """완제품 삭제 유스케이스."""

    def __init__(self, repository: ProductRepository) -> None:
        """초기화."""
        self._repository = repository

    async def execute(self, product_id: str) -> bool:
        """완제품 삭제 실행.

        Args:
            product_id: 완제품 ID

        Returns:
            삭제 성공 여부
        """
        return await self._repository.delete(product_id)
