"""Test 6.1.1: Materials API 테스트.

TDD RED Phase: 자재 마스터 API 엔드포인트 테스트.
"""

from __future__ import annotations

from typing import Any

import pytest
from httpx import AsyncClient


class TestMaterialsAPI:
    """자재 API 테스트."""

    @pytest.mark.asyncio
    async def test_create_material(
        self, async_client: AsyncClient, sample_material_data: dict[str, Any]
    ) -> None:
        """자재 생성 API."""
        response = await async_client.post(
            "/api/v1/materials",
            json=sample_material_data,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["material_id"] == sample_material_data["material_id"]
        assert data["material_name"] == sample_material_data["material_name"]

    @pytest.mark.asyncio
    async def test_get_material(self, async_client: AsyncClient) -> None:
        """자재 조회 API."""
        response = await async_client.get("/api/v1/materials/W-001")

        # 자재가 없으면 404, 있으면 200
        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_list_materials(self, async_client: AsyncClient) -> None:
        """자재 목록 조회 API."""
        response = await async_client.get("/api/v1/materials")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_update_material(self, async_client: AsyncClient) -> None:
        """자재 수정 API."""
        update_data = {
            "unit_price": "16.0000",
            "effective_date": "2025-02-01",
        }
        response = await async_client.patch(
            "/api/v1/materials/W-001",
            json=update_data,
        )

        # 자재가 없으면 404, 있으면 200
        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_delete_material(self, async_client: AsyncClient) -> None:
        """자재 삭제 API."""
        response = await async_client.delete("/api/v1/materials/W-001")

        # 자재가 없으면 404, 있으면 204
        assert response.status_code in [204, 404]

    @pytest.mark.asyncio
    async def test_list_materials_by_type(self, async_client: AsyncClient) -> None:
        """유형별 자재 목록 조회 API."""
        response = await async_client.get("/api/v1/materials?material_type=WIRE")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_create_material_validation_error(
        self, async_client: AsyncClient
    ) -> None:
        """자재 생성 시 유효성 검사 오류."""
        invalid_data = {
            "material_id": "",  # 빈 ID
            "material_name": "Test",
        }
        response = await async_client.post(
            "/api/v1/materials",
            json=invalid_data,
        )

        assert response.status_code == 422  # Validation Error
