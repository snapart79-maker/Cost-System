"""Repository 통합 테스트 fixtures."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from datetime import date
from decimal import Decimal

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from backend.infrastructure.persistence.models.base import Base


@pytest_asyncio.fixture
async def db_engine():
    """테스트용 인메모리 SQLite 엔진."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """테스트용 DB 세션."""
    async_session = async_sessionmaker(
        db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session() as session:
        yield session


@pytest.fixture
def sample_material_data():
    """샘플 자재 데이터."""
    return {
        "material_id": "W-001",
        "material_name": "AVS 0.5sq",
        "material_type": "WIRE",
        "unit": "MTR",
        "unit_price": Decimal("15.5000"),
        "effective_date": date(2025, 1, 1),
        "scrap_rate": Decimal("0.05"),
    }


@pytest.fixture
def sample_process_data():
    """샘플 공정 데이터."""
    return {
        "process_id": "P-001",
        "process_name": "절압착",
        "work_type": "IN_HOUSE",
        "labor_rate": Decimal("25000.00"),
        "machine_cost": Decimal("5000.00"),
        "efficiency": Decimal("100.00"),
    }


@pytest.fixture
def sample_product_data():
    """샘플 완제품 데이터."""
    return {
        "product_id": "PROD-001",
        "product_name": "Engine Room Harness",
        "customer": "현대자동차",
        "car_model": "아반떼 CN7",
        "status": "PRODUCTION",
    }
