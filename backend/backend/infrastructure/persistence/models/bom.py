"""BOM ORM Model."""

from __future__ import annotations

from decimal import Decimal
from typing import Optional

from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.infrastructure.persistence.models.base import Base, TimestampMixin


class BOMModel(Base, TimestampMixin):
    """BOM ORM 모델."""

    __tablename__ = "boms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    version: Mapped[str] = mapped_column(String(20), nullable=False, default="1.0")

    items: Mapped[list[BOMItemModel]] = relationship(
        "BOMItemModel",
        back_populates="bom",
        cascade="all, delete-orphan",
    )


class BOMItemModel(Base, TimestampMixin):
    """BOM 항목 ORM 모델."""

    __tablename__ = "bom_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    bom_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("boms.id", ondelete="CASCADE"), nullable=False
    )
    product_id: Mapped[str] = mapped_column(String(50), nullable=False)
    material_id: Mapped[str] = mapped_column(String(50), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(
        Numeric(18, 4), nullable=False, default=Decimal("0")
    )
    work_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="IN_HOUSE"
    )
    sequence: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    bom: Mapped[BOMModel] = relationship("BOMModel", back_populates="items")
