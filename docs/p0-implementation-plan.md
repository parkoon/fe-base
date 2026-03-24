# P0 (MVP) 프론트엔드 구현 계획: 정보계 DB 권한관리 + 웹쿼리

> **버전:** v2.0 | **작성일:** 2026.03.24 | **작성:** 서비스개발실
> **상태:** Approved | **기반 문서:** PRD v0.3
> v1.0 → v2.0 변경: 계층 권한 모델(DataSource > Schema > Table) 반영, UX 시나리오 가이드 반영

---

## Context

현업 사용자가 정보계 DB에 직접 접근하여 보안 통제가 불가능한 구조적 문제를 해결하기 위해, 웹 기반 SQL 에디터(웹쿼리)와 권한관리 시스템을 통합 구축한다. 모든 접근은 **DataSource > Schema > Table 계층 권한 신청 → 3단계 결재 → 자동 부여/회수** 플로우를 거치며, 쿼리 실행 시 마스킹·건수 제한·이력 적재가 자동 적용된다.

이 계획은 **프론트엔드(React) P0 기능**에 한정하며, 백엔드(Spring Boot)는 별도 팀이 개발한다.

---

## 1. 디자인 방향: Supabase 대시보드 참고

Supabase Dashboard를 디자인 레퍼런스로 삼는다. **다크 모드는 사용하지 않으며, 라이트 모드 전용**으로 구현한다.

### 참고할 Supabase UI 패턴

| 요소              | Supabase 패턴                                  | 우리 적용                                            |
| ----------------- | ---------------------------------------------- | ---------------------------------------------------- |
| **레이아웃**      | 좌측 사이드바 + 넓은 콘텐츠 영역               | 동일 구조 채택                                       |
| **사이드바**      | 아이콘 + 텍스트, 섹션 구분, 프로젝트 선택기    | 역할 기반 메뉴 그룹 (웹쿼리, 권한관리, 결재, 관리자) |
| **상단 헤더**     | Breadcrumb + 검색 + 사용자 아바타              | Breadcrumb + 알림 벨 + 사용자 정보/로그아웃          |
| **데이터 테이블** | 미니멀한 테이블, 상태 뱃지(컬러), 필터/검색 바 | 권한 목록, 결재 목록, 감사 로그에 동일 적용          |
| **카드 UI**       | 프로젝트 카드 (이름, 리전, 상태 뱃지)          | 대시보드 통계 카드, 권한 현황 카드                   |
| **상태 뱃지**     | ACTIVE(green), MICRO(gray) 등 컬러 뱃지        | 결재 상태별 뱃지 (대기:yellow, 승인:green, 반려:red) |
| **SQL 에디터**    | Supabase SQL Editor (Monaco 기반)              | 동일하게 Monaco Editor 활용                          |
| **색상 톤**       | neutral 베이스, 상태값만 컬러 강조             | 기존 디자인 토큰(Primary: #ff6200) + neutral 베이스  |
| **테마**          | 다크/라이트 지원                               | **라이트 모드 전용** (다크 모드 미지원)              |

### 레이아웃 구조

```
┌─────────────────────────────────────────────────┐
│  Header: Breadcrumb    [알림벨] [사용자 아바타]  │
├────────┬────────────────────────────────────────-┤
│        │                                         │
│  Side  │          Content Area                   │
│  bar   │                                         │
│        │  ┌─────────────────────────────────┐    │
│ 웹쿼리  │  │  Page Title                     │    │
│ 권한관리│  │  ┌─────────────────────────────┐│    │
│ 결재    │  │  │  Data Table / Editor        ││    │
│ 관리자  │  │  │                             ││    │
│        │  │  └─────────────────────────────┘│    │
│        │  └─────────────────────────────────┘    │
└────────┴─────────────────────────────────────────┘
```

**구현 현황:** shadcn/ui `Sidebar` 시스템 설치 완료 (collapsible 지원)

- 사이드바 너비: 기본 240px (16rem), 축소 시 아이콘만 48px (3rem)
- 콘텐츠 영역: `max-w-screen-2xl` 또는 full-width (에디터 페이지)
- 키보드 단축키: Ctrl+B (Cmd+B) 토글
- **현재 상태:** `root.tsx`는 `<Outlet />`만 렌더링 → SidebarProvider + AppSidebar + Header 통합 필요
- **현재 상태:** AppSidebar 샘플 데이터(shadcn 기본) → 역할 기반 메뉴로 교체 필요

---

## 2. 라우트 구조

```
/app                              -- 대시보드 (기존)
/app/permissions/request          -- 권한 신청 (DS > Schema > Table 드릴다운 + 폼)
/app/permissions/my               -- 내 신청 목록
/app/permissions/my/:id           -- 신청 상세 (결재 진행 상태)
/app/approvals                    -- 결재 대기함 (결재자 전용)
/app/approvals/:id                -- 결재 상세 (승인/반려)
/app/query/editor                 -- 웹쿼리 SQL 에디터
/app/query/history                -- SQL 실행 이력
/app/admin/users                  -- 사용자 관리 (관리자)
/app/admin/datasources            -- DataSource 관리 (관리자)
/app/admin/permissions            -- 권한 현황 (관리자)
/app/admin/audit                  -- 감사 로그 (관리자)
```

---

## 3. 구현 Phase

### Phase 1: 기반 셋업 (Week 1-2)

#### 이미 완료된 항목 ✅

- shadcn/ui Sidebar 시스템 설치 및 기본 컴포넌트 구현
  - `src/components/ui/sidebar.tsx` — SidebarProvider, Sidebar, SidebarInset 등 전체 시스템
  - `src/components/app-sidebar.tsx` — 메인 사이드바 (역할 기반 메뉴 구현 완료)
  - `src/components/nav-main.tsx` — 네비게이션 메뉴 (flat 구조)
  - `src/components/nav-user.tsx` — 사용자 드롭다운 (아바타, 로그아웃)
- shadcn/ui 컴포넌트: breadcrumb, avatar, button, collapsible, dropdown-menu, input, separator, sheet, skeleton, tooltip, card, label, field, spinner
- 기본 라우터 구조: `/app/*` 보호 라우트, `convert(queryClient)` 패턴
- 역할 기반 접근 제어: `RoleGuard`, `getRoleLevel` (auth store 통합 완료)
- `src/config/paths.ts` — 라우트 경로 정의 완료

#### 수정할 파일

- `src/app/routes/app/root.tsx` — `<Outlet />` → SidebarProvider + AppSidebar + SidebarInset + Header 레이아웃 통합
- `src/components/app-sidebar.tsx` — DataSource 관리 메뉴 추가 (관리자)
- `src/config/paths.ts` — DataSource 관리 라우트 경로 추가
- `src/app/router.tsx` — DataSource 관리 라우트 등록
- `src/app/provider.tsx` — idle timeout 통합
- `src/config/env.ts` — `VITE_APP_API_URL`, idle timeout 등 환경변수 추가

#### 새로 만들 파일

- `src/api/querypie.ts` — 새 API 클라이언트 (`src/api/dummyjson.ts` 패턴 따름)
- `src/types/manual/datasource.ts` — DataSource/Schema 관련 타입
- `src/types/manual/permissions.ts` — 권한 관련 타입 (백엔드 OpenAPI 스펙 전까지 수동)
- `src/types/manual/query.ts` — 쿼리 관련 타입
- `src/types/manual/admin.ts` — 관리자 관련 타입
- `src/hooks/use-idle-timeout.ts` — 비활성 자동 로그아웃
- `src/hooks/use-debounce.ts` — 검색 디바운스

#### 삭제/정리할 파일

- `src/components/nav-projects.tsx` — 프로젝트 목록 (불필요)
- `src/components/team-switcher.tsx` — 팀 선택기 (불필요, 단일 서비스)
- `src/app/routes/app/dashboard.tsx` — 로컬 레이아웃 코드 제거 (root.tsx로 이동)

#### 설치할 패키지

- `@monaco-editor/react` — SQL 에디터
- `@tanstack/react-table` + `@tanstack/react-virtual` — 결과 그리드

#### shadcn/ui 컴포넌트 추가 (미설치 항목만)

- dialog, textarea, select, badge, table, calendar, popover, command, tabs, resizable

---

### Phase 2: 권한 신청 플로우 (Week 2-3)

#### UX 핵심: DataSource > Schema > Table 계층 드릴다운

권한 신청 화면은 3단계 드릴다운으로 구성된다:

1. DataSource 선택 (접근 가능한 DB 서버 목록)
2. Schema 선택 (해당 서버 내 스키마 목록)
3. 테이블 검색 및 선택 (한글/영문명 검색)

SQL 에디터에서 권한 없는 테이블 실행 시 [신청] 버튼을 통해 진입하면 DataSource/Schema/Table이 자동 입력된다.

**API 서비스 파일** (`src/api/todos/get-todos.ts` 패턴 따름):

- `src/api/datasources/get-datasources.ts` — `GET /api/datasources` + queryOptions (사용자 접근 가능 목록)
- `src/api/datasources/get-datasource-schemas.ts` — `GET /api/datasources/{id}/schemas` + queryOptions
- `src/api/datasources/get-datasource-tables.ts` — `GET /api/datasources/{dsId}/schemas/{schema}/tables` + queryOptions
- `src/api/datasources/get-datasource-columns.ts` — `GET /api/datasources/{dsId}/schemas/{schema}/tables/{table}/columns` + queryOptions
- `src/api/permissions/post-permissions-request.ts` — 권한 신청 mutation (DataSource/Schema/Table 포함)
- `src/api/permissions/get-permissions-requests.ts` — 내 신청 목록 queryOptions
- `src/api/permissions/get-permissions-requests-{id}.ts` — 신청 상세 queryOptions

**페이지:**

- `src/app/routes/app/permissions/request.tsx`
  - `DataSourceSelect` — DataSource 선택 (카드 또는 Select)
  - `SchemaSelect` — Schema 선택 (DataSource 선택 후 활성화)
  - `TableSearchCombobox` — Schema 선택 후 디바운스 검색 + 자동완성 (한글/영문 테이블명)
  - 신청 폼: DataSource, Schema, 테이블 선택, 사유(필수), 기간(필수)
  - SQL 에디터에서 넘어온 경우 DataSource/Schema/Table 자동 입력 (URL query params)
- `src/app/routes/app/permissions/my.tsx`
  - Supabase 스타일 데이터 테이블 + 상태 필터 (1차대기/1차완료/2차대기/최종승인/반려)
  - DataSource/Schema/Table 정보 표시
  - 상태별 컬러 뱃지
- `src/app/routes/app/permissions/detail.tsx`
  - 신청 상세 (DataSource > Schema > Table 경로 표시) + `ApprovalTimeline` (3단계 결재 진행 시각화)
  - 반려 시 [재신청] 버튼

**공유 컴포넌트:**

- `src/components/datasource-schema-picker.tsx` — DataSource/Schema 2단계 선택기 (권한 신청 + SQL 에디터 공용)
- `src/components/table-search-combobox.tsx` — Schema 범위 내 테이블 검색
- `src/components/status-badge.tsx` — 결재 상태 뱃지
- `src/components/approval-timeline.tsx` — 결재 타임라인
- `src/components/date-range-picker.tsx`

---

### Phase 3: 결재 플로우 (Week 3-4)

**API 서비스:**

- `src/api/permissions/post-permissions-approve-{id}.ts` — 승인 mutation
- `src/api/permissions/post-permissions-reject-{id}.ts` — 반려 mutation (사유 필수)

**페이지:**

- `src/app/routes/app/approvals/index.tsx` — 결재 대기 목록 (대기/완료/전체 필터, DataSource/Table 정보 표시)
- `src/app/routes/app/approvals/detail.tsx` — 결재 상세 + 승인/반려 액션 패널

**추가:**

- `src/components/notification-bell.tsx` — 알림 벨 (폴링 방식, 30-60초 간격)
- 전결/대결 UI 표시

---

### Phase 4: 웹쿼리 에디터 (Week 4-6) — 핵심

#### UX 핵심: "SQL 먼저, 권한은 나중에"

- SQL 에디터에 DataSource/Schema 선택 UI를 상단에 배치
- 권한이 없어도 SQL 작성 가능, 실행 시 권한 검증
- 권한 없는 테이블 실행 시: 부족 테이블 목록 + 개별 [신청] / [일괄 신청] 버튼 표시
- 보유 권한이 전혀 없는 경우: Empty State + [권한 신청하러 가기] CTA

#### 테이블 탐색기 (사이드패널)

에디터 좌측에 선택된 DataSource > Schema의 테이블 목록을 트리로 표시:

- 🔓 권한 있는 테이블 — 클릭 시 컬럼 목록 펼침
- 🔒 권한 없는 테이블 — 클릭 시 [권한 신청] 유도
- 자동완성은 🔓 테이블만 대상

**API 서비스:**

- `src/api/query/post-query-execute.ts` — SQL 실행 mutation (DataSource/Schema 지정)
- `src/api/query/get-query-history.ts` — 실행 이력 queryOptions
- `src/api/datasources/get-datasource-tables.ts` — 테이블 탐색기용 (Phase 2에서 생성, 재사용)
- `src/api/datasources/get-datasource-metadata.ts` — 자동완성용 메타데이터 (보유 권한 테이블 + 컬럼)

**상태 관리:**

- `src/stores/query-store.ts` — Zustand store
  - 선택된 DataSource/Schema (localStorage persist)
  - SQL 에디터 내용 (localStorage persist)
  - 실행 결과 (대용량, 일회성이므로 React Query 대신 Zustand)
  - 최근 쿼리 목록

**페이지 — `src/app/routes/app/query/editor.tsx`:**

- **DataSource/Schema 선택기** — `DataSourceSchemaPicker` 공용 컴포넌트 (Phase 2에서 생성)
- **테이블 탐색기 패널** — 🔓/🔒 상태 표시, 컬럼 목록 펼침
- **Monaco Editor** (`@monaco-editor/react`)
  - SQL 구문 하이라이팅
  - 선택된 DataSource > Schema 범위 내 DB 메타데이터 기반 자동완성 (섹션 4 상세 명세 참고)
  - Ctrl+Enter 실행 단축키
  - DML 클라이언트 사전 체크 (서버가 최종 강제)
  - 라이트 테마 고정 (`vs` 테마)
- **PermissionErrorPanel** — 권한 없는 테이블 실행 시 표시
  - 부족 테이블 목록 + 개별 [신청] 버튼
  - [일괄 권한 신청 →] 버튼 (권한 신청 화면으로 DataSource/Schema/Tables 전달)
- **EmptyPermissionState** — 보유 권한이 전혀 없는 경우 (DS 선택 후)
  - "조회 가능한 테이블이 없습니다" + [권한 신청하러 가기 →] CTA
- **QueryReasonDialog** — 개인정보 컬럼 포함 시 사유 입력 팝업 (`useDisclosure` 활용)
- **QueryResultGrid** — TanStack Table + Virtual Scroll
  - 동적 컬럼 생성 (쿼리 결과 기반)
  - 마스킹 값 시각적 표시 (`***-**-1234`)
  - 셀/행 복사 (마스킹 컬럼 제외)
  - 건수 제한 경고
- **Resizable 분할 패널** — 탐색기 | 에디터 | 결과 영역 (Supabase SQL Editor 스타일)

**페이지 — `src/app/routes/app/query/history.tsx`:**

- 전체 실행 이력 테이블 (DataSource, Schema, 일시, SQL, 건수, 소요시간)
- 날짜 범위 필터, DataSource 필터

**추가 훅/컴포넌트:**

- `src/hooks/use-monaco.ts` — Monaco 초기화/설정 (DataSource/Schema별 메타데이터 연동)
- `src/hooks/use-keyboard-shortcut.ts` — 단축키
- `src/components/table-explorer.tsx` — 테이블 탐색기 (🔓/🔒 + 컬럼 트리)
- `src/components/permission-error-panel.tsx` — 권한 부족 안내 패널
- `src/components/empty-permission-state.tsx` — 빈 권한 상태 CTA

**Vite 설정:** Monaco 웹 워커 번들링 설정 필요

---

### Phase 5: 관리자 페이지 (Week 6-7)

**API 서비스:**

- `src/api/admin/get-admin-users.ts`
- `src/api/admin/get-admin-datasources.ts` — DataSource 목록 (관리자용, 전체)
- `src/api/admin/post-admin-datasources.ts` — DataSource 등록
- `src/api/admin/put-admin-datasources-{id}.ts` — DataSource 수정
- `src/api/admin/delete-admin-datasources-{id}.ts` — DataSource 삭제
- `src/api/admin/post-admin-datasources-{id}-test.ts` — 연결 테스트
- `src/api/admin/post-admin-datasources-{id}-sync.ts` — 메타데이터 동기화
- `src/api/admin/get-admin-permissions-status.ts`
- `src/api/admin/get-admin-audit-logs.ts`

**페이지:**

- `src/app/routes/app/admin/datasources.tsx` — **DataSource 관리** (신규)
  - DataSource 목록 (이름, 호스트, 상태 뱃지)
  - 등록/수정 Dialog (호스트, 포트, 드라이버 타입, 인증 정보)
  - [연결 테스트] 버튼 — 성공/실패 즉시 피드백
  - [메타데이터 동기화] 버튼 — Schema/테이블/컬럼 수집 트리거
  - 마스킹 정책 설정: DataSource > Schema > Table > Column 드릴다운으로 개인정보 컬럼 지정
- `src/app/routes/app/admin/users.tsx` — 사용자 검색 (사번/이름/부서)
- `src/app/routes/app/admin/permissions.tsx` — 권한 현황 대시보드 (DataSource별 보유 권한, 마스킹 해제, 만료일)
- `src/app/routes/app/admin/audit.tsx` — 감사 로그 뷰어 (접속/쿼리 로그, DataSource 필터, 1년+ 보관)

---

### Phase 6: 통합 및 마무리 (Week 7-8)

- 백엔드 E2E 연동 테스트
- SSO/IAM 연동 (IAM팀 일정 의존)
- 에러 핸들링 엣지 케이스
  - DataSource 연결 실패 시 에디터 안내
  - 메타데이터 동기화 중 에디터 상태
- 로딩 상태 + Skeleton UI
- 번들 분석 및 성능 최적화

---

## 4. Monaco Editor — DB 메타데이터 자동완성 상세 명세

### 데이터 흐름

```
[백엔드 API]                                          [프론트엔드]
GET /api/datasources/{dsId}/schemas/{schema}/metadata
  ├── 테이블 목록 (한글명/영문명, 권한 상태)               │
  └── 컬럼 목록 (타입, 마스킹 여부)                       ▼
                                                   React Query 캐싱
                                                         │
                                                   Monaco CompletionProvider 등록
                                                   (선택된 DataSource/Schema 범위)
                                                         │
                                                   사용자 입력 시 자동완성 제안
```

### 메타데이터 API (백엔드에 요청 필요)

```typescript
// GET /api/datasources/{dsId}/schemas/{schema}/metadata
// — 선택된 DataSource > Schema 범위 내 메타데이터
type SchemaMetadata = {
  datasourceId: number
  datasourceName: string // e.g., '정보계-Oracle'
  schema: string // e.g., 'hdmf_prod'
  tables: TableMetadata[]
}

type TableMetadata = {
  tableName: string // 영문 테이블명
  tableComment: string // 한글 테이블명
  hasPermission: boolean // 사용자 보유 권한 여부 (🔓/🔒)
  columns: {
    name: string // 컬럼명
    type: string // 데이터 타입 (VARCHAR, NUMBER 등)
    comment: string // 한글 컬럼 설명
    isMasked: boolean // 마스킹 대상 여부
  }[]
}
```

### Monaco 자동완성 구현

```typescript
// src/hooks/use-monaco.ts

import * as monaco from 'monaco-editor'

// 1. CompletionItemProvider 등록
// — 선택된 DataSource/Schema가 변경될 때마다 Provider 재등록
monaco.languages.registerCompletionItemProvider('sql', {
  triggerCharacters: ['.', ' '],

  provideCompletionItems: (model, position) => {
    const textUntilPosition = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    })

    const suggestions: monaco.languages.CompletionItem[] = []

    // 2. '.' 입력 시 → 해당 테이블의 컬럼 목록 제안
    const dotMatch = textUntilPosition.match(/(\w+)\.\s*$/)
    if (dotMatch) {
      const tableName = dotMatch[1]
      const table = metadata.tables.find((t) => t.tableName === tableName)
      if (table) {
        table.columns.forEach((col) => {
          suggestions.push({
            label: col.name,
            kind: monaco.languages.CompletionItemKind.Field,
            detail: `${col.type} — ${col.comment}${col.isMasked ? ' 🔒마스킹' : ''}`,
            insertText: col.name,
          })
        })
      }
      return { suggestions }
    }

    // 3. FROM/JOIN 키워드 뒤 → 테이블 목록 제안 (권한 있는 테이블 우선)
    const fromMatch = textUntilPosition.match(/(?:FROM|JOIN)\s+(\w*)$/i)
    if (fromMatch) {
      // 권한 있는 테이블 먼저, 없는 테이블은 🔒 표시
      const sorted = [...metadata.tables].sort(
        (a, b) => (b.hasPermission ? 1 : 0) - (a.hasPermission ? 1 : 0)
      )
      sorted.forEach((table) => {
        suggestions.push({
          label: table.tableName,
          kind: monaco.languages.CompletionItemKind.Class,
          detail: `${table.hasPermission ? '🔓' : '🔒'} ${table.tableComment}`,
          insertText: table.tableName,
          sortText: table.hasPermission ? `0${table.tableName}` : `1${table.tableName}`,
        })
      })
      return { suggestions }
    }

    // 4. 기본: SQL 키워드 + 테이블명 모두 제안
    SQL_KEYWORDS.forEach((kw) => {
      suggestions.push({
        label: kw,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: kw,
      })
    })
    metadata.tables
      .filter((t) => t.hasPermission)
      .forEach((table) => {
        suggestions.push({
          label: table.tableName,
          kind: monaco.languages.CompletionItemKind.Class,
          detail: table.tableComment,
          insertText: table.tableName,
        })
      })

    return { suggestions }
  },
})
```

### 자동완성 시나리오

| 입력 상황   | 제안 내용                                                  |
| ----------- | ---------------------------------------------------------- |
| `SELECT `   | SQL 키워드 + 권한 보유 테이블명                            |
| `FROM `     | 전체 테이블 목록 (🔓권한 있음 우선, 🔒권한 없음 하위 표시) |
| `JOIN `     | 전체 테이블 목록 (🔓/🔒 상태 표시)                         |
| `테이블명.` | 해당 테이블의 컬럼 목록 (타입 + 한글 설명 + 마스킹 표시)   |
| `WHERE `    | 컬럼명 제안 (FROM 절 파싱하여 관련 테이블 컬럼)            |

### 메타데이터 캐싱 전략

- React Query로 `GET /api/datasources/{dsId}/schemas/{schema}/metadata` 결과 캐싱
- `staleTime: 5분` — 메타데이터는 자주 변하지 않음
- DataSource/Schema 변경 시 새 키로 자동 캐싱
- 권한 변경 시 (신규 승인) `queryClient.invalidateQueries(['datasourceMetadata', dsId, schema])` 호출
- Monaco Provider는 캐싱된 데이터를 동기적으로 참조

---

## 5. 주요 기술 결정

| 영역             | 결정                                             | 근거                                                                                                   |
| ---------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| 디자인 레퍼런스  | Supabase Dashboard (라이트 모드)                 | 사이드바+콘텐츠 구조, 미니멀 데이터 테이블, SQL 에디터                                                 |
| 테마             | **라이트 모드 전용**                             | 다크 모드 미지원 (요구사항 외)                                                                         |
| 권한 계층 모델   | DataSource > Schema > Table > Column > Operation | PRD v0.3 확정. 신청/검증/자동완성 모두 이 계층 기반                                                    |
| SQL 에디터       | `@monaco-editor/react`                           | VS Code 엔진, 빌트인 SQL 지원, `registerCompletionItemProvider`로 DB 메타데이터 자동완성               |
| 에디터 테마      | `vs` (라이트)                                    | 다크 모드 미사용에 맞춤                                                                                |
| 결과 그리드      | TanStack Table + Virtual                         | 헤드리스(shadcn 스타일 호환), 경량, 기존 TanStack 생태계                                               |
| 쿼리 상태        | Zustand store                                    | DataSource/Schema 선택 + 대용량 결과, localStorage persist                                             |
| 서버 상태        | React Query                                      | 기존 패턴 유지 (queryOptions + useSuspenseQuery)                                                       |
| 사유 입력 플로우 | 서버 응답 기반 2단계                             | 서버가 개인정보 컬럼 감지 → 프론트 팝업 → 사유 포함 재실행                                             |
| 권한 부족 UX     | 에디터 내 인라인 안내 + 바로 신청                | SQL 작성은 자유, 실행 시 부족 테이블 안내 + [신청] 유도 (PRD 4.2 원칙)                                 |
| 역할 관리        | auth store에 role 추가                           | 프론트는 UI 노출 제어만, 권한 강제는 백엔드                                                            |
| 알림             | 폴링 (30-60초)                                   | MVP 단순성, 추후 WebSocket/SSE 고도화 가능                                                             |
| 폐쇄망 대응      | npm 패키지만 사용 (CDN X)                        | 내부 Nexus registry, Monaco 워커도 번들링                                                              |
| API 모킹         | MSW (Mock Service Worker) 2.x                    | Service Worker 기반 네트워크 레벨 인터셉트. 앱 코드 무수정 전환, dynamic import로 프로덕션 번들 미포함 |

---

## 6. API 모킹 (MSW)

백엔드 API 준비 전까지 MSW 2.x로 프론트엔드 독립 개발을 진행한다. 상세 가이드: [`docs/api-mocking.md`](./api-mocking.md)

### 제어 방법

```bash
# .env
VITE_APP_ENABLE_API_MOCKING=true    # 모킹 ON
# VITE_APP_ENABLE_API_MOCKING=true  # 모킹 OFF (주석 처리)
```

### 구조

```
src/mocks/
├── browser.ts              # setupWorker
├── index.ts                # initMocks() — 조건부 초기화
├── data/                   # Mock 데이터 (fixtures)
│   ├── auth.ts, datasources.ts, schemas.ts, tables.ts, permissions.ts
└── handlers/               # MSW 요청 핸들러
    ├── index.ts, auth.ts, datasources.ts, permissions.ts
```

### 핵심 정책

- **환경변수 제어**: `ENABLE_API_MOCKING=true`일 때만 MSW 동작
- **Dynamic import**: 프로덕션 빌드에 mock 코드 미포함
- **와일드카드 URL**: 핸들러 경로에 `*/api/...` 패턴 사용 (cross-origin 대응)
- **부분 모킹**: `onUnhandledRequest: 'bypass'`로 핸들러 없는 API는 실서버 통과
- **Phase별 확장**: 각 Phase 구현 시 해당 API의 mock 데이터/핸들러 추가

### Phase별 Mock 핸들러 범위

| Phase   | 핸들러                                                                           |
| ------- | -------------------------------------------------------------------------------- |
| Phase 1 | `auth` (login, me, refresh)                                                      |
| Phase 2 | `datasources` (목록, schemas, tables, columns), `permissions` (신청, 목록, 상세) |
| Phase 3 | `permissions` 확장 (승인, 반려)                                                  |
| Phase 4 | `query` (SQL 실행, 이력), `datasources/metadata` (자동완성)                      |
| Phase 5 | `admin` (사용자, DataSource 관리, 권한현황, 감사로그)                            |

---

## 7. 역할 기반 접근 제어 (프론트엔드)

```
USER     → 권한 신청, 내 신청 목록, 웹쿼리, 쿼리 이력
APPROVER → USER + 결재 대기함/상세
ADMIN    → 전체 + 관리자 페이지 (사용자, DataSource 관리, 권한현황, 감사로그)
```

프론트엔드는 **UI 노출만 제어**, 실제 권한 검증은 백엔드가 담당.

---

## 8. 검증 방법

1. **Phase별 빌드 검증**: `pnpm build` 통과 확인
2. **라우트 검증**: 각 경로 접근 시 올바른 페이지 렌더링
3. **Supabase 스타일 레이아웃**: 사이드바 토글, breadcrumb 동작
4. **역할 기반 네비게이션**: USER/APPROVER/ADMIN 각각 메뉴 노출 확인
5. **Idle timeout**: 비활성 시간 경과 후 자동 로그아웃 동작
6. **DataSource 계층 드릴다운**: DS 선택 → Schema 선택 → 테이블 검색 플로우 검증
7. **권한 없는 상태 UX**: 빈 권한 Empty State, 실행 시 부족 테이블 안내 + [신청] 동작
8. **Monaco 에디터**: SQL 하이라이팅, DataSource/Schema 범위 내 자동완성 (🔓/🔒 표시), Ctrl+Enter 실행
9. **결과 그리드**: 가상 스크롤 성능, 마스킹 표시, 복사 기능
10. **권한 신청 → 결재 → 승인 후 에디터 🔒→🔓 전환** E2E 플로우 테스트
11. **관리자 DataSource 관리**: 등록/연결 테스트/메타데이터 동기화/마스킹 정책 설정
12. **번들 분석**: Monaco lazy loading 확인, 전체 번들 크기 점검
