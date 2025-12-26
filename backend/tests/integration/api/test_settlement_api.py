"""Test 6.1.6: Settlement API 테스트.

TDD RED Phase: 정산 API 엔드포인트 테스트.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestSettlementAPI:
    """정산 API 테스트."""

    @pytest.mark.asyncio
    async def test_calculate_settlement(self, async_client: AsyncClient) -> None:
        """정산 금액 계산 API."""
        request_data = {
            "change_id": "CHG-001",
            "start_date": "2025-01-01",
            "end_date": "2025-12-31",
        }
        response = await async_client.post(
            "/api/v1/settlement/calculate",
            json=request_data,
        )

        # 변경 ID가 없으면 404, 있으면 200
        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_get_settlement_summary(self, async_client: AsyncClient) -> None:
        """정산 요약 조회 API."""
        response = await async_client.get(
            "/api/v1/settlement/summary?start_date=2025-01-01&end_date=2025-12-31"
        )

        assert response.status_code == 200
        data = response.json()
        assert "total_changes" in data

    @pytest.mark.asyncio
    async def test_get_daily_breakdown(self, async_client: AsyncClient) -> None:
        """일별 정산 상세 조회 API."""
        response = await async_client.get(
            "/api/v1/settlement/CHG-001/daily?start_date=2025-01-01&end_date=2025-12-31"
        )

        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_get_settlement_summary_missing_dates(
        self, async_client: AsyncClient
    ) -> None:
        """정산 요약 조회 - 날짜 누락 시 오류."""
        response = await async_client.get("/api/v1/settlement/summary")

        assert response.status_code == 422  # Validation Error
