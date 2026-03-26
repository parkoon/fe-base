# Page Structure Guide

페이지 생성 시 따르는 디렉토리 구조와 리소스 배치 기준을 정리한 문서입니다.

---

## 전체 프로젝트 구조

```
src/
├── api/              # API 서비스 함수 + queryOptions
├── app/
│   ├── router.tsx    # 라우터 등록 (lazy import)
│   └── routes/       # 페이지 컴포넌트 (Next.js 스타일)
├── components/
│   ├── ui/           # shadcn 기반 순수 UI 컴포넌트
│   └── ...           # 앱 공통 컴포넌트 (도메인 로직 포함 가능)
├── config/
│   ├── env.ts        # 환경변수 검증 (Zod)
│   └── paths.ts      # 라우트 경로 상수
├── hooks/            # 전역 커스텀 훅
├── lib/              # 핵심 라이브러리 설정 (api client, auth, dayjs 등)
├── stores/           # 전역 UI 상태 (Zustand)
├── types/            # TypeScript 타입 정의
└── utils/            # 순수 유틸리티 함수
```

---

## 페이지 구조

### 기본 패턴

각 페이지는 `routes/{domain}/{page}/` 디렉토리 아래 독립적으로 구성합니다.

```
routes/
├── landing.tsx               # 단순 페이지 (컴포넌트 없을 경우 flat 파일 허용)
├── not-found.tsx
└── app/
    └── {domain}/
        └── {page}/
            ├── page.tsx          # 페이지 진입점 (default export 필수)
            ├── _components/      # 이 페이지에서만 사용하는 컴포넌트
            ├── _hooks/           # 이 페이지에서만 사용하는 훅
            ├── _context/         # 이 페이지 내 다단계 상태 (Context + Provider)
            └── _utils/           # 이 페이지에서만 사용하는 순수 함수
```

> `_` 접두사 디렉토리 = 해당 페이지에 **종속**됨을 명시적으로 표현.
> 다른 페이지에서 import 금지.

### 실제 예시

```
routes/app/query/
├── editor/
│   ├── page.tsx
│   ├── _hooks/
│   │   └── use-query-execution.ts
│   └── _components/
│       ├── editor-toolbar.tsx
│       ├── sql-editor.tsx
│       ├── result-table.tsx
│       ├── result-empty-states.tsx
│       ├── query-sidebar.tsx
│       ├── query-list.tsx
│       ├── datasource-select.tsx
│       ├── schema-select.tsx
│       ├── limit-select.tsx
│       └── save-query-dialog.tsx
└── history/
    ├── page.tsx
    └── _components/
        ├── query-history-table.tsx
        └── datasource-selector.tsx

routes/app/permissions/
├── my/
│   ├── page.tsx
│   ├── _hooks/
│   │   └── use-permission-filter.ts
│   └── _components/
│       ├── types.ts                    # 이 페이지 전용 타입도 여기에
│       ├── my-permission-filter-tabs.tsx
│       ├── my-permission-table.tsx
│       └── ...
└── request/
    ├── page.tsx
    ├── _context/
    │   └── request-context.tsx         # 다단계 폼 상태
    └── _components/
        ├── request-permission-step-indicator.tsx
        ├── request-permission-step-datasource.tsx
        └── ...
```

### page.tsx 작성 규칙

```tsx
// 1. default export 필수 (router lazy import에서 Component로 사용)
export default function QueryEditorPage() { ... }

// 2. 데이터 프리페치가 필요할 경우 clientLoader 함께 export
export const clientLoader = (queryClient: QueryClient) => async () => {
  await queryClient.ensureQueryData(getQueriesQueryOptions())
  return null
}
```

### 라우터 등록

새 페이지 추가 시 두 곳을 수정합니다.

**`src/config/paths.ts`**

```ts
export const paths = {
  app: {
    newPage: {
      path: 'new-page',
      getHref: () => '/app/new-page',
    },
  },
}
```

**`src/app/router.tsx`**

```ts
{
  path: paths.app.newPage.path,
  lazy: () => import('./routes/app/new-page/page').then(convert(queryClient)),
},
```

---

## 로컬 vs 전역: 배치 기준

| 사용 범위           | 종류             | 배치 위치                      |
| ------------------- | ---------------- | ------------------------------ |
| **1개 페이지**      | 컴포넌트         | `{page}/_components/`          |
| **1개 페이지**      | 훅               | `{page}/_hooks/`               |
| **1개 페이지**      | Context/Provider | `{page}/_context/`             |
| **1개 페이지**      | 순수 함수        | `{page}/_utils/`               |
| **1개 페이지**      | 페이지 전용 타입 | `{page}/_components/types.ts`  |
| **2개 이상 페이지** | 컴포넌트         | `src/components/`              |
| **2개 이상 페이지** | 훅               | `src/hooks/`                   |
| **2개 이상 페이지** | UI 상태          | `src/stores/` (Zustand)        |
| **2개 이상 페이지** | 타입             | `src/types/manual/{domain}.ts` |
| **전체 앱**         | 서버 상태        | React Query (API 레이어)       |

---

## 전역 리소스 작성 가이드

### UI 컴포넌트 (`src/components/ui/`)

shadcn/ui 기반의 순수 프리젠테이션 컴포넌트. 도메인 로직 없음.

```
components/ui/
├── button.tsx
├── input.tsx
├── dialog.tsx
└── ...
```

### 앱 공통 컴포넌트 (`src/components/`)

2개 이상의 페이지에서 쓰이고, 도메인 로직이 포함될 수 있는 컴포넌트.

```tsx
// src/components/role-guard.tsx
// src/components/app-sidebar.tsx
// src/components/date-range-picker.tsx
```

### 전역 훅 (`src/hooks/`)

페이지에 종속되지 않는 범용 훅.

```tsx
// src/hooks/use-disclosure.ts   — 모달 open/close 상태
// src/hooks/use-debounce.ts     — 디바운싱
// src/hooks/use-mobile.ts       — 모바일 여부 감지
```

### 전역 UI 상태 (`src/stores/`)

Zustand 스토어. **서버 데이터는 절대 저장하지 않음** (React Query 사용).

```ts
// src/stores/editor-config-store.ts
export const useEditorConfigStore = create<State>()((set) => ({
  selectedDataSourceId: null,
  setDataSource: (id) => set({ selectedDataSourceId: id, selectedSchema: null }),
}))
```

> 페이지 전용 복잡한 상태는 `_context/` (React Context + Provider) 사용.
> Zustand는 페이지를 넘어서 유지되어야 하는 UI 상태에만 사용.

### API 레이어 (`src/api/`)

Service 함수와 queryOptions를 함께 정의.

```
src/api/{domain}/{method}-{endpoint}.ts
```

```ts
// src/api/queries/get-queries.ts
export const getQueriesService = (): Promise<SavedQuery[]> =>
  querypie.instance.get('/api/queries').then((res) => res.data)

export const getQueriesQueryOptions = () =>
  queryOptions({
    queryKey: ['getQueries'],
    queryFn: getQueriesService,
  })
```

Mutation은 훅으로 정의:

```ts
// src/api/queries/create-query.ts
export const useCreateQueryMutation = () =>
  useMutation({
    mutationFn: (body: CreateQueryBody) =>
      querypie.instance.post('/api/queries', body).then((res) => res.data),
  })
```

### 타입 (`src/types/manual/`)

여러 페이지/도메인에서 공유하는 타입.

```
src/types/manual/
├── query.ts          # QueryResult, QueryHistoryItem ...
├── datasource.ts     # DataSource, SchemaInfo ...
├── permissions.ts    # PermissionRequest, ApprovalStatus ...
└── {domain}.ts
```

> 페이지 전용 타입(예: 필터 상태)은 `{page}/_components/types.ts`에 작성.

### 유틸리티 (`src/lib/` / `src/utils/`)

```
src/lib/utils.ts      # cn() — clsx + tailwind-merge
src/lib/dayjs.ts      # $dayjs (날짜 처리, date-fns 사용 금지)
src/utils/            # 도메인 무관 순수 함수
```

---

## 요약: 새 페이지 추가 체크리스트

```
□ routes/{domain}/{page}/page.tsx 생성
  □ default export 함수 컴포넌트
  □ 필요 시 clientLoader export (데이터 프리페치)

□ src/config/paths.ts에 경로 상수 추가

□ src/app/router.tsx에 lazy import 등록

□ 페이지 전용 리소스
  □ 컴포넌트 → {page}/_components/
  □ 훅       → {page}/_hooks/
  □ Context  → {page}/_context/
  □ 타입     → {page}/_components/types.ts

□ 전역 공유 리소스
  □ API      → src/api/{domain}/{method}-{endpoint}.ts
  □ 타입     → src/types/manual/{domain}.ts
  □ UI 상태  → src/stores/{feature}-store.ts
  □ 공통 컴포넌트 → src/components/
```
