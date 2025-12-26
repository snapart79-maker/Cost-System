"""Product ORM Model."""

from __future__ import annotations

from typing import Optional

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from backend.infrastructure.persistence.models.base import Base, TimestampMixin


class ProductModel(Base, TimestampMixin):
    """완제품 ORM 모델."""

    __tablename__ = "products"

    product_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    customer: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    car_model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="PRODUCTION"
    )
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
