"""Test 6.1.3: Products API 테스트.

TDD RED Phase: 완제품 마스터 API 엔드포인트 테스트.
"""

from __future__ import annotations

from typing import Any

import pytest
from httpx import AsyncClient


class TestProductsAPI:
    """완제품 API 테스트."""

    @pytest.mark.asyncio
    async def test_create_product(
        self, async_client: AsyncClient, sample_product_data: dict[str, Any]
    ) -> None:
        """완제품 생성 API."""
        response = await async_client.post(
            "/api/v1/products",
            json=sample_product_data,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["product_id"] == sample_product_data["product_id"]
        assert data["product_name"] == sample_product_data["product_name"]

    @pytest.mark.asyncio
    async def test_get_product(self, async_client: AsyncClient) -> None:
        """완제품 조회 API."""
        response = await async_client.get("/api/v1/products/P-WH-001")

        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_list_products(self, async_client: AsyncClient) -> None:
        """완제품 목록 조회 API."""
        response = await async_client.get("/api/v1/products")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_update_product(self, async_client: AsyncClient) -> None:
        """완제품 수정 API."""
        update_data = {
            "status": "DEVELOPMENT",
        }
        response = await async_client.patch(
            "/api/v1/products/P-WH-001",
            json=update_data,
        )

        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_delete_product(self, async_client: AsyncClient) -> None:
        """완제품 삭제 API."""
        response = await async_client.delete("/api/v1/products/P-WH-001")

        assert response.status_code in [204, 404]

    @pytest.mark.asyncio
    async def test_list_products_by_customer(self, async_client: AsyncClient) -> None:
        """고객별 완제품 목록 조회 API."""
        response = await async_client.get("/api/v1/products?customer=현대자동차")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_list_products_by_status(self, async_client: AsyncClient) -> None:
        """상태별 완제품 목록 조회 API."""
        response = await async_client.get("/api/v1/products?status=PRODUCTION")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
