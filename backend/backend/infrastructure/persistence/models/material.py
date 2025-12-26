"""Material ORM Model."""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import Date, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.persistence.models.base import Base, TimestampMixin


class MaterialModel(Base, TimestampMixin):
    """자재 ORM 모델."""

    __tablename__ = "materials"

    material_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    material_name: Mapped[str] = mapped_column(String(200), nullable=False)
    material_type: Mapped[str] = mapped_column(String(20), nullable=False)
    unit: Mapped[str] = mapped_column(String(10), nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(18, 4), nullable=False, default=Decimal("0")
    )
    effective_date: Mapped[date] = mapped_column(Date, nullable=False)
    scrap_rate: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)
    supplier: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    specification: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
