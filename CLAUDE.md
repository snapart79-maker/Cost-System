# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Wire Harness Purchase Price Management System (WH-PMS-2025)**

와이어 하네스 매입 단가 관리 시스템 - 단가 변경 사유 입력 시 자동 원가 재계산 및 정산 금액 산출

### Key Documents
- PRD: `와이어하네스_매입단가관리시스템_PRD_v1.0.docx`
- Implementation Plan: `docs/plans/backend-implementation-plan.md`

## Build & Development Commands

```bash
# Setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -e ".[dev]"

# Run tests
pytest -v
pytest --cov=backend --cov-report=html

# Code quality
ruff check .
ruff format .
mypy backend/

# Run server
uvicorn backend.main:app --reload
```

## Architecture

**Clean Architecture** with the following layers:

```
backend/
├── domain/           # Core business logic (no external dependencies)
│   ├── entities/     # Business entities
│   ├── services/     # Domain services (cost calculation)
│   ├── repositories/ # Repository interfaces (ABC)
│   └── value_objects/
├── application/      # Use cases layer
│   ├── use_cases/    # Business use cases
│   └── dtos/         # Data transfer objects
├── infrastructure/   # External implementations
│   ├── persistence/  # SQLAlchemy (models, repositories)
│   ├── excel/        # Excel import/export
│   └── pdf/          # PDF generation
├── presentation/     # API layer
│   ├── api/v1/       # FastAPI routers
│   └── schemas/      # Pydantic schemas
└── config/           # Configuration
```

### Dependency Rule
- Domain layer has NO external dependencies
- Dependencies flow inward: Presentation → Application → Domain ← Infrastructure

## Project-Specific Patterns

### Cost Calculation
```
구매원가 = 제조원가 + 재료관리비 + 일반관리비 + 불량비 + 이윤
제조원가 = 재료비 + 노무비 + 경비
```

### Key Entities
- **Material**: 자재 마스터 (전선, 터미널, 커넥터 등)
- **Process**: 공정 마스터 (절압착, 테이핑 등)
- **Product**: 완제품 마스터
- **BOM**: Bill of Materials
- **PriceChange**: 단가 변경 이력

### Decimal Precision
- 단가: 소수점 4자리 (`Decimal("0.0001")`)
- 금액: 소수점 2자리 (`Decimal("0.01")`)

### API Versioning
- All endpoints under `/api/v1/`

## Implementation Status

**Backend**: ✅ Complete (Phase 1-9)
- 235 tests passing
- Clean Architecture implemented
- REST API with OpenAPI documentation
- Excel Import/Export
- PDF Report Generation

### Test Commands
```bash
# All tests
pytest

# With coverage
pytest --cov=backend --cov-report=html

# Specific test types
pytest tests/unit/           # 127 unit tests
pytest tests/integration/    # 101 integration tests
pytest tests/e2e/           # 7 E2E tests
```

### API Endpoints Summary
- `/api/v1/materials` - 자재 CRUD
- `/api/v1/processes` - 공정 CRUD
- `/api/v1/products` - 완제품 CRUD
- `/api/v1/bom` - BOM 관리
- `/api/v1/price-changes` - 단가 변경
- `/api/v1/cost-calculation` - 원가 계산
- `/api/v1/settlement` - 정산
- `/api/v1/excel` - Excel Import/Export
- `/api/v1/pdf` - PDF 보고서

## Feature Planner Workflow

This project uses the `feature-planner` skill. Plans are stored in `docs/plans/`.

### Current Plan
`docs/plans/backend-implementation-plan.md`

### Resume Implementation
1. Read the plan document
2. Find the current phase (first unchecked phase)
3. Follow TDD: RED → GREEN → REFACTOR
4. Run quality gates after each phase
5. Update checkboxes and progress

## Next Steps (Frontend)

Frontend implementation pending. Will connect to the REST API endpoints above.
