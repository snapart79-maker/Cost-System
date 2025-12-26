"""Pytest Configuration and Fixtures.

테스트 인프라 설정 및 공통 픽스처.
"""

import asyncio
from collections.abc import AsyncGenerator, Generator

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# 테스트용 인메모리 데이터베이스 URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """세션 범위의 이벤트 루프 생성.

    pytest-asyncio의 기본 이벤트 루프를 세션 범위로 확장합니다.
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def test_engine():
    """테스트용 SQLAlchemy 엔진.

    인메모리 SQLite 데이터베이스를 사용합니다.
    """
    from backend.infrastructure.persistence.models import Base

    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        future=True,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """테스트용 데이터베이스 세션.

    각 테스트마다 새로운 세션을 생성하고,
    테스트 후 롤백하여 데이터 격리를 보장합니다.
    """
    session_factory = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    async with session_factory() as session:
        yield session
        await session.rollback()
