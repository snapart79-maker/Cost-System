"""Test 5.1.3: Product Use Cases 테스트.

TDD RED Phase: 완제품 마스터 CRUD Use Cases 테스트.
"""

from unittest.mock import AsyncMock

import pytest

from backend.domain.entities.product import Product, ProductStatus


class TestCreateProductUseCase:
    """완제품 생성 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock ProductRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_create_product_success(self, mock_repository: AsyncMock) -> None:
        """완제품 생성 성공."""
        from backend.application.use_cases.product_use_cases import (
            CreateProductUseCase,
        )
        from backend.application.dtos.product_dto import CreateProductDTO

        dto = CreateProductDTO(
            product_id="P-WH-001",
            product_name="메인 와이어 하네스",
            status="PRODUCTION",
            customer="현대자동차",
            car_model="아반떼 CN7",
        )

        expected = Product(
            product_id="P-WH-001",
            product_name="메인 와이어 하네스",
            status=ProductStatus.PRODUCTION,
            customer="현대자동차",
            car_model="아반떼 CN7",
        )
        mock_repository.create.return_value = expected
        mock_repository.get_by_id.return_value = None

        use_case = CreateProductUseCase(mock_repository)

        # Act
        result = await use_case.execute(dto)

        # Assert
        assert result.product_id == "P-WH-001"
        assert result.product_name == "메인 와이어 하네스"


class TestGetProductUseCase:
    """완제품 조회 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock ProductRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_get_product_by_id_success(
        self, mock_repository: AsyncMock
    ) -> None:
        """ID로 완제품 조회 성공."""
        from backend.application.use_cases.product_use_cases import GetProductUseCase

        expected = Product(
            product_id="P-WH-001",
            product_name="메인 와이어 하네스",
            status=ProductStatus.PRODUCTION,
        )
        mock_repository.get_by_id.return_value = expected

        use_case = GetProductUseCase(mock_repository)

        # Act
        result = await use_case.execute("P-WH-001")

        # Assert
        assert result is not None
        assert result.product_id == "P-WH-001"


class TestListProductsUseCase:
    """완제품 목록 조회 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock ProductRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_list_all_products(self, mock_repository: AsyncMock) -> None:
        """전체 완제품 목록 조회."""
        from backend.application.use_cases.product_use_cases import (
            ListProductsUseCase,
        )

        products = [
            Product(
                product_id="P-WH-001",
                product_name="메인 와이어 하네스",
                status=ProductStatus.PRODUCTION,
            ),
            Product(
                product_id="P-WH-002",
                product_name="서브 와이어 하네스",
                status=ProductStatus.DEVELOPMENT,
            ),
        ]
        mock_repository.get_all.return_value = products

        use_case = ListProductsUseCase(mock_repository)

        # Act
        result = await use_case.execute()

        # Assert
        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_list_products_by_status(self, mock_repository: AsyncMock) -> None:
        """상태별 완제품 목록 조회."""
        from backend.application.use_cases.product_use_cases import (
            ListProductsUseCase,
        )

        production = [
            Product(
                product_id="P-WH-001",
                product_name="메인 와이어 하네스",
                status=ProductStatus.PRODUCTION,
            ),
        ]
        mock_repository.get_by_status.return_value = production

        use_case = ListProductsUseCase(mock_repository)

        # Act
        result = await use_case.execute(status=ProductStatus.PRODUCTION)

        # Assert
        assert len(result) == 1
        assert result[0].status == ProductStatus.PRODUCTION


class TestUpdateProductUseCase:
    """완제품 수정 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock ProductRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_update_product_status_success(
        self, mock_repository: AsyncMock
    ) -> None:
        """완제품 상태 변경 성공."""
        from backend.application.use_cases.product_use_cases import (
            UpdateProductUseCase,
        )
        from backend.application.dtos.product_dto import UpdateProductDTO

        existing = Product(
            product_id="P-WH-001",
            product_name="메인 와이어 하네스",
            status=ProductStatus.DEVELOPMENT,
        )
        mock_repository.get_by_id.return_value = existing

        updated = Product(
            product_id="P-WH-001",
            product_name="메인 와이어 하네스",
            status=ProductStatus.PRODUCTION,
        )
        mock_repository.update.return_value = updated

        dto = UpdateProductDTO(
            product_id="P-WH-001",
            status="PRODUCTION",
        )

        use_case = UpdateProductUseCase(mock_repository)

        # Act
        result = await use_case.execute(dto)

        # Assert
        assert result.status == ProductStatus.PRODUCTION


class TestDeleteProductUseCase:
    """완제품 삭제 Use Case 테스트."""

    @pytest.fixture
    def mock_repository(self) -> AsyncMock:
        """Mock ProductRepository."""
        return AsyncMock()

    @pytest.mark.asyncio
    async def test_delete_product_success(self, mock_repository: AsyncMock) -> None:
        """완제품 삭제 성공."""
        from backend.application.use_cases.product_use_cases import (
            DeleteProductUseCase,
        )

        mock_repository.delete.return_value = True

        use_case = DeleteProductUseCase(mock_repository)

        # Act
        result = await use_case.execute("P-WH-001")

        # Assert
        assert result is True
