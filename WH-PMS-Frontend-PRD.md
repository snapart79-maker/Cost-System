# Frontend PRD: Wire Harness Purchase Price Management System

**Project Code**: WH-PMS-2025-FE  
**Version**: 1.0  
**Created**: 2025-12-26  
**Last Updated**: 2025-12-26  

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Directory Structure](#4-directory-structure)
5. [Feature Specifications](#5-feature-specifications)
6. [Data Models](#6-data-models)
7. [API Integration](#7-api-integration)
8. [UI/UX Design](#8-uiux-design)
9. [Implementation Phases](#9-implementation-phases)
10. [Testing Strategy](#10-testing-strategy)
11. [Backend Modifications Required](#11-backend-modifications-required)
12. [Appendix](#12-appendix)

---

## 1. Overview

### 1.1 Project Background

와이어 하네스 매입 단가 관리 시스템의 프론트엔드 애플리케이션 개발. 백엔드 API(FastAPI)와 연동하여 단가 변경 등록, 원가 자동 계산, 정산 관리 기능을 제공한다.

### 1.2 Goals

| 목표 | 측정 기준 |
|------|----------|
| 사용자 친화적 UI | 주요 작업 3클릭 이내 완료 |
| 빠른 응답성 | 페이지 로딩 2초 이내 |
| 데이터 정확성 | 원가 계산 결과 백엔드와 100% 일치 |
| 유지보수성 | Clean Architecture 적용, 테스트 커버리지 80% |

### 1.3 Users

- 생산관리실장 (1명)
- 담당자 (1명)
- 총 2명, 한국 사업장

### 1.4 Constraints

- 서버 운영 방식 (브라우저 접속)
- 백엔드 API 기존 구현체 활용
- 반응형 불필요 (데스크톱 전용)

---

## 2. Tech Stack

### 2.1 Core Technologies

| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| **Framework** | React | 18.x | 컴포넌트 기반, 생태계 풍부 |
| **Language** | TypeScript | 5.x | 타입 안정성, 개발 생산성 |
| **Build Tool** | Vite | 5.x | 빠른 HMR, 최적화된 빌드 |
| **UI Library** | Ant Design | 5.x | 기업용 UI, 테이블/폼 강력 |
| **Table** | TanStack Table | 8.x | 고급 테이블 기능 (편집, 필터, 정렬) |
| **State (Server)** | TanStack Query | 5.x | 서버 상태 캐싱, 동기화 |
| **State (Client)** | Zustand | 4.x | 경량, 간단한 클라이언트 상태 |
| **Routing** | React Router | 6.x | 선언적 라우팅 |
| **HTTP Client** | Axios | 1.x | 인터셉터, 에러 핸들링 |
| **Form** | React Hook Form | 7.x | 성능 최적화된 폼 관리 |
| **Validation** | Zod | 3.x | 스키마 기반 검증 |

### 2.2 Development Tools

| Category | Technology | Purpose |
|----------|------------|---------|
| **Linting** | ESLint | 코드 품질 |
| **Formatting** | Prettier | 코드 스타일 |
| **Testing** | Vitest | 단위/통합 테스트 |
| **E2E Testing** | Playwright | E2E 테스트 |
| **Type Check** | tsc | 타입 검사 |

### 2.3 Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "antd": "^5.12.0",
    "@tanstack/react-table": "^8.10.0",
    "@tanstack/react-query": "^5.8.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "dayjs": "^1.11.0",
    "decimal.js": "^10.4.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "msw": "^2.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

---

## 3. Architecture

### 3.1 Clean Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer                         │
│  (React Components, Pages, Hooks for UI)                       │
├─────────────────────────────────────────────────────────────────┤
│                      Application Layer                          │
│  (Use Cases, Application Services, DTOs)                       │
├─────────────────────────────────────────────────────────────────┤
│                        Domain Layer                             │
│  (Entities, Repository Interfaces, Domain Services)            │
├─────────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                         │
│  (API Client, Repository Implementations, External Services)   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Layer Responsibilities

| Layer | Responsibility | Dependencies |
|-------|---------------|--------------|
| **Domain** | 엔티티, 비즈니스 규칙 인터페이스 | 없음 (순수 TypeScript) |
| **Application** | 유스케이스, 비즈니스 로직 조합 | Domain |
| **Infrastructure** | API 통신, 외부 서비스 연동 | Domain, Application |
| **Presentation** | UI 컴포넌트, 사용자 상호작용 | 모든 레이어 |

### 3.3 Data Flow

```
User Action
    ↓
Presentation (Component)
    ↓
Application (Custom Hook / Use Case)
    ↓
Infrastructure (Repository Implementation)
    ↓
Backend API
    ↓
Response → State Update → UI Re-render
```

---

## 4. Directory Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── domain/                          # 도메인 계층
│   │   ├── entities/                    # 엔티티 타입 정의
│   │   │   ├── material.ts
│   │   │   ├── process.ts
│   │   │   ├── product.ts
│   │   │   ├── bom.ts
│   │   │   ├── price-change.ts
│   │   │   ├── settlement.ts
│   │   │   ├── cost-calculation.ts
│   │   │   └── index.ts
│   │   ├── repositories/                # Repository 인터페이스
│   │   │   ├── material.repository.ts
│   │   │   ├── process.repository.ts
│   │   │   ├── product.repository.ts
│   │   │   ├── bom.repository.ts
│   │   │   ├── price-change.repository.ts
│   │   │   ├── settlement.repository.ts
│   │   │   ├── cost-calculation.repository.ts
│   │   │   └── index.ts
│   │   └── services/                    # 도메인 서비스 인터페이스
│   │       ├── cost-calculator.service.ts
│   │       └── index.ts
│   │
│   ├── application/                     # 애플리케이션 계층
│   │   ├── use-cases/                   # 유스케이스
│   │   │   ├── material/
│   │   │   │   ├── get-materials.use-case.ts
│   │   │   │   ├── create-material.use-case.ts
│   │   │   │   ├── update-material.use-case.ts
│   │   │   │   ├── delete-material.use-case.ts
│   │   │   │   ├── bulk-update-materials.use-case.ts
│   │   │   │   └── index.ts
│   │   │   ├── process/
│   │   │   ├── product/
│   │   │   ├── bom/
│   │   │   ├── price-change/
│   │   │   │   ├── register-price-change.use-case.ts
│   │   │   │   ├── get-price-changes.use-case.ts
│   │   │   │   ├── calculate-cost-impact.use-case.ts
│   │   │   │   └── index.ts
│   │   │   ├── settlement/
│   │   │   │   ├── calculate-settlement.use-case.ts
│   │   │   │   ├── get-settlement-history.use-case.ts
│   │   │   │   └── index.ts
│   │   │   ├── cost-calculation/
│   │   │   │   ├── get-cost-breakdown.use-case.ts
│   │   │   │   ├── compare-costs.use-case.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── dtos/                        # 데이터 전송 객체
│   │   │   ├── material.dto.ts
│   │   │   ├── process.dto.ts
│   │   │   ├── product.dto.ts
│   │   │   ├── bom.dto.ts
│   │   │   ├── price-change.dto.ts
│   │   │   ├── settlement.dto.ts
│   │   │   ├── cost-calculation.dto.ts
│   │   │   └── index.ts
│   │   └── hooks/                       # 유스케이스 래핑 훅
│   │       ├── use-materials.ts
│   │       ├── use-processes.ts
│   │       ├── use-products.ts
│   │       ├── use-bom.ts
│   │       ├── use-price-change.ts
│   │       ├── use-settlement.ts
│   │       ├── use-cost-calculation.ts
│   │       └── index.ts
│   │
│   ├── infrastructure/                  # 인프라 계층
│   │   ├── api/                         # API 클라이언트
│   │   │   ├── client.ts                # Axios 인스턴스
│   │   │   ├── endpoints.ts             # API 엔드포인트 상수
│   │   │   └── index.ts
│   │   ├── repositories/                # Repository 구현체
│   │   │   ├── material.repository.impl.ts
│   │   │   ├── process.repository.impl.ts
│   │   │   ├── product.repository.impl.ts
│   │   │   ├── bom.repository.impl.ts
│   │   │   ├── price-change.repository.impl.ts
│   │   │   ├── settlement.repository.impl.ts
│   │   │   ├── cost-calculation.repository.impl.ts
│   │   │   └── index.ts
│   │   └── services/                    # 외부 서비스
│   │       ├── excel.service.ts         # Excel 처리
│   │       ├── pdf.service.ts           # PDF 다운로드
│   │       └── index.ts
│   │
│   ├── presentation/                    # 프레젠테이션 계층
│   │   ├── components/                  # 공통 컴포넌트
│   │   │   ├── common/
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── ConfirmModal.tsx
│   │   │   │   └── index.ts
│   │   │   ├── table/
│   │   │   │   ├── DataTable.tsx        # TanStack Table 래퍼
│   │   │   │   ├── EditableCell.tsx
│   │   │   │   ├── TableToolbar.tsx
│   │   │   │   ├── TablePagination.tsx
│   │   │   │   ├── TableFilter.tsx
│   │   │   │   └── index.ts
│   │   │   ├── form/
│   │   │   │   ├── FormInput.tsx
│   │   │   │   ├── FormSelect.tsx
│   │   │   │   ├── FormDatePicker.tsx
│   │   │   │   ├── FormNumberInput.tsx
│   │   │   │   └── index.ts
│   │   │   └── cost/
│   │   │       ├── CostSummaryCard.tsx
│   │   │       ├── CostBreakdownTable.tsx
│   │   │       ├── CostComparisonView.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── layouts/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── SummaryCards.tsx
│   │   │   │   │   ├── RecentChanges.tsx
│   │   │   │   │   └── QuickActions.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── price-change/
│   │   │   │   ├── PriceChangeRegisterPage.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── ProductSelector.tsx
│   │   │   │   │   ├── ChangeInfoForm.tsx
│   │   │   │   │   ├── MaterialChangeTable.tsx
│   │   │   │   │   ├── ProcessChangeTable.tsx
│   │   │   │   │   ├── CostPreview.tsx
│   │   │   │   │   ├── BulkEditModal.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── cost-sheet/
│   │   │   │   ├── CostSheetPage.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── CostSummarySection.tsx
│   │   │   │   │   ├── MaterialCostTab.tsx
│   │   │   │   │   ├── ProcessCostTab.tsx
│   │   │   │   │   ├── WorkTypeFilter.tsx
│   │   │   │   │   ├── ExportOptions.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── settlement/
│   │   │   │   ├── SettlementPage.tsx
│   │   │   │   ├── SettlementHistoryPage.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── SettlementConditionForm.tsx
│   │   │   │   │   ├── ReceiptQuantityTable.tsx
│   │   │   │   │   ├── SettlementResultTable.tsx
│   │   │   │   │   ├── SettlementHistoryTable.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── master-data/
│   │   │   │   ├── MasterDataPage.tsx
│   │   │   │   ├── MaterialTab.tsx
│   │   │   │   ├── ProcessTab.tsx
│   │   │   │   ├── ProductTab.tsx
│   │   │   │   ├── BomTab.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── MasterDataTable.tsx
│   │   │   │   │   ├── MasterDataForm.tsx
│   │   │   │   │   ├── ImportExportButtons.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── history/
│   │   │   │   ├── ChangeHistoryPage.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── HistorySearchForm.tsx
│   │   │   │   │   ├── HistoryTable.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── SettingsPage.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── CostRateSettings.tsx
│   │   │   │   │   ├── BackupRestore.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   └── styles/
│   │       ├── globals.css
│   │       ├── variables.css
│   │       └── antd-overrides.css
│   │
│   ├── shared/                          # 공유 유틸리티
│   │   ├── constants/
│   │   │   ├── routes.ts
│   │   │   ├── menu.ts
│   │   │   ├── messages.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── format.ts                # 숫자, 날짜 포맷
│   │   │   ├── decimal.ts               # Decimal 처리
│   │   │   ├── validation.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── common.ts
│   │   │   ├── api.ts
│   │   │   └── index.ts
│   │   └── config/
│   │       ├── env.ts
│   │       └── index.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── router.tsx
│   └── vite-env.d.ts
│
├── tests/
│   ├── unit/
│   │   ├── domain/
│   │   ├── application/
│   │   └── presentation/
│   ├── integration/
│   │   ├── api/
│   │   └── pages/
│   ├── e2e/
│   │   ├── price-change.spec.ts
│   │   ├── cost-sheet.spec.ts
│   │   └── settlement.spec.ts
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── server.ts
│   └── setup.ts
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── eslint.config.js
├── prettier.config.js
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## 5. Feature Specifications

### 5.1 Feature Priority Matrix

| Priority | Feature | Description | Page |
|----------|---------|-------------|------|
| **P1** | 단가 변경 등록 | 변경 사유 입력 → 자동 원가 계산 | PriceChangeRegisterPage |
| **P1** | 원가 계산서 조회 | 변경 전/후 비교, 상세 내역 | CostSheetPage |
| **P1** | 정산 관리 | 기간별 정산 금액 계산 | SettlementPage |
| **P2** | 기초 데이터 관리 | 자재/공정/완제품/BOM CRUD | MasterDataPage |
| **P2** | 변경 이력 조회 | 검색/필터 | ChangeHistoryPage |
| **P3** | 대시보드 | 요약 정보, 빠른 이동 | DashboardPage |
| **P3** | 정산 이력 조회 | 과거 정산 건 조회 | SettlementHistoryPage |
| **P3** | 설정 | 원가 비율 설정 | SettingsPage |

### 5.2 P1: 단가 변경 등록 (PriceChangeRegisterPage)

#### 5.2.1 화면 구성

```
┌─────────────────────────────────────────────────────────────────────┐
│ 단가 변경 등록                                          [저장] [취소]│
├─────────────────────────────────────────────────────────────────────┤
│ 1. 완제품 선택                                                      │
│    [품번/품명 검색 Select ▼]                                        │
│    선택됨: ABC-HARNESS-001 | 고객품번: XYZ-1234 | 차종: 모델A       │
├─────────────────────────────────────────────────────────────────────┤
│ 2. 변경 정보                                                        │
│    변경 적용일: [DatePicker]    ECO번호: [Input]                    │
│    변경 사유: [TextArea_____________________________________]        │
├─────────────────────────────────────────────────────────────────────┤
│ 3. 변경 항목                                                        │
│    ┌──────────┬──────────┐                                         │
│    │ 📦 재료비 │ ⚙️ 가공비 │                                         │
│    └──────────┴──────────┘                                         │
│    ┌─────────────────────────────────────────────────────────────┐ │
│    │ [+ 행추가] [삭제] [일괄수정]           검색: [____] 총 25건  │ │
│    │ ┌────┬──────────┬──────┬──────┬────────┬────────┬────────┐ │ │
│    │ │ ☐ │ 자재코드  │ 품명  │ 상태 │ 소요량  │ 단가   │ 재료비 │ │ │
│    │ ├────┼──────────┼──────┼──────┼────────┼────────┼────────┤ │ │
│    │ │ ☐ │ AWG20    │ 전선  │ ✏️   │ [0.62] │ 60.65  │ 37.60  │ │ │
│    │ │ ☐ │ TERM-001 │ 터미널│      │ 2      │ [15.0] │ 30.00  │ │ │
│    │ │ ☐ │ 🆕 NEW   │ 신규  │ 🆕   │ [1]    │ [50.0] │ 50.00  │ │ │
│    │ └────┴──────────┴──────┴──────┴────────┴────────┴────────┘ │ │
│    │                         [1] [2] [3]                         │ │
│    └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ 4. 원가 변경 미리보기 (실시간)                                      │
│    ┌───────────────┬───────────┬───────────┬─────────┐             │
│    │ 항목          │ 변경 전    │ 변경 후    │ 차이    │             │
│    ├───────────────┼───────────┼───────────┼─────────┤             │
│    │ 재료비        │ 1,234.56  │ 1,456.78  │ +222.22 │             │
│    │ 가공비        │   345.67  │   445.67  │ +100.00 │             │
│    │ 제조원가      │ 1,580.23  │ 1,902.45  │ +322.22 │             │
│    │ 구매원가      │ 1,850.00  │ 2,210.00  │ +360.00 │             │
│    └───────────────┴───────────┴───────────┴─────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.2.2 기능 요구사항

**FR-PC-001: 완제품 선택**
- 품번/품명 검색 가능한 Select 컴포넌트
- 선택 시 해당 완제품의 BOM 자재/공정 목록 로드
- 현재 원가 계산서 데이터 조회

**FR-PC-002: 재료비 변경 테이블**
- TanStack Table 기반 편집 가능 테이블
- 기능:
  - 셀 인라인 편집 (소요량, 단가)
  - 행 추가 (자재 선택 모달)
  - 행 삭제 (체크박스 선택 → 삭제)
  - 일괄 수정 (Excel 업로드 / 복사-붙여넣기)
- 행 상태 표시: 🆕 신규 / ✏️ 수정됨 / 🗑️ 삭제예정
- 실시간 재료비 계산 (소요량 × 단가)
- 페이징, 정렬, 검색, 필터

**FR-PC-003: 가공비 변경 테이블**
- 재료비와 동일한 패턴
- 편집 가능 필드: C/T, 인원
- 공정 추가/삭제
- 실시간 노무비/경비 계산

**FR-PC-004: 원가 변경 미리보기**
- 테이블 편집 시 실시간으로 원가 재계산
- 변경 전/후/차이 표시
- 백엔드 `/api/v1/cost-calculation/calculate` API 호출

**FR-PC-005: 일괄 수정 모달**
- Excel 양식 다운로드
- Excel 파일 업로드 → 파싱 → 테이블 반영
- 직접 입력 영역 (복사/붙여넣기 지원)

**FR-PC-006: 저장**
- 변경 내역 유효성 검증
- 단가 변경 등록 API 호출
- 성공 시 원가 계산서 조회 페이지로 이동

#### 5.2.3 컴포넌트 구조

```
PriceChangeRegisterPage
├── PageHeader
├── ProductSelector
│   └── Select (Ant Design)
├── ChangeInfoForm
│   ├── DatePicker
│   ├── Input (ECO번호)
│   └── TextArea (변경사유)
├── Tabs
│   ├── MaterialChangeTable
│   │   ├── TableToolbar
│   │   │   ├── AddButton
│   │   │   ├── DeleteButton
│   │   │   ├── BulkEditButton → BulkEditModal
│   │   │   └── SearchInput
│   │   ├── DataTable (TanStack Table)
│   │   │   └── EditableCell
│   │   └── TablePagination
│   └── ProcessChangeTable
│       └── (동일 구조)
├── CostPreview
│   └── CostComparisonTable
└── ActionButtons
    ├── SaveButton
    └── CancelButton
```

### 5.3 P1: 원가 계산서 조회 (CostSheetPage)

#### 5.3.1 화면 구성

```
┌─────────────────────────────────────────────────────────────────────┐
│ 원가 계산서 조회                                                    │
│ 완제품: [ABC-HARNESS-001 ▼]  고객품번: XYZ-1234  차종: 모델A       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 보기 필터: [● 전체] [○ 내작] [○ 외작]                              │
│                                                                     │
│ ┌─────────────── 원가 요약 ───────────────────────────────────────┐ │
│ │                    │   내작     │   외작     │    합계          │ │
│ │ 재료비             │  1,234.56  │    567.89  │  1,802.45        │ │
│ │ 노무비             │    345.67  │    123.45  │    469.12        │ │
│ │ 경비               │    234.56  │     89.01  │    323.57        │ │
│ │ ─────────────────────────────────────────────────────────────── │ │
│ │ 제조원가           │  1,814.79  │    780.35  │  2,595.14        │ │
│ │ 재료관리비 (1%)    │            │            │     18.02        │ │
│ │ 일반관리비 (10%)   │            │            │     79.27        │ │
│ │ 불량비 (1%)        │            │            │     25.95        │ │
│ │ 이윤 (10%)         │            │            │     87.20        │ │
│ │ ═══════════════════════════════════════════════════════════════ │ │
│ │ 구매원가           │            │            │  2,805.58        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌──────────┬──────────┐                                            │
│ │ 📦 재료비 │ ⚙️ 가공비 │                                           │
│ └──────────┴──────────┘                                            │
├─────────────────────────────────────────────────────────────────────┤
│ 검색: [____________]                                     총 45건   │
│ ┌────┬───────────┬────────┬──────┬──────┬────────┬───────┬───────┐ │
│ │선택│ 원재료품번 │ 품명    │ 내/외 │ 단위 │ 소요량  │ 단가  │ 재료비│ │
│ ├────┼───────────┼────────┼──────┼──────┼────────┼───────┼───────┤ │
│ │ ☐ │ AWG20-RED │ 전선    │ 내작 │ MTR  │ 0.62   │ 60.65 │ 37.60 │ │
│ │ ☐ │ CONN-002  │ 커넥터  │ 외작 │ EA   │ 1      │250.00 │250.00 │ │
│ └────┴───────────┴────────┴──────┴──────┴────────┴───────┴───────┘ │
│                              [1] [2] [3] ...                        │
│                                                                     │
│ 출력: ○ 전체  ○ 내작만  ○ 외작만              [PDF] [Excel]        │
└─────────────────────────────────────────────────────────────────────┘
```

#### 5.3.2 기능 요구사항

**FR-CS-001: 완제품 선택**
- 품번/품명 검색 가능한 Select
- 선택 시 원가 계산서 전체 조회

**FR-CS-002: 보기 필터 (전체/내작/외작)**
- Radio Button 그룹
- 필터 변경 시:
  - 원가 요약 테이블: 해당 컬럼만 표시
  - 상세 테이블: 해당 내/외작 항목만 필터링

**FR-CS-003: 원가 요약 섹션**
- 내작/외작/합계 컬럼
- 재료비, 노무비, 경비, 제조원가
- 재료관리비, 일반관리비, 불량비, 이윤 (비율 표시)
- 구매원가 (하이라이트)

**FR-CS-004: 재료비/가공비 탭**
- 탭 전환으로 상세 데이터 조회
- TanStack Table 기반 (읽기 전용)
- 페이징, 정렬, 검색

**FR-CS-005: 출력**
- 출력 범위 선택: 전체 / 내작만 / 외작만
- PDF 다운로드: `/api/v1/pdf/cost-breakdown/{product_id}`
- Excel 다운로드: `/api/v1/excel/export/cost-breakdown/{product_id}`

### 5.4 P1: 정산 관리 (SettlementPage)

#### 5.4.1 기능 요구사항

**FR-ST-001: 정산 조건 설정**
- 단가 변경 건 선택 (다중 선택 가능)
- 적용 품목 체크박스 목록
- 정산 기간 설정 (DateRangePicker)
- 조회 단위: 월별 / 일별 / 연간

**FR-ST-002: 입고 수량 입력**
- Excel 양식 다운로드
- Excel 업로드 → 파싱 → 테이블 반영
- 직접 입력 (편집 가능 테이블)
- 조회 단위에 따른 컬럼 동적 생성

**FR-ST-003: 정산 결과 계산**
- 계산하기 버튼 클릭 시 정산 금액 산출
- 품목별 정산 금액 표시
- 총 정산 금액 합계

**FR-ST-004: 저장 및 출력**
- 정산 결과 저장 (이력 생성)
- PDF / Excel 출력

### 5.5 P2: 기초 데이터 관리 (MasterDataPage)

#### 5.5.1 기능 요구사항

**FR-MD-001: 탭 구성**
- 자재 / 공정 / 완제품 / BOM 탭
- 각 탭 동일한 테이블 패턴 적용

**FR-MD-002: CRUD 기능**
- 신규 등록 (모달 폼)
- 수정 (인라인 편집 또는 모달)
- 삭제 (체크박스 선택 → 삭제)
- 일괄 삭제

**FR-MD-003: Excel Import/Export**
- 양식 다운로드
- Excel 업로드 → 검증 → 저장
- Excel 다운로드 (현재 데이터)

**FR-MD-004: 테이블 기능**
- 페이징, 정렬, 검색
- 필터 (유형별, 상태별 등)

### 5.6 기타 화면 (P2, P3)

#### 변경 이력 조회 (ChangeHistoryPage)
- 검색 조건: 품목, 기간, 변경유형, ECO번호
- 테이블: 변경일, 품목, 변경유형, 변경전/후 단가, 등록자
- 상세 클릭 시 원가 계산서 조회 페이지 이동

#### 정산 이력 조회 (SettlementHistoryPage)
- 검색 조건: 기간, 품목, ECO번호
- 테이블: 정산일, ECO번호, 품목수, 총정산금액
- 상세 보기 모달

#### 대시보드 (DashboardPage)
- 요약 카드: 이번 달 변경 건수, 정산 대기 건, 총 정산 금액
- 최근 변경 이력 목록 (최근 5건)
- 빠른 이동 버튼

#### 설정 (SettingsPage)
- 원가 비율 설정: 재료관리비율, 일반관리비율, 불량비율, 이윤율
- 백업/복원 기능

---

## 6. Data Models

### 6.1 Domain Entities

```typescript
// src/domain/entities/material.ts
export enum MaterialType {
  WIRE = 'WIRE',           // 전선
  TERMINAL = 'TERMINAL',   // 터미널
  CONNECTOR = 'CONNECTOR', // 커넥터
  TAPE = 'TAPE',           // 테이프
  TUBE = 'TUBE',           // 튜브
  ACCESSORY = 'ACCESSORY', // 부자재
}

export enum MaterialUnit {
  MTR = 'MTR', // 미터
  EA = 'EA',   // 개
  SET = 'SET', // 세트
  M = 'M',     // 미터 (테이프)
}

export interface Material {
  id: string;
  materialId: string;      // 품번
  name: string;            // 품명
  spec?: string;           // 규격
  type: MaterialType;
  unit: MaterialUnit;
  unitPrice: number;       // 단가 (소수점 4자리)
  scrapRate?: number;      // SCRAP율
  effectiveDate: string;   // 적용일 (ISO date)
  createdAt: string;
  updatedAt: string;
}
```

```typescript
// src/domain/entities/process.ts
export enum WorkType {
  INHOUSE = 'INHOUSE', // 내작
  OUTSOURCE = 'OUTSOURCE', // 외작
}

export interface Process {
  id: string;
  processId: string;       // 공정코드
  name: string;            // 공정명
  equipmentName?: string;  // 설비명
  workType: WorkType;
  efficiency: number;      // 효율 (%, 기본 100)
  laborRate: number;       // 임율 (원/시간)
  machineCost: number;     // 기계경비 (원/시간)
  createdAt: string;
  updatedAt: string;
}
```

```typescript
// src/domain/entities/product.ts
export enum ProductStatus {
  PRODUCTION = 'PRODUCTION', // 양산
  DEVELOPMENT = 'DEVELOPMENT', // 개발
  DISCONTINUED = 'DISCONTINUED', // 단종
}

export interface Product {
  id: string;
  productId: string;       // 품번
  name: string;            // 품명
  customerPn?: string;     // 고객품번
  customerName?: string;   // 고객사
  vehicleModel?: string;   // 차종
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}
```

```typescript
// src/domain/entities/bom.ts
export interface BomItem {
  id: string;
  productId: string;
  materialId: string;
  material?: Material;     // 조인 데이터
  quantity: number;        // 소요량
  workType: WorkType;
  seq?: number;            // 순번
}

export interface BomProcess {
  id: string;
  productId: string;
  processId: string;
  process?: Process;       // 조인 데이터
  cycleTime: number;       // C/T (초)
  workers: number;         // 인원
  workType: WorkType;
  seq?: number;            // 순번
}
```

```typescript
// src/domain/entities/price-change.ts
export enum ChangeType {
  MATERIAL = 'MATERIAL',   // 재료비
  PROCESS = 'PROCESS',     // 가공비
  COMBINED = 'COMBINED',   // 복합
}

export enum ChangeItemStatus {
  NEW = 'NEW',           // 신규
  MODIFIED = 'MODIFIED', // 수정
  DELETED = 'DELETED',   // 삭제
  UNCHANGED = 'UNCHANGED', // 변경없음
}

export interface MaterialChangeItem {
  materialId: string;
  material?: Material;
  status: ChangeItemStatus;
  beforeQuantity?: number;
  afterQuantity?: number;
  beforeUnitPrice?: number;
  afterUnitPrice?: number;
  beforeCost?: number;
  afterCost?: number;
  costDiff?: number;
}

export interface ProcessChangeItem {
  processId: string;
  process?: Process;
  status: ChangeItemStatus;
  beforeCycleTime?: number;
  afterCycleTime?: number;
  beforeWorkers?: number;
  afterWorkers?: number;
  beforeCost?: number;
  afterCost?: number;
  costDiff?: number;
}

export interface PriceChange {
  id: string;
  productId: string;
  product?: Product;
  changeType: ChangeType;
  changeReason: string;
  ecoNumber?: string;
  effectiveDate: string;
  beforeCost: number;
  afterCost: number;
  costDiff: number;
  materialChanges: MaterialChangeItem[];
  processChanges: ProcessChangeItem[];
  createdAt: string;
  createdBy: string;
}
```

```typescript
// src/domain/entities/cost-calculation.ts
export interface CostBreakdown {
  productId: string;
  product?: Product;
  
  // 재료비
  inhouseMaterialCost: number;
  outsourceMaterialCost: number;
  totalMaterialCost: number;
  
  // 노무비
  inhouseLaborCost: number;
  outsourceLaborCost: number;
  totalLaborCost: number;
  
  // 경비
  inhouseExpense: number;
  outsourceExpense: number;
  totalExpense: number;
  
  // 제조원가
  inhouseManufacturingCost: number;
  outsourceManufacturingCost: number;
  totalManufacturingCost: number;
  
  // 원가 요소
  materialManagementCost: number;  // 재료관리비
  generalManagementCost: number;   // 일반관리비
  defectCost: number;              // 불량비
  profit: number;                  // 이윤
  
  // 구매원가
  inhousePurchaseCost: number;
  outsourcePurchaseCost: number;
  totalPurchaseCost: number;
  
  // 상세 항목
  materialDetails: MaterialCostDetail[];
  processDetails: ProcessCostDetail[];
}

export interface MaterialCostDetail {
  materialId: string;
  material: Material;
  workType: WorkType;
  quantity: number;
  unitPrice: number;
  materialCost: number;
  scrapCost: number;
  netMaterialCost: number;
}

export interface ProcessCostDetail {
  processId: string;
  process: Process;
  workType: WorkType;
  cycleTime: number;
  workers: number;
  productionVolume: number; // 생산량
  laborCost: number;
  expense: number;
  totalProcessCost: number;
}
```

```typescript
// src/domain/entities/settlement.ts
export interface SettlementCondition {
  priceChangeId: string;
  productIds: string[];
  startDate: string;
  endDate: string;
  periodType: 'DAILY' | 'MONTHLY' | 'YEARLY';
}

export interface ReceiptQuantity {
  productId: string;
  product?: Product;
  period: string;          // 기간 (일자/월/연도)
  quantity: number;        // 입고 수량
}

export interface SettlementResult {
  productId: string;
  product?: Product;
  totalQuantity: number;   // 총 수량
  unitPriceDiff: number;   // 단가 변경분
  settlementAmount: number; // 정산 금액
  periodDetails: SettlementPeriodDetail[];
}

export interface SettlementPeriodDetail {
  period: string;
  quantity: number;
  amount: number;
}

export interface Settlement {
  id: string;
  priceChangeId: string;
  priceChange?: PriceChange;
  condition: SettlementCondition;
  results: SettlementResult[];
  totalSettlementAmount: number;
  createdAt: string;
  createdBy: string;
}
```

### 6.2 DTOs

```typescript
// src/application/dtos/price-change.dto.ts
export interface RegisterPriceChangeDto {
  productId: string;
  changeType: ChangeType;
  changeReason: string;
  ecoNumber?: string;
  effectiveDate: string;
  materialChanges: MaterialChangeInputDto[];
  processChanges: ProcessChangeInputDto[];
}

export interface MaterialChangeInputDto {
  materialId: string;
  status: ChangeItemStatus;
  quantity?: number;       // 신규/수정 시
  unitPrice?: number;      // 단가 변경 시
}

export interface ProcessChangeInputDto {
  processId: string;
  status: ChangeItemStatus;
  cycleTime?: number;      // 신규/수정 시
  workers?: number;        // 신규/수정 시
}

export interface CalculateCostPreviewDto {
  productId: string;
  materialChanges: MaterialChangeInputDto[];
  processChanges: ProcessChangeInputDto[];
}

export interface CostPreviewResult {
  before: CostSummary;
  after: CostSummary;
  diff: CostSummary;
}

export interface CostSummary {
  materialCost: number;
  laborCost: number;
  expense: number;
  manufacturingCost: number;
  purchaseCost: number;
}
```

---

## 7. API Integration

### 7.1 Base Configuration

```typescript
// src/infrastructure/api/client.ts
import axios from 'axios';
import { env } from '@/shared/config/env';

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    if (error.response?.status === 500) {
      console.error('Server Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);
```

### 7.2 API Endpoints

```typescript
// src/infrastructure/api/endpoints.ts
export const API_ENDPOINTS = {
  // Materials
  MATERIALS: '/api/v1/materials',
  MATERIAL_BY_ID: (id: string) => `/api/v1/materials/${id}`,
  MATERIALS_BY_TYPE: (type: string) => `/api/v1/materials/type/${type}`,
  MATERIALS_BULK: '/api/v1/materials/bulk',
  
  // Processes
  PROCESSES: '/api/v1/processes',
  PROCESS_BY_ID: (id: string) => `/api/v1/processes/${id}`,
  PROCESSES_BY_WORK_TYPE: (type: string) => `/api/v1/processes/work-type/${type}`,
  PROCESSES_BULK: '/api/v1/processes/bulk',
  
  // Products
  PRODUCTS: '/api/v1/products',
  PRODUCT_BY_ID: (id: string) => `/api/v1/products/${id}`,
  
  // BOM
  BOM: '/api/v1/bom',
  BOM_BY_PRODUCT: (productId: string) => `/api/v1/bom/product/${productId}`,
  BOM_ITEMS: (productId: string) => `/api/v1/bom/product/${productId}/items`,
  BOM_PROCESSES: (productId: string) => `/api/v1/bom/product/${productId}/processes`,
  BOM_BULK_UPDATE: (productId: string) => `/api/v1/bom/product/${productId}/bulk`,
  
  // Price Changes
  PRICE_CHANGES: '/api/v1/price-changes',
  PRICE_CHANGE_BY_ID: (id: string) => `/api/v1/price-changes/${id}`,
  PRICE_CHANGE_COMPARE: '/api/v1/price-changes/compare',
  
  // Cost Calculation
  COST_CALCULATION: '/api/v1/cost-calculation',
  COST_CALCULATE: '/api/v1/cost-calculation/calculate',
  COST_BREAKDOWN: (productId: string) => `/api/v1/cost-calculation/${productId}`,
  COST_PREVIEW: '/api/v1/cost-calculation/preview',
  
  // Settlement
  SETTLEMENT: '/api/v1/settlement',
  SETTLEMENT_CALCULATE: '/api/v1/settlement/calculate',
  SETTLEMENT_BY_ID: (id: string) => `/api/v1/settlement/${id}`,
  SETTLEMENT_HISTORY: '/api/v1/settlement/history',
  
  // Excel
  EXCEL_IMPORT_MATERIALS: '/api/v1/excel/import/materials',
  EXCEL_IMPORT_BOM: '/api/v1/excel/import/bom',
  EXCEL_IMPORT_PROCESSES: '/api/v1/excel/import/processes',
  EXCEL_IMPORT_RECEIPT: '/api/v1/excel/import/receipt',
  EXCEL_EXPORT_MATERIALS: '/api/v1/excel/export/materials',
  EXCEL_EXPORT_COST_BREAKDOWN: (productId: string) => 
    `/api/v1/excel/export/cost-breakdown/${productId}`,
  EXCEL_EXPORT_SETTLEMENT: (id: string) => `/api/v1/excel/export/settlement/${id}`,
  EXCEL_TEMPLATE: (type: string) => `/api/v1/excel/template/${type}`,
  
  // PDF
  PDF_COST_BREAKDOWN: (productId: string) => `/api/v1/pdf/cost-breakdown/${productId}`,
  PDF_SETTLEMENT: (id: string) => `/api/v1/pdf/settlement/${id}`,
  
  // Settings
  SETTINGS: '/api/v1/settings',
  SETTINGS_COST_RATES: '/api/v1/settings/cost-rates',
} as const;
```

### 7.3 Repository Implementation Example

```typescript
// src/infrastructure/repositories/material.repository.impl.ts
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { IMaterialRepository } from '@/domain/repositories/material.repository';
import type { Material, MaterialType } from '@/domain/entities/material';

export class MaterialRepositoryImpl implements IMaterialRepository {
  async getAll(): Promise<Material[]> {
    const response = await apiClient.get(API_ENDPOINTS.MATERIALS);
    return response.data;
  }

  async getById(id: string): Promise<Material> {
    const response = await apiClient.get(API_ENDPOINTS.MATERIAL_BY_ID(id));
    return response.data;
  }

  async getByType(type: MaterialType): Promise<Material[]> {
    const response = await apiClient.get(API_ENDPOINTS.MATERIALS_BY_TYPE(type));
    return response.data;
  }

  async create(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<Material> {
    const response = await apiClient.post(API_ENDPOINTS.MATERIALS, material);
    return response.data;
  }

  async update(id: string, material: Partial<Material>): Promise<Material> {
    const response = await apiClient.put(API_ENDPOINTS.MATERIAL_BY_ID(id), material);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.MATERIAL_BY_ID(id));
  }

  async bulkUpdate(materials: Partial<Material>[]): Promise<Material[]> {
    const response = await apiClient.put(API_ENDPOINTS.MATERIALS_BULK, { materials });
    return response.data;
  }
}
```

### 7.4 Custom Hooks (Application Layer)

```typescript
// src/application/hooks/use-materials.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialRepositoryImpl } from '@/infrastructure/repositories/material.repository.impl';
import type { Material, MaterialType } from '@/domain/entities/material';

const repository = new MaterialRepositoryImpl();

export const useMaterials = () => {
  return useQuery({
    queryKey: ['materials'],
    queryFn: () => repository.getAll(),
  });
};

export const useMaterialsByType = (type: MaterialType) => {
  return useQuery({
    queryKey: ['materials', 'type', type],
    queryFn: () => repository.getByType(type),
  });
};

export const useMaterial = (id: string) => {
  return useQuery({
    queryKey: ['materials', id],
    queryFn: () => repository.getById(id),
    enabled: !!id,
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => 
      repository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Material> }) => 
      repository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
};

export const useBulkUpdateMaterials = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (materials: Partial<Material>[]) => repository.bulkUpdate(materials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
};
```

---

## 8. UI/UX Design

### 8.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏭 Wire Harness Cost Management                    사용자: 홍길동  │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ 📊 대시보드│                                                          │
│          │                                                          │
│ 💰 단가관리│              메인 콘텐츠 영역                             │
│  ├ 변경등록│              (Pages render here)                        │
│  ├ 계산서  │                                                          │
│  └ 정산   │                                                          │
│          │                                                          │
│ 📁 기초데이터│                                                          │
│  ├ 자재   │                                                          │
│  ├ 공정   │                                                          │
│  ├ 완제품  │                                                          │
│  └ BOM   │                                                          │
│          │                                                          │
│ 📋 이력조회 │                                                          │
│  ├ 변경이력│                                                          │
│  └ 정산이력│                                                          │
│          │                                                          │
│ ⚙️ 설정   │                                                          │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

### 8.2 Design System

#### Colors

```css
:root {
  /* Primary */
  --primary-color: #1890ff;
  --primary-hover: #40a9ff;
  --primary-active: #096dd9;
  
  /* Status */
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #ff4d4f;
  
  /* Neutral */
  --text-primary: rgba(0, 0, 0, 0.85);
  --text-secondary: rgba(0, 0, 0, 0.65);
  --border-color: #d9d9d9;
  --background-color: #f5f5f5;
  
  /* Table */
  --table-header-bg: #1f4e79;
  --table-header-color: #ffffff;
  --table-row-hover: #e6f7ff;
  --table-row-alt: #fafafa;
  
  /* Change Status */
  --status-new: #52c41a;
  --status-modified: #faad14;
  --status-deleted: #ff4d4f;
}
```

#### Typography

```css
:root {
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Malgun Gothic', sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  --font-size-xxl: 24px;
}
```

#### Spacing

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### 8.3 Component Specifications

#### DataTable (TanStack Table Wrapper)

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  
  // 기능 옵션
  enableEditing?: boolean;
  enableRowSelection?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  
  // 이벤트
  onRowSelect?: (rows: T[]) => void;
  onCellEdit?: (rowId: string, columnId: string, value: any) => void;
  onRowAdd?: () => void;
  onRowDelete?: (rows: T[]) => void;
  
  // 페이징
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  
  // 스타일
  rowStatusField?: keyof T;  // 행 상태 표시 필드
  stickyHeader?: boolean;
  bordered?: boolean;
}
```

#### EditableCell

```typescript
interface EditableCellProps {
  value: any;
  type: 'text' | 'number' | 'select' | 'date';
  options?: { label: string; value: any }[];  // select용
  onChange: (value: any) => void;
  disabled?: boolean;
  precision?: number;  // number용 소수점 자릿수
}
```

---

## 9. Implementation Phases

### Phase 1: Project Setup & Infrastructure
**Estimated Time**: 1 day
**Priority**: 필수

#### Tasks
- [x] Vite + React + TypeScript 프로젝트 생성
- [x] 디렉토리 구조 생성 (Clean Architecture)
- [x] 의존성 설치 (Ant Design, TanStack 등)
- [x] ESLint, Prettier 설정
- [x] Vitest 테스트 환경 설정
- [x] API Client 설정 (Axios)
- [x] 라우터 설정 (React Router)
- [x] 레이아웃 컴포넌트 (MainLayout, Sidebar)

#### Quality Gate
```bash
npm run dev          # 개발 서버 실행
npm run build        # 빌드 성공
npm run lint         # 린트 통과
npm run type-check   # 타입 체크 통과
```

---

### Phase 2: Domain & Infrastructure Layer
**Estimated Time**: 1 day
**Priority**: 필수

#### Tasks
- [ ] Domain Entities 타입 정의
- [ ] Repository 인터페이스 정의
- [ ] API Endpoints 상수 정의
- [ ] Repository 구현체 작성
- [ ] API 에러 핸들링

#### Test Coverage
- Repository 구현체 단위 테스트
- API 모킹 (MSW)

#### Quality Gate
```bash
npm run test:unit    # 단위 테스트 통과
npm run type-check   # 타입 체크 통과
```

---

### Phase 3: Common Components
**Estimated Time**: 2 days
**Priority**: 필수

#### Tasks
- [ ] DataTable 컴포넌트 (TanStack Table)
  - 기본 테이블
  - 정렬, 필터, 검색
  - 페이징
  - 행 선택
  - 인라인 편집
- [ ] EditableCell 컴포넌트
- [ ] TableToolbar 컴포넌트
- [ ] Form 컴포넌트들 (Input, Select, DatePicker 래퍼)
- [ ] CostSummaryCard 컴포넌트
- [ ] PageHeader 컴포넌트
- [ ] ConfirmModal 컴포넌트
- [ ] LoadingSpinner 컴포넌트

#### Test Coverage
- 각 컴포넌트 단위 테스트
- 스토리북 (선택사항)

#### Quality Gate
```bash
npm run test:unit    # 단위 테스트 통과
# 각 컴포넌트 렌더링 확인
```

---

### Phase 4: P2 - Master Data Management
**Estimated Time**: 2 days
**Priority**: P2

#### Tasks
- [ ] Application Hooks (useMaterials, useProcesses, useProducts, useBom)
- [ ] MasterDataPage 구현
- [ ] MaterialTab 구현
- [ ] ProcessTab 구현
- [ ] ProductTab 구현
- [ ] BomTab 구현
- [ ] Excel Import/Export 기능
- [ ] CRUD 모달 폼

#### Test Coverage
- Hooks 단위 테스트
- 페이지 통합 테스트

#### Quality Gate
```bash
npm run test         # 테스트 통과
# 자재/공정/완제품/BOM CRUD 동작 확인
# Excel Import/Export 동작 확인
```

---

### Phase 5: P1 - Price Change Registration
**Estimated Time**: 3 days
**Priority**: P1 (핵심)

#### Tasks
- [ ] usePriceChange, useCostCalculation 훅
- [ ] PriceChangeRegisterPage 구현
- [ ] ProductSelector 컴포넌트
- [ ] ChangeInfoForm 컴포넌트
- [ ] MaterialChangeTable 컴포넌트 (편집 가능)
- [ ] ProcessChangeTable 컴포넌트 (편집 가능)
- [ ] BulkEditModal 컴포넌트
- [ ] CostPreview 컴포넌트 (실시간 계산)
- [ ] 저장 로직

#### Test Coverage
- 실시간 원가 계산 테스트
- 폼 유효성 검증 테스트
- 저장 플로우 테스트

#### Quality Gate
```bash
npm run test         # 테스트 통과
# 완제품 선택 → BOM 로드 확인
# 셀 편집 → 실시간 원가 계산 확인
# 저장 → 성공 확인
```

---

### Phase 6: P1 - Cost Sheet View
**Estimated Time**: 2 days
**Priority**: P1 (핵심)

#### Tasks
- [ ] CostSheetPage 구현
- [ ] CostSummarySection 컴포넌트
- [ ] MaterialCostTab 컴포넌트
- [ ] ProcessCostTab 컴포넌트
- [ ] WorkTypeFilter 컴포넌트
- [ ] ExportOptions 컴포넌트
- [ ] PDF/Excel 다운로드 연동

#### Test Coverage
- 필터 동작 테스트
- 데이터 표시 테스트
- 다운로드 테스트

#### Quality Gate
```bash
npm run test         # 테스트 통과
# 필터(전체/내작/외작) 동작 확인
# PDF/Excel 다운로드 확인
```

---

### Phase 7: P1 - Settlement Management
**Estimated Time**: 2 days
**Priority**: P1 (핵심)

#### Tasks
- [ ] useSettlement 훅
- [ ] SettlementPage 구현
- [ ] SettlementConditionForm 컴포넌트
- [ ] ReceiptQuantityTable 컴포넌트
- [ ] SettlementResultTable 컴포넌트
- [ ] Excel 업로드 (입고 수량)
- [ ] 정산 계산 로직

#### Test Coverage
- 정산 계산 테스트
- Excel 파싱 테스트

#### Quality Gate
```bash
npm run test         # 테스트 통과
# 정산 조건 설정 → 입고 수량 입력 → 계산 확인
```

---

### Phase 8: P2/P3 - Additional Features
**Estimated Time**: 2 days
**Priority**: P2/P3

#### Tasks
- [ ] ChangeHistoryPage 구현
- [ ] SettlementHistoryPage 구현
- [ ] DashboardPage 구현
- [ ] SettingsPage 구현

#### Quality Gate
```bash
npm run test         # 테스트 통과
# 각 페이지 렌더링 및 기능 확인
```

---

### Phase 9: E2E Testing & Polish
**Estimated Time**: 1 day
**Priority**: 필수

#### Tasks
- [ ] E2E 테스트 작성 (Playwright)
  - 단가 변경 등록 플로우
  - 원가 계산서 조회 플로우
  - 정산 플로우
- [ ] 에러 핸들링 개선
- [ ] 로딩 상태 개선
- [ ] 반응형 미세 조정
- [ ] 버그 수정

#### Quality Gate
```bash
npm run test:e2e     # E2E 테스트 통과
npm run build        # 프로덕션 빌드 성공
```

---

## 10. Testing Strategy

### 10.1 Test Pyramid

| Level | Coverage | Tools | Focus |
|-------|----------|-------|-------|
| Unit | ≥80% | Vitest | Hooks, Utils, 순수 함수 |
| Integration | Critical paths | Vitest + RTL | 컴포넌트 + API |
| E2E | Key flows | Playwright | 전체 사용자 플로우 |

### 10.2 Test File Structure

```
tests/
├── unit/
│   ├── domain/
│   │   └── entities/
│   │       └── material.test.ts
│   ├── application/
│   │   └── hooks/
│   │       └── use-materials.test.ts
│   └── presentation/
│       └── components/
│           └── DataTable.test.tsx
├── integration/
│   ├── api/
│   │   └── material-api.test.ts
│   └── pages/
│       └── MasterDataPage.test.tsx
├── e2e/
│   ├── price-change.spec.ts
│   ├── cost-sheet.spec.ts
│   └── settlement.spec.ts
├── mocks/
│   ├── handlers.ts
│   └── server.ts
└── setup.ts
```

### 10.3 MSW Handlers

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';

export const handlers = [
  http.get(API_ENDPOINTS.MATERIALS, () => {
    return HttpResponse.json([
      {
        id: '1',
        materialId: 'AWG20-RED',
        name: '전선',
        type: 'WIRE',
        unit: 'MTR',
        unitPrice: 60.65,
      },
    ]);
  }),
  
  http.post(API_ENDPOINTS.COST_PREVIEW, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      before: { materialCost: 1000, purchaseCost: 1200 },
      after: { materialCost: 1100, purchaseCost: 1320 },
      diff: { materialCost: 100, purchaseCost: 120 },
    });
  }),
];
```

---

## 11. Backend Modifications Required

### 11.1 New APIs Required

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| BOM 일괄 수정 | PUT | `/api/v1/bom/product/{id}/bulk` | 재료비/가공비 일괄 변경 |
| 공정 일괄 수정 | PUT | `/api/v1/processes/bulk` | 공정 일괄 업데이트 |
| 자재 일괄 수정 | PUT | `/api/v1/materials/bulk` | 자재 일괄 업데이트 |
| 원가 미리보기 | POST | `/api/v1/cost-calculation/preview` | 변경 전 원가 시뮬레이션 |
| 입고 데이터 관리 | CRUD | `/api/v1/receipts` | 입고 수량 관리 |
| Excel 양식 다운로드 | GET | `/api/v1/excel/template/{type}` | 업로드용 템플릿 |
| 정산 이력 조회 | GET | `/api/v1/settlement/history` | 정산 이력 목록 |
| 원가 비율 설정 | GET/PUT | `/api/v1/settings/cost-rates` | 비율 설정 관리 |

### 11.2 API Modifications

| API | Modification |
|-----|-------------|
| GET `/api/v1/bom/product/{id}` | BOM 조회 시 자재/공정 상세 정보 포함 |
| GET `/api/v1/cost-calculation/{id}` | 내작/외작 분리된 상세 데이터 반환 |
| POST `/api/v1/price-changes` | materialChanges, processChanges 배열 지원 |

### 11.3 Backend Implementation Plan Reference

백엔드 수정사항은 별도 Implementation Plan으로 관리:
- `WH-PMS-Backend-Modification-Plan.md`

---

## 12. Appendix

### 12.1 Route Configuration

```typescript
// src/shared/constants/routes.ts
export const ROUTES = {
  DASHBOARD: '/',
  
  // 단가 관리
  PRICE_CHANGE: '/price-change',
  PRICE_CHANGE_REGISTER: '/price-change/register',
  COST_SHEET: '/cost-sheet',
  SETTLEMENT: '/settlement',
  SETTLEMENT_HISTORY: '/settlement/history',
  
  // 기초 데이터
  MASTER_DATA: '/master-data',
  MASTER_MATERIAL: '/master-data/material',
  MASTER_PROCESS: '/master-data/process',
  MASTER_PRODUCT: '/master-data/product',
  MASTER_BOM: '/master-data/bom',
  
  // 이력
  CHANGE_HISTORY: '/history/changes',
  
  // 설정
  SETTINGS: '/settings',
} as const;
```

### 12.2 Menu Configuration

```typescript
// src/shared/constants/menu.ts
import { 
  DashboardOutlined, 
  DollarOutlined, 
  DatabaseOutlined,
  HistoryOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { ROUTES } from './routes';

export const MENU_ITEMS = [
  {
    key: 'dashboard',
    icon: DashboardOutlined,
    label: '대시보드',
    path: ROUTES.DASHBOARD,
  },
  {
    key: 'price-management',
    icon: DollarOutlined,
    label: '단가 관리',
    children: [
      { key: 'price-register', label: '변경 등록', path: ROUTES.PRICE_CHANGE_REGISTER },
      { key: 'cost-sheet', label: '원가 계산서', path: ROUTES.COST_SHEET },
      { key: 'settlement', label: '정산 관리', path: ROUTES.SETTLEMENT },
    ],
  },
  {
    key: 'master-data',
    icon: DatabaseOutlined,
    label: '기초 데이터',
    children: [
      { key: 'material', label: '자재', path: ROUTES.MASTER_MATERIAL },
      { key: 'process', label: '공정', path: ROUTES.MASTER_PROCESS },
      { key: 'product', label: '완제품', path: ROUTES.MASTER_PRODUCT },
      { key: 'bom', label: 'BOM', path: ROUTES.MASTER_BOM },
    ],
  },
  {
    key: 'history',
    icon: HistoryOutlined,
    label: '이력 조회',
    children: [
      { key: 'change-history', label: '변경 이력', path: ROUTES.CHANGE_HISTORY },
      { key: 'settlement-history', label: '정산 이력', path: ROUTES.SETTLEMENT_HISTORY },
    ],
  },
  {
    key: 'settings',
    icon: SettingOutlined,
    label: '설정',
    path: ROUTES.SETTINGS,
  },
];
```

### 12.3 Number Formatting Utilities

```typescript
// src/shared/utils/format.ts
import Decimal from 'decimal.js';

// 금액 포맷 (천단위 콤마, 소수점 2자리)
export const formatCurrency = (value: number | string): string => {
  const num = new Decimal(value);
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 수량 포맷 (소수점 4자리까지)
export const formatQuantity = (value: number | string): string => {
  const num = new Decimal(value);
  return num.toFixed(4).replace(/\.?0+$/, '');
};

// 퍼센트 포맷
export const formatPercent = (value: number | string): string => {
  const num = new Decimal(value).times(100);
  return `${num.toFixed(1)}%`;
};

// 날짜 포맷
export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DD');
};
```

### 12.4 Validation Schemas

```typescript
// src/shared/utils/validation.ts
import { z } from 'zod';

export const materialSchema = z.object({
  materialId: z.string().min(1, '품번을 입력하세요'),
  name: z.string().min(1, '품명을 입력하세요'),
  type: z.enum(['WIRE', 'TERMINAL', 'CONNECTOR', 'TAPE', 'TUBE', 'ACCESSORY']),
  unit: z.enum(['MTR', 'EA', 'SET', 'M']),
  unitPrice: z.number().positive('단가는 0보다 커야 합니다'),
  scrapRate: z.number().min(0).max(1).optional(),
  effectiveDate: z.string(),
});

export const priceChangeSchema = z.object({
  productId: z.string().min(1, '완제품을 선택하세요'),
  changeType: z.enum(['MATERIAL', 'PROCESS', 'COMBINED']),
  changeReason: z.string().min(1, '변경 사유를 입력하세요'),
  ecoNumber: z.string().optional(),
  effectiveDate: z.string(),
  materialChanges: z.array(z.object({
    materialId: z.string(),
    status: z.enum(['NEW', 'MODIFIED', 'DELETED', 'UNCHANGED']),
    quantity: z.number().optional(),
    unitPrice: z.number().optional(),
  })),
  processChanges: z.array(z.object({
    processId: z.string(),
    status: z.enum(['NEW', 'MODIFIED', 'DELETED', 'UNCHANGED']),
    cycleTime: z.number().optional(),
    workers: z.number().optional(),
  })),
});
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-26 | System | Initial creation |

---

**Document Status**: ✅ Complete

**Next Steps**:
1. Backend Modification Plan 작성
2. Phase 1 구현 시작
3. 백엔드 API 수정 병행
