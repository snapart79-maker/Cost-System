"""Database Connection.

SQLAlchemy 비동기 엔진 및 세션 관리.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from backend.config import settings
from backend.infrastructure.persistence.models import Base

# 데이터베이스 디렉토리 생성
_db_path = settings.database_path
_db_path.parent.mkdir(parents=True, exist_ok=True)

# 비동기 엔진 생성
engine: AsyncEngine = create_async_engine(
    settings.database_url,
    echo=settings.database_echo,
    future=True,
)

# 비동기 세션 팩토리
AsyncSessionFactory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def init_db() -> None:
    """데이터베이스 테이블 초기화.

    모든 모델의 테이블을 생성합니다.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """비동기 세션 의존성 주입.

    FastAPI Depends에서 사용:
        async def endpoint(session: AsyncSession = Depends(get_async_session)):
            ...

    Yields:
        AsyncSession: 데이터베이스 세션
    """
    async with AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@asynccontextmanager
async def get_session_context() -> AsyncGenerator[AsyncSession, None]:
    """컨텍스트 매니저용 세션.

    Use Case 등에서 직접 사용:
        async with get_session_context() as session:
            ...

    Yields:
        AsyncSession: 데이터베이스 세션
    """
    async with AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
