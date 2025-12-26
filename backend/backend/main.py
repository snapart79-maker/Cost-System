"""FastAPI Application Entry Point.

와이어 하네스 매입 단가 관리 시스템 백엔드 API.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.infrastructure.persistence import init_db
from backend.presentation.api.v1 import api_router


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """애플리케이션 생명주기 관리.

    시작 시: 데이터베이스 초기화
    종료 시: 리소스 정리
    """
    # Startup
    await init_db()
    yield
    # Shutdown (필요한 경우 정리 작업)


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="와이어 하네스 매입 단가 관리 시스템 - 단가 변경 사유 입력 시 자동 원가 재계산",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(api_router)


@app.get("/", tags=["Health"])
async def root() -> dict[str, str]:
    """루트 엔드포인트 - 서비스 정보."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
    }


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """헬스 체크 엔드포인트."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
