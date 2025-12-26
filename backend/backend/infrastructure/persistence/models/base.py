"""SQLAlchemy Base Model.

모든 ORM 모델의 기본 클래스.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """SQLAlchemy 선언적 기본 클래스.

    모든 ORM 모델은 이 클래스를 상속합니다.
    """

    pass


class TimestampMixin:
    """생성/수정 시간 자동 기록 믹스인.

    Attributes:
        created_at: 생성 시간 (자동 설정)
        updated_at: 수정 시간 (자동 갱신)
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
