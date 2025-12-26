"""Test 2.3: Product 엔티티 테스트.

TDD RED Phase: 완제품 마스터 엔티티 테스트.
PRD 4.1.3 완제품 마스터 기반.
"""

import pytest


class TestProductEntity:
    """Product 엔티티 테스트."""

    def test_create_product_success(self):
        """완제품 생성 성공 테스트."""
        from backend.domain.entities.product import Product, ProductStatus

        product = Product(
            product_id="P-WH-001",
            product_name="메인 와이어 하네스",
            status=ProductStatus.PRODUCTION,
            customer="현대자동차",
            car_model="아반떼 CN7",
        )

        assert product.product_id == "P-WH-001"
        assert product.product_name == "메인 와이어 하네스"
        assert product.status == ProductStatus.PRODUCTION
        assert product.customer == "현대자동차"
        assert product.car_model == "아반떼 CN7"

    def test_create_product_without_optional_fields(self):
        """선택 필드 없이 완제품 생성."""
        from backend.domain.entities.product import Product, ProductStatus

        product = Product(
            product_id="P-WH-001",
            product_name="메인 와이어 하네스",
            status=ProductStatus.PRODUCTION,
        )

        assert product.customer is None
        assert product.car_model is None

    def test_create_product_missing_id_raises_error(self):
        """완제품 품번 누락 시 ValueError."""
        from backend.domain.entities.product import Product, ProductStatus

        with pytest.raises(ValueError, match="완제품 품번은 필수"):
            Product(
                product_id="",
                product_name="메인 와이어 하네스",
                status=ProductStatus.PRODUCTION,
            )

    def test_create_product_missing_name_raises_error(self):
        """품명 누락 시 ValueError."""
        from backend.domain.entities.product import Product, ProductStatus

        with pytest.raises(ValueError, match="품명은 필수"):
            Product(
                product_id="P-WH-001",
                product_name="",
                status=ProductStatus.PRODUCTION,
            )


class TestProductStatus:
    """ProductStatus Enum 테스트."""

    def test_product_statuses(self):
        """제품 상태 Enum 값 확인."""
        from backend.domain.entities.product import ProductStatus

        assert ProductStatus.PRODUCTION.value == "PRODUCTION"
        assert ProductStatus.DEVELOPMENT.value == "DEVELOPMENT"
        assert ProductStatus.DISCONTINUED.value == "DISCONTINUED"


class TestProductStatusChange:
    """Product 상태 변경 테스트."""

    def test_change_status_to_discontinued(self):
        """양산 → 단종 상태 변경."""
        from backend.domain.entities.product import Product, ProductStatus

        product = Product(
            product_id="P-WH-001",
            product_name="메인 와이어 하네스",
            status=ProductStatus.PRODUCTION,
        )

        product.change_status(ProductStatus.DISCONTINUED)

        assert product.status == ProductStatus.DISCONTINUED

    def test_change_status_development_to_production(self):
        """개발 → 양산 상태 변경."""
        from backend.domain.entities.product import Product, ProductStatus

        product = Product(
            product_id="P-WH-001",
            product_name="메인 와이어 하네스",
            status=ProductStatus.DEVELOPMENT,
        )

        product.change_status(ProductStatus.PRODUCTION)

        assert product.status == ProductStatus.PRODUCTION
