# P0 (MVP) 프론트엔드 구현 계획: 정보계 DB 권한관리 + 웹쿼리

> **버전:** v1.0 | **작성일:** 2026.03.23 | **작성:** 서비스개발실
> **상태:** Approved | **기반 문서:** PRD v0.2

---

## Context

현업 사용자가 정보계 DB에 직접 접근하여 보안 통제가 불가능한 구조적 문제를 해결하기 위해, 웹 기반 SQL 에디터(웹쿼리)와 권한관리 시스템을 통합 구축한다. 모든 접근은 **권한 신청 → 3단계 결재 → 자동 부여/회수** 플로우를 거치며, 쿼리 실행 시 마스킹·건수 제한·이력 적재가 자동 적용된다.

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

- shadcn/ui `Sidebar` 컴포넌트 활용 (collapsible 지원)
- 사이드바 너비: 기본 240px, 축소 시 아이콘만 표시
- 콘텐츠 영역: `max-w-screen-2xl` 또는 full-width (에디터 페이지)

---

## 2. 라우트 구조

```
/app                              -- 대시보드 (기존)
/app/permissions/request          -- 권한 신청 (테이블 검색 + 폼)
/app/permissions/my               -- 내 신청 목록
/app/permissions/my/:id           -- 신청 상세 (결재 진행 상태)
/app/approvals                    -- 결재 대기함 (결재자 전용)
/app/approvals/:id                -- 결재 상세 (승인/반려)
/app/query                        -- 웹쿼리 SQL 에디터
/app/query/history                -- SQL 실행 이력
/app/admin/users                  -- 사용자 관리 (관리자)
/app/admin/permissions            -- 권한 현황 (관리자)
/app/admin/audit                  -- 감사 로그 (관리자)
```

---

## 3. 구현 Phase

### Phase 1: 기반 셋업 (Week 1-2)

**수정할 파일:**

- `src/config/paths.ts` — 새 라우트 경로 추가
- `src/app/router.tsx` — 라우트 등록 (기존 `convert(queryClient)` 패턴 활용)
- `src/app/routes/app/root.tsx` — Supabase 스타일 사이드바 레이아웃으로 전환
- `src/app/provider.tsx` — idle timeout 통합
- `src/lib/auth/store.ts` — 사용자 역할(role) 추가
- `src/config/env.ts` — `VITE_APP_API_URL`, idle timeout 등 환경변수 추가

**새로 만들 파일:**

- `src/api/querypie.ts` — 새 API 클라이언트 (`src/api/dummyjson.ts` 패턴 따름)
- `src/types/manual/permissions.ts` — 권한 관련 타입 (백엔드 OpenAPI 스펙 전까지 수동)
- `src/types/manual/query.ts` — 쿼리 관련 타입
- `src/types/manual/admin.ts` — 관리자 관련 타입
- `src/hooks/use-idle-timeout.ts` — 비활성 자동 로그아웃
- `src/hooks/use-debounce.ts` — 검색 디바운스
- `src/components/app-sidebar.tsx` — Supabase 스타일 사이드바 (역할 기반 메뉴)
- `src/components/role-guard.tsx` — 역할 기반 라우트 보호

**설치할 패키지:**

- `@monaco-editor/react` — SQL 에디터
- `@tanstack/react-table` + `@tanstack/react-virtual` — 결과 그리드

**shadcn/ui 컴포넌트 추가:**

- dialog, textarea, input, select, badge, table, calendar, popover, command, tabs, separator, dropdown-menu, tooltip, sheet, avatar, skeleton, sidebar, resizable, breadcrumb

---

### Phase 2: 권한 신청 플로우 (Week 2-3)

**API 서비스 파일** (`src/api/todos/get-todos.ts` 패턴 따름):

- `src/api/tables/get-tables-search.ts` — `GET /api/tables/search` + queryOptions
- `src/api/permissions/post-permissions-request.ts` — 권한 신청 mutation
- `src/api/permissions/get-permissions-requests.ts` — 내 신청 목록 queryOptions
- `src/api/permissions/get-permissions-requests-{id}.ts` — 신청 상세 queryOptions

**페이지:**

- `src/app/routes/app/permissions/request.tsx`
  - `TableSearchCombobox` — 디바운스 검색 + 자동완성 (한글/영문 테이블명)
  - 신청 폼: 테이블 선택, 사유(필수), 기간(필수), 컬럼 선택(선택)
- `src/app/routes/app/permissions/my.tsx`
  - Supabase 스타일 데이터 테이블 + 상태 필터 (1차대기/1차완료/2차대기/최종승인/반려)
  - 상태별 컬러 뱃지
- `src/app/routes/app/permissions/detail.tsx`
  - 신청 상세 + `ApprovalTimeline` (3단계 결재 진행 시각화)

**공유 컴포넌트:**

- `src/components/table-search-combobox.tsx`
- `src/components/status-badge.tsx` — 결재 상태 뱃지
- `src/components/approval-timeline.tsx` — 결재 타임라인
- `src/components/date-range-picker.tsx`

---

### Phase 3: 결재 플로우 (Week 3-4)

**API 서비스:**

- `src/api/permissions/post-permissions-approve-{id}.ts` — 승인 mutation
- `src/api/permissions/post-permissions-reject-{id}.ts` — 반려 mutation (사유 필수)

**페이지:**

- `src/app/routes/app/approvals/index.tsx` — 결재 대기 목록 (대기/완료/전체 필터)
- `src/app/routes/app/approvals/detail.tsx` — 결재 상세 + 승인/반려 액션 패널

**추가:**

- `src/components/notification-bell.tsx` — 알림 벨 (폴링 방식, 30-60초 간격)
- 전결/대결 UI 표시

---

### Phase 4: 웹쿼리 에디터 (Week 4-6) — 핵심

**API 서비스:**

- `src/api/query/post-query-execute.ts` — SQL 실행 mutation
- `src/api/query/get-query-history.ts` — 실행 이력 queryOptions

**상태 관리:**

- `src/stores/query-store.ts` — Zustand store
  - SQL 에디터 내용 (localStorage persist)
  - 실행 결과 (대용량, 일회성이므로 React Query 대신 Zustand)
  - 최근 쿼리 목록

**페이지 — `src/app/routes/app/query/editor.tsx`:**

- **Monaco Editor** (`@monaco-editor/react`)
  - SQL 구문 하이라이팅
  - DB 메타데이터 기반 자동완성 (섹션 4 상세 명세 참고)
  - Ctrl+Enter 실행 단축키
  - DML 클라이언트 사전 체크 (서버가 최종 강제)
  - 라이트 테마 고정 (`vs` 테마)
- **QueryReasonDialog** — 개인정보 컬럼 포함 시 사유 입력 팝업 (`useDisclosure` 활용)
- **QueryResultGrid** — TanStack Table + Virtual Scroll
  - 동적 컬럼 생성 (쿼리 결과 기반)
  - 마스킹 값 시각적 표시 (`***-**-1234`)
  - 셀/행 복사 (마스킹 컬럼 제외)
  - 건수 제한 경고
- **Resizable 분할 패널** — 에디터/결과 영역 (Supabase SQL Editor 스타일)

**페이지 — `src/app/routes/app/query/history.tsx`:**

- 전체 실행 이력 테이블 (일시, SQL, 건수, 소요시간)
- 날짜 범위 필터

**추가 훅:**

- `src/hooks/use-monaco.ts` — Monaco 초기화/설정
- `src/hooks/use-keyboard-shortcut.ts` — 단축키

**Vite 설정:** Monaco 웹 워커 번들링 설정 필요

---

### Phase 5: 관리자 페이지 (Week 6-7)

**API 서비스:**

- `src/api/admin/get-admin-users.ts`
- `src/api/admin/get-admin-permissions-status.ts`
- `src/api/admin/get-admin-audit-logs.ts`

**페이지:**

- `src/app/routes/app/admin/users.tsx` — 사용자 검색 (사번/이름/부서)
- `src/app/routes/app/admin/permissions.tsx` — 권한 현황 대시보드 (Role, 직접권한, 마스킹 해제, 만료일)
- `src/app/routes/app/admin/audit.tsx` — 감사 로그 뷰어 (접속/쿼리 로그, 필터, 1년+ 보관)

---

### Phase 6: 통합 및 마무리 (Week 7-8)

- 백엔드 E2E 연동 테스트
- SSO/IAM 연동 (IAM팀 일정 의존)
- 에러 핸들링 엣지 케이스
- 로딩 상태 + Skeleton UI
- 번들 분석 및 성능 최적화

---

## 4. Monaco Editor — DB 메타데이터 자동완성 상세 명세

### 데이터 흐름

```
[백엔드 API]                    [프론트엔드]
GET /api/tables/metadata  ──→  React Query 캐싱
  ├── 스키마 목록                    │
  ├── 테이블 목록 (한글명/영문명)     │
  └── 컬럼 목록 (타입 포함)          ▼
                              Monaco CompletionProvider 등록
                                    │
                              사용자 입력 시 자동완성 제안
```

### 메타데이터 API (백엔드에 요청 필요)

```typescript
// GET /api/tables/metadata — 사용자 보유 권한 범위 내 메타데이터
type TableMetadata = {
  schema: string // 스키마명 (e.g., 'hdmf')
  tableName: string // 영문 테이블명
  tableComment: string // 한글 테이블명
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
      const table = metadata.find((t) => t.tableName === tableName)
      if (table) {
        table.columns.forEach((col) => {
          suggestions.push({
            label: col.name,
            kind: monaco.languages.CompletionItemKind.Field,
            detail: `${col.type} — ${col.comment}`,
            insertText: col.name,
          })
        })
      }
      return { suggestions }
    }

    // 3. FROM/JOIN 키워드 뒤 → 테이블 목록 제안
    const fromMatch = textUntilPosition.match(/(?:FROM|JOIN)\s+(\w*)$/i)
    if (fromMatch) {
      metadata.forEach((table) => {
        suggestions.push({
          label: table.tableName,
          kind: monaco.languages.CompletionItemKind.Class,
          detail: table.tableComment, // 한글명 표시
          insertText: table.tableName,
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
    metadata.forEach((table) => {
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

| 입력 상황   | 제안 내용                                       |
| ----------- | ----------------------------------------------- |
| `SELECT `   | SQL 키워드 + 모든 테이블명                      |
| `FROM `     | 권한 보유 테이블 목록 (영문명 + 한글명 표시)    |
| `JOIN `     | 권한 보유 테이블 목록                           |
| `테이블명.` | 해당 테이블의 컬럼 목록 (타입 + 한글 설명)      |
| `WHERE `    | 컬럼명 제안 (FROM 절 파싱하여 관련 테이블 컬럼) |

### 메타데이터 캐싱 전략

- React Query로 `GET /api/tables/metadata` 결과 캐싱
- `staleTime: 5분` — 메타데이터는 자주 변하지 않음
- 권한 변경 시 (신규 승인) `queryClient.invalidateQueries(['tableMetadata'])` 호출
- Monaco Provider는 캐싱된 데이터를 동기적으로 참조

---

## 5. 주요 기술 결정

| 영역             | 결정                             | 근거                                                                                     |
| ---------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| 디자인 레퍼런스  | Supabase Dashboard (라이트 모드) | 사이드바+콘텐츠 구조, 미니멀 데이터 테이블, SQL 에디터                                   |
| 테마             | **라이트 모드 전용**             | 다크 모드 미지원 (요구사항 외)                                                           |
| SQL 에디터       | `@monaco-editor/react`           | VS Code 엔진, 빌트인 SQL 지원, `registerCompletionItemProvider`로 DB 메타데이터 자동완성 |
| 에디터 테마      | `vs` (라이트)                    | 다크 모드 미사용에 맞춤                                                                  |
| 결과 그리드      | TanStack Table + Virtual         | 헤드리스(shadcn 스타일 호환), 경량, 기존 TanStack 생태계                                 |
| 쿼리 상태        | Zustand store                    | 대용량 결과, 일회성 데이터, localStorage persist                                         |
| 서버 상태        | React Query                      | 기존 패턴 유지 (queryOptions + useSuspenseQuery)                                         |
| 사유 입력 플로우 | 서버 응답 기반 2단계             | 서버가 개인정보 컬럼 감지 → 프론트 팝업 → 사유 포함 재실행                               |
| 역할 관리        | auth store에 role 추가           | 프론트는 UI 노출 제어만, 권한 강제는 백엔드                                              |
| 알림             | 폴링 (30-60초)                   | MVP 단순성, 추후 WebSocket/SSE 고도화 가능                                               |
| 폐쇄망 대응      | npm 패키지만 사용 (CDN X)        | 내부 Nexus registry, Monaco 워커도 번들링                                                |

---

## 6. 역할 기반 접근 제어 (프론트엔드)

```
USER     → 권한 신청, 내 신청 목록, 웹쿼리, 쿼리 이력
APPROVER → USER + 결재 대기함/상세
ADMIN    → 전체 + 관리자 페이지 (사용자, 권한현황, 감사로그)
```

프론트엔드는 **UI 노출만 제어**, 실제 권한 검증은 백엔드가 담당.

---

## 7. 검증 방법

1. **Phase별 빌드 검증**: `pnpm build` 통과 확인
2. **라우트 검증**: 각 경로 접근 시 올바른 페이지 렌더링
3. **Supabase 스타일 레이아웃**: 사이드바 토글, 반응형, breadcrumb 동작
4. **역할 기반 네비게이션**: USER/APPROVER/ADMIN 각각 메뉴 노출 확인
5. **Idle timeout**: 비활성 시간 경과 후 자동 로그아웃 동작
6. **Monaco 에디터**: SQL 하이라이팅, DB 메타데이터 자동완성 (테이블명.→컬럼 제안), Ctrl+Enter 실행
7. **결과 그리드**: 가상 스크롤 성능, 마스킹 표시, 복사 기능
8. **권한 신청 → 결재 → 웹쿼리 실행** E2E 플로우 테스트
9. **번들 분석**: Monaco lazy loading 확인, 전체 번들 크기 점검
