# Wire Harness Cost Management System - Backend

와이어 하네스 매입 단가 관리 시스템의 백엔드 API 서버입니다.

## 주요 기능

- **원가 계산**: 자재비, 노무비, 경비를 기반으로 구매원가 자동 계산
- **단가 변경 관리**: 변경 이력 추적 및 변경 전/후 비교
- **정산 금액 산출**: 단가 변경에 따른 정산 금액 자동 계산
- **Excel Import/Export**: 데이터 일괄 처리
- **PDF 보고서**: 원가 계산서, 정산 보고서 생성

## 기술 스택

- **Framework**: FastAPI
- **Database**: SQLite + SQLAlchemy Async
- **Validation**: Pydantic v2
- **PDF**: ReportLab
- **Excel**: openpyxl
- **Architecture**: Clean Architecture

## 설치 및 실행

### 요구 사항

- Python 3.9+
- pip

### 설치

```bash
# 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -e ".[dev]"
```

### 실행

```bash
# 개발 서버 실행
uvicorn backend.main:app --reload

# 서버 주소: http://localhost:8000
# API 문서: http://localhost:8000/docs
```

### 테스트

```bash
# 전체 테스트 실행
pytest

# 커버리지 포함
pytest --cov=backend --cov-report=html

# 특정 테스트만 실행
pytest tests/unit/           # 단위 테스트
pytest tests/integration/    # 통합 테스트
pytest tests/e2e/           # E2E 테스트
```

### 코드 품질

```bash
# 린트 검사
ruff check backend/

# 타입 검사
mypy backend/ --ignore-missing-imports

# 포맷팅
ruff format backend/
```

## 프로젝트 구조

```
backend/
├── domain/                    # 핵심 비즈니스 로직
│   ├── entities/              # 엔티티 (Material, Process, Product, BOM, PriceChange)
│   ├── services/              # 도메인 서비스 (CostCalculation)
│   ├── repositories/          # Repository 인터페이스
│   └── value_objects/         # 값 객체 (Money, CostRate)
│
├── application/               # 유스케이스 계층
│   ├── use_cases/             # 비즈니스 유스케이스
│   ├── dtos/                  # 데이터 전송 객체
│   └── interfaces/            # 외부 서비스 인터페이스
│
├── infrastructure/            # 외부 시스템 구현
│   ├── persistence/           # SQLAlchemy 구현
│   ├── excel/                 # Excel 처리
│   └── pdf/                   # PDF 생성
│
├── presentation/              # API 계층
│   ├── api/v1/                # REST API 엔드포인트
│   └── schemas/               # Pydantic 스키마
│
├── config/                    # 설정
├── tests/                     # 테스트
└── main.py                    # 애플리케이션 진입점
```

## API 엔드포인트

### 자재 (Materials)
- `GET /api/v1/materials` - 자재 목록 조회
- `POST /api/v1/materials` - 자재 등록
- `GET /api/v1/materials/{id}` - 자재 상세 조회
- `PATCH /api/v1/materials/{id}` - 자재 수정
- `DELETE /api/v1/materials/{id}` - 자재 삭제

### 공정 (Processes)
- `GET /api/v1/processes` - 공정 목록 조회
- `POST /api/v1/processes` - 공정 등록
- `GET /api/v1/processes/{id}` - 공정 상세 조회
- `PATCH /api/v1/processes/{id}` - 공정 수정
- `DELETE /api/v1/processes/{id}` - 공정 삭제

### 완제품 (Products)
- `GET /api/v1/products` - 완제품 목록 조회
- `POST /api/v1/products` - 완제품 등록
- `GET /api/v1/products/{id}` - 완제품 상세 조회
- `PATCH /api/v1/products/{id}` - 완제품 수정
- `DELETE /api/v1/products/{id}` - 완제품 삭제

### BOM
- `GET /api/v1/bom/{product_id}` - BOM 조회
- `POST /api/v1/bom` - BOM 생성
- `POST /api/v1/bom/{product_id}/items` - BOM 항목 추가
- `DELETE /api/v1/bom/{product_id}/items/{material_id}` - BOM 항목 삭제
- `DELETE /api/v1/bom/{product_id}` - BOM 삭제

### 원가 계산 (Cost Calculation)
- `POST /api/v1/cost-calculation/calculate` - 원가 계산
- `POST /api/v1/cost-calculation/report` - 원가 계산서 생성
- `POST /api/v1/cost-calculation/compare` - 원가 버전 비교

### 단가 변경 (Price Changes)
- `GET /api/v1/price-changes` - 단가 변경 목록 조회
- `POST /api/v1/price-changes` - 단가 변경 등록
- `GET /api/v1/price-changes/{id}` - 단가 변경 상세 조회
- `GET /api/v1/price-changes/compare` - 원가 비교

### 정산 (Settlement)
- `POST /api/v1/settlement/calculate` - 정산 금액 계산
- `POST /api/v1/settlement/summary` - 정산 요약
- `POST /api/v1/settlement/daily` - 일별 상세

### Excel Import/Export
- `POST /api/v1/excel/import/materials` - 자재 Import
- `POST /api/v1/excel/import/bom` - BOM Import
- `POST /api/v1/excel/import/processes` - 공정 Import
- `GET /api/v1/excel/export/materials` - 자재 Export
- `GET /api/v1/excel/export/processes` - 공정 Export

### PDF 보고서
- `GET /api/v1/pdf/cost-breakdown/{product_id}` - 원가 계산서 PDF
- `GET /api/v1/pdf/settlement/{change_id}` - 정산 보고서 PDF
- `GET /api/v1/pdf/materials` - 자재 목록 PDF

## 원가 계산 공식

```
구매원가 = 제조원가 + 재료관리비 + 일반관리비 + 불량비 + 이윤

제조원가 = 재료비 + 노무비 + 경비

재료비 = Σ(자재단가 × 소요량 × (1 + SCRAP율))
노무비 = 임율 × 작업시간 × 작업인원
경비 = 기계경비 × 작업시간
```

## 테스트 현황

- **단위 테스트**: 127개
- **통합 테스트**: 94개
- **E2E 테스트**: 7개
- **총 테스트**: 235개
- **커버리지**: ~90%+

## 라이선스

Private
