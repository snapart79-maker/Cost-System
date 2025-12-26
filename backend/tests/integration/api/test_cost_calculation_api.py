"""Test 6.1.7: Cost Calculation API 테스트.

TDD RED Phase: 원가 계산 API 엔드포인트 테스트.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestCostCalculationAPI:
    """원가 계산 API 테스트."""

    @pytest.mark.asyncio
    async def test_calculate_cost(self, async_client: AsyncClient) -> None:
        """원가 계산 API."""
        request_data = {
            "product_id": "P-WH-001",
            "processes": [
                {
                    "process_id": "P-001",
                    "cycle_time": "10.00",
                    "workers": "1",
                },
            ],
        }
        response = await async_client.post(
            "/api/v1/cost-calculation/calculate",
            json=request_data,
        )

        assert response.status_code == 200
        data = response.json()
        assert "product_id" in data
        assert "manufacturing_cost" in data
        assert "purchase_cost" in data

    @pytest.mark.asyncio
    async def test_generate_cost_report(self, async_client: AsyncClient) -> None:
        """원가 계산서 생성 API."""
        response = await async_client.get(
            "/api/v1/cost-calculation/report/P-WH-001"
        )

        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_compare_cost_versions(self, async_client: AsyncClient) -> None:
        """원가 버전 비교 API."""
        request_data = {
            "product_id": "P-WH-001",
            "price_changes": [
                {
                    "material_id": "W-001",
                    "new_price": "16.5000",
                },
            ],
        }
        response = await async_client.post(
            "/api/v1/cost-calculation/compare",
            json=request_data,
        )

        assert response.status_code == 200
        data = response.json()
        assert "current_cost" in data
        assert "new_cost" in data
        assert "difference" in data
        assert "change_rate" in data

    @pytest.mark.asyncio
    async def test_calculate_cost_with_empty_product(
        self, async_client: AsyncClient
    ) -> None:
        """존재하지 않는 완제품 원가 계산."""
        request_data = {
            "product_id": "NONEXISTENT",
            "processes": [],
        }
        response = await async_client.post(
            "/api/v1/cost-calculation/calculate",
            json=request_data,
        )

        # BOM이 없으면 빈 결과 반환
        assert response.status_code == 200
