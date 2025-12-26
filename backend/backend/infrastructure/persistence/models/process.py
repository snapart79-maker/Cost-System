"""Process ORM Model."""

from __future__ import annotations

from decimal import Decimal
from typing import Optional

from sqlalchemy import Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.persistence.models.base import Base, TimestampMixin


class ProcessModel(Base, TimestampMixin):
    """공정 ORM 모델."""

    __tablename__ = "processes"

    process_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    process_name: Mapped[str] = mapped_column(String(200), nullable=False)
    work_type: Mapped[str] = mapped_column(String(20), nullable=False)
    labor_rate: Mapped[Decimal] = mapped_column(
        Numeric(18, 2), nullable=False, default=Decimal("0")
    )
    machine_cost: Mapped[Decimal] = mapped_column(
        Numeric(18, 2), nullable=False, default=Decimal("0")
    )
    efficiency: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
