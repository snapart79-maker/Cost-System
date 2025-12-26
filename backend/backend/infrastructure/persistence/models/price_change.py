"""PriceChange ORM Model."""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import Date, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.persistence.models.base import Base, TimestampMixin


class PriceChangeModel(Base, TimestampMixin):
    """단가 변경 ORM 모델."""

    __tablename__ = "price_changes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    change_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    product_id: Mapped[str] = mapped_column(String(50), nullable=False)
    change_type: Mapped[str] = mapped_column(String(20), nullable=False)
    change_reason: Mapped[str] = mapped_column(String(500), nullable=False)
    effective_date: Mapped[date] = mapped_column(Date, nullable=False)
    before_cost: Mapped[Decimal] = mapped_column(
        Numeric(18, 2), nullable=False, default=Decimal("0")
    )
    after_cost: Mapped[Decimal] = mapped_column(
        Numeric(18, 2), nullable=False, default=Decimal("0")
    )
    material_changes_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    process_changes_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
