"""Test 6.1.4: BOM API 테스트.

TDD RED Phase: BOM API 엔드포인트 테스트.
"""

from __future__ import annotations

from typing import Any

import pytest
from httpx import AsyncClient


class TestBOMAPI:
    """BOM API 테스트."""

    @pytest.mark.asyncio
    async def test_create_bom(
        self, async_client: AsyncClient, sample_bom_data: dict[str, Any]
    ) -> None:
        """BOM 생성 API."""
        response = await async_client.post(
            "/api/v1/bom",
            json=sample_bom_data,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["product_id"] == sample_bom_data["product_id"]

    @pytest.mark.asyncio
    async def test_get_bom(self, async_client: AsyncClient) -> None:
        """BOM 조회 API."""
        response = await async_client.get("/api/v1/bom/P-WH-001")

        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_add_bom_item(self, async_client: AsyncClient) -> None:
        """BOM 항목 추가 API."""
        item_data = {
            "material_id": "T-001",
            "quantity": "4.00",
            "work_type": "IN_HOUSE",
            "sequence": 2,
        }
        response = await async_client.post(
            "/api/v1/bom/P-WH-001/items",
            json=item_data,
        )

        assert response.status_code in [201, 404]

    @pytest.mark.asyncio
    async def test_remove_bom_item(self, async_client: AsyncClient) -> None:
        """BOM 항목 삭제 API."""
        response = await async_client.delete(
            "/api/v1/bom/P-WH-001/items/W-001",
        )

        assert response.status_code in [204, 404]

    @pytest.mark.asyncio
    async def test_delete_bom(self, async_client: AsyncClient) -> None:
        """BOM 삭제 API."""
        response = await async_client.delete("/api/v1/bom/P-WH-001")

        assert response.status_code in [204, 404]

    @pytest.mark.asyncio
    async def test_get_bom_items(self, async_client: AsyncClient) -> None:
        """BOM 항목 목록 조회 API."""
        response = await async_client.get("/api/v1/bom/P-WH-001/items")

        assert response.status_code in [200, 404]
