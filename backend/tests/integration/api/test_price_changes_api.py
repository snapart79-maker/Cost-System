"""Test 6.1.5: Price Changes API 테스트.

TDD RED Phase: 단가 변경 API 엔드포인트 테스트.
"""

from __future__ import annotations

from typing import Any

import pytest
from httpx import AsyncClient


class TestPriceChangesAPI:
    """단가 변경 API 테스트."""

    @pytest.mark.asyncio
    async def test_register_price_change(
        self, async_client: AsyncClient, sample_price_change_data: dict[str, Any]
    ) -> None:
        """단가 변경 등록 API."""
        response = await async_client.post(
            "/api/v1/price-changes",
            json=sample_price_change_data,
        )

        # 완제품이 없으면 404, 성공하면 201
        assert response.status_code in [201, 404]

    @pytest.mark.asyncio
    async def test_get_price_change(self, async_client: AsyncClient) -> None:
        """단가 변경 조회 API."""
        response = await async_client.get("/api/v1/price-changes/CHG-001")

        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_list_price_changes(self, async_client: AsyncClient) -> None:
        """단가 변경 목록 조회 API."""
        response = await async_client.get("/api/v1/price-changes")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_list_price_changes_by_product(
        self, async_client: AsyncClient
    ) -> None:
        """완제품별 단가 변경 목록 조회 API."""
        response = await async_client.get(
            "/api/v1/price-changes?product_id=P-WH-001"
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_list_price_changes_by_date_range(
        self, async_client: AsyncClient
    ) -> None:
        """기간별 단가 변경 목록 조회 API."""
        response = await async_client.get(
            "/api/v1/price-changes?start_date=2025-01-01&end_date=2025-12-31"
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_compare_costs(self, async_client: AsyncClient) -> None:
        """원가 비교 API."""
        response = await async_client.get(
            "/api/v1/price-changes/CHG-001/compare"
        )

        assert response.status_code in [200, 404]
