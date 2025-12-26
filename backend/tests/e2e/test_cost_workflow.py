"""E2E Test: 원가 계산 워크플로우 테스트.

전체 비즈니스 흐름을 테스트합니다:
1. 자재/공정/완제품 등록
2. BOM 생성
3. 원가 계산
4. 단가 변경 등록
5. 정산 금액 계산
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from decimal import Decimal

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from backend.infrastructure.persistence.models.base import Base
from backend.main import app
from backend.presentation.api.dependencies import get_session


# 테스트용 인메모리 SQLite
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionFactory = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
    """테스트용 세션 오버라이드."""
    async with TestSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@pytest_asyncio.fixture(autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    """테스트 전 데이터베이스 테이블 생성."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """테스트용 HTTP 클라이언트."""
    app.dependency_overrides[get_session] = override_get_session

    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport, base_url="http://test", follow_redirects=True
    ) as client:
        yield client

    app.dependency_overrides.clear()


class TestCostCalculationWorkflow:
    """원가 계산 전체 워크플로우 E2E 테스트."""

    @pytest.mark.asyncio
    async def test_complete_cost_calculation_workflow(
        self, async_client: AsyncClient
    ) -> None:
        """전체 원가 계산 워크플로우 테스트.

        1. 자재 등록
        2. 공정 등록
        3. 완제품 등록
        4. BOM 생성
        5. 원가 계산
        """
        # Step 1: 자재 등록
        material_data = {
            "material_id": "W-001",
            "material_name": "AVS 0.5sq",
            "material_type": "WIRE",
            "unit": "MTR",
            "unit_price": "15.5000",
            "effective_date": "2025-01-01",
            "scrap_rate": "0.05",
        }
        response = await async_client.post("/api/v1/materials", json=material_data)
        assert response.status_code == 201
        assert response.json()["material_id"] == "W-001"

        # Step 2: 공정 등록
        process_data = {
            "process_id": "PR-001",
            "process_name": "절압착",
            "work_type": "IN_HOUSE",
            "labor_rate": "25000.00",
            "machine_cost": "5000.00",
            "efficiency": "100.00",
        }
        response = await async_client.post("/api/v1/processes", json=process_data)
        assert response.status_code == 201
        assert response.json()["process_id"] == "PR-001"

        # Step 3: 완제품 등록
        product_data = {
            "product_id": "P-WH-001",
            "product_name": "메인 와이어 하네스",
            "status": "PRODUCTION",
            "customer": "현대자동차",
            "car_model": "아반떼 CN7",
        }
        response = await async_client.post("/api/v1/products", json=product_data)
        assert response.status_code == 201
        assert response.json()["product_id"] == "P-WH-001"

        # Step 4: BOM 생성
        bom_data = {
            "product_id": "P-WH-001",
            "version": "1.0",
            "items": [
                {
                    "material_id": "W-001",
                    "quantity": "10.00",
                    "work_type": "IN_HOUSE",
                    "sequence": 1,
                },
            ],
        }
        response = await async_client.post("/api/v1/bom", json=bom_data)
        assert response.status_code == 201
        assert response.json()["product_id"] == "P-WH-001"

        # Step 5: 원가 계산
        cost_request = {
            "product_id": "P-WH-001",
            "processes": [
                {
                    "process_id": "PR-001",
                    "cycle_time": "60.00",
                    "workers": 1,
                }
            ],
        }
        response = await async_client.post(
            "/api/v1/cost-calculation/calculate", json=cost_request
        )
        assert response.status_code == 200
        result = response.json()
        assert "gross_material_cost" in result
        assert "purchase_cost" in result
        assert "manufacturing_cost" in result

        # 자재 목록 조회
        response = await async_client.get("/api/v1/materials")
        assert response.status_code == 200
        materials = response.json()
        assert len(materials) >= 1


class TestPriceChangeWorkflow:
    """단가 변경 워크플로우 E2E 테스트."""

    @pytest.mark.asyncio
    async def test_price_change_and_settlement_workflow(
        self, async_client: AsyncClient
    ) -> None:
        """단가 변경 및 정산 워크플로우 테스트.

        1. 기초 데이터 등록
        2. 단가 변경 등록
        3. 변경 전후 비교
        """
        # Step 1: 기초 데이터 등록
        # 자재 등록
        await async_client.post(
            "/api/v1/materials",
            json={
                "material_id": "W-002",
                "material_name": "AVS 0.75sq",
                "material_type": "WIRE",
                "unit": "MTR",
                "unit_price": "18.0000",
                "effective_date": "2025-01-01",
            },
        )

        # 완제품 등록
        await async_client.post(
            "/api/v1/products",
            json={
                "product_id": "P-WH-002",
                "product_name": "서브 와이어 하네스",
                "status": "PRODUCTION",
            },
        )

        # BOM 생성
        await async_client.post(
            "/api/v1/bom",
            json={
                "product_id": "P-WH-002",
                "version": "1.0",
                "items": [
                    {
                        "material_id": "W-002",
                        "quantity": "5.00",
                        "work_type": "IN_HOUSE",
                        "sequence": 1,
                    },
                ],
            },
        )

        # Step 2: 단가 변경 등록
        price_change_data = {
            "product_id": "P-WH-002",
            "change_type": "MATERIAL",
            "change_reason": "원자재 가격 인상",
            "effective_date": "2025-02-01",
            "eco_number": "ECO-2025-001",
            "material_changes": [
                {
                    "material_id": "W-002",
                    "new_price": "20.0000",
                },
            ],
        }
        response = await async_client.post(
            "/api/v1/price-changes", json=price_change_data
        )
        assert response.status_code == 201
        change_result = response.json()
        assert "change_id" in change_result

        # Step 3: 단가 변경 목록 조회
        response = await async_client.get("/api/v1/price-changes")
        assert response.status_code == 200
        changes = response.json()
        assert len(changes) >= 1


class TestDataExportWorkflow:
    """데이터 Export 워크플로우 E2E 테스트."""

    @pytest.mark.asyncio
    async def test_excel_export_workflow(self, async_client: AsyncClient) -> None:
        """Excel Export 워크플로우 테스트."""
        # 자재 등록
        await async_client.post(
            "/api/v1/materials",
            json={
                "material_id": "W-003",
                "material_name": "Test Wire",
                "material_type": "WIRE",
                "unit": "MTR",
                "unit_price": "10.0000",
                "effective_date": "2025-01-01",
            },
        )

        # Excel Export
        response = await async_client.get("/api/v1/excel/export/materials")
        assert response.status_code == 200
        assert (
            response.headers["content-type"]
            == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    @pytest.mark.asyncio
    async def test_pdf_export_workflow(self, async_client: AsyncClient) -> None:
        """PDF Export 워크플로우 테스트."""
        # 자재 등록
        await async_client.post(
            "/api/v1/materials",
            json={
                "material_id": "W-004",
                "material_name": "Test Wire 2",
                "material_type": "WIRE",
                "unit": "MTR",
                "unit_price": "12.0000",
                "effective_date": "2025-01-01",
            },
        )

        # PDF Export
        response = await async_client.get("/api/v1/pdf/materials")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"


class TestAPIHealthCheck:
    """API 상태 확인 E2E 테스트."""

    @pytest.mark.asyncio
    async def test_api_root_endpoint(self, async_client: AsyncClient) -> None:
        """API 루트 엔드포인트 테스트."""
        response = await async_client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "running"

    @pytest.mark.asyncio
    async def test_api_docs_available(self, async_client: AsyncClient) -> None:
        """API 문서 접근 가능 테스트."""
        response = await async_client.get("/docs")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_openapi_json_available(self, async_client: AsyncClient) -> None:
        """OpenAPI JSON 접근 가능 테스트."""
        response = await async_client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "paths" in data
