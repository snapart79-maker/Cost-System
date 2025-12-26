"""Excel Pydantic Schemas.

Excel Import/Export API 요청/응답 스키마.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class ExcelImportError(BaseModel):
    """Import 오류 정보."""

    row: int = Field(..., description="오류 발생 행")
    column: str | None = Field(None, description="오류 발생 열")
    message: str = Field(..., description="오류 메시지")


class ExcelImportResponse(BaseModel):
    """Excel Import 응답 스키마."""

    success: bool = Field(..., description="Import 성공 여부")
    total_rows: int = Field(..., ge=0, description="전체 행 수")
    imported_count: int = Field(..., ge=0, description="Import 성공 건수")
    error_count: int = Field(..., ge=0, description="오류 건수")
    errors: list[ExcelImportError] = Field(default_factory=list, description="오류 목록")
