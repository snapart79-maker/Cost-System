"""Test 6.1.2: Processes API 테스트.

TDD RED Phase: 공정 마스터 API 엔드포인트 테스트.
"""

from __future__ import annotations

from typing import Any

import pytest
from httpx import AsyncClient


class TestProcessesAPI:
    """공정 API 테스트."""

    @pytest.mark.asyncio
    async def test_create_process(
        self, async_client: AsyncClient, sample_process_data: dict[str, Any]
    ) -> None:
        """공정 생성 API."""
        response = await async_client.post(
            "/api/v1/processes",
            json=sample_process_data,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["process_id"] == sample_process_data["process_id"]
        assert data["process_name"] == sample_process_data["process_name"]

    @pytest.mark.asyncio
    async def test_get_process(self, async_client: AsyncClient) -> None:
        """공정 조회 API."""
        response = await async_client.get("/api/v1/processes/P-001")

        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_list_processes(self, async_client: AsyncClient) -> None:
        """공정 목록 조회 API."""
        response = await async_client.get("/api/v1/processes")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_update_process(self, async_client: AsyncClient) -> None:
        """공정 수정 API."""
        update_data = {
            "labor_rate": "26000.00",
        }
        response = await async_client.patch(
            "/api/v1/processes/P-001",
            json=update_data,
        )

        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_delete_process(self, async_client: AsyncClient) -> None:
        """공정 삭제 API."""
        response = await async_client.delete("/api/v1/processes/P-001")

        assert response.status_code in [204, 404]

    @pytest.mark.asyncio
    async def test_list_processes_by_work_type(
        self, async_client: AsyncClient
    ) -> None:
        """작업 유형별 공정 목록 조회 API."""
        response = await async_client.get("/api/v1/processes?work_type=IN_HOUSE")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
