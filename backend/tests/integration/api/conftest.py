"""API Test Fixtures.

httpx AsyncClient를 사용한 API 테스트 픽스처.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from backend.infrastructure.persistence.models.base import Base
from backend.main import app
from backend.presentation.api.dependencies import get_session


# 테스트용 인메모리 SQLite
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# 테스트용 엔진 및 세션
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
    # 세션 의존성 오버라이드
    app.dependency_overrides[get_session] = override_get_session

    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport, base_url="http://test", follow_redirects=True
    ) as client:
        yield client

    # 오버라이드 제거
    app.dependency_overrides.clear()


@pytest.fixture
def sample_material_data() -> dict[str, Any]:
    """샘플 자재 데이터."""
    return {
        "material_id": "W-001",
        "material_name": "AVS 0.5sq",
        "material_type": "WIRE",
        "unit": "MTR",
        "unit_price": "15.5000",
        "effective_date": "2025-01-01",
        "specification": "0.5sq 흑색",
        "scrap_rate": "0.05",
    }


@pytest.fixture
def sample_process_data() -> dict[str, Any]:
    """샘플 공정 데이터."""
    return {
        "process_id": "P-001",
        "process_name": "절압착",
        "work_type": "IN_HOUSE",
        "labor_rate": "25000.00",
        "machine_cost": "5000.00",
        "efficiency": "100.00",
    }


@pytest.fixture
def sample_product_data() -> dict[str, Any]:
    """샘플 완제품 데이터."""
    return {
        "product_id": "P-WH-001",
        "product_name": "메인 와이어 하네스",
        "status": "PRODUCTION",
        "customer": "현대자동차",
        "car_model": "아반떼 CN7",
    }


@pytest.fixture
def sample_bom_data() -> dict[str, Any]:
    """샘플 BOM 데이터."""
    return {
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


@pytest.fixture
def sample_price_change_data() -> dict[str, Any]:
    """샘플 단가 변경 데이터."""
    return {
        "product_id": "P-WH-001",
        "change_type": "MATERIAL",
        "change_reason": "원자재 가격 인상",
        "effective_date": "2025-02-01",
        "eco_number": "ECO-2025-001",
        "material_changes": [
            {
                "material_id": "W-001",
                "new_price": "16.5000",
            },
        ],
    }
