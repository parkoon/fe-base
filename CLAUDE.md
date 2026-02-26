# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # 개발 서버 (http://localhost:5173)
pnpm build        # 프로덕션 빌드 (tsc + vite build)
pnpm lint         # ESLint 검사
pnpm lint:fix     # ESLint 자동 수정
pnpm format       # Prettier 포맷팅
pnpm codegen      # OpenAPI 타입 생성 (swagger.json → src/types/dummyjson.d.ts)
```

## Architecture

### API Layer (Type-Safe OpenAPI)

`src/lib/api/client.ts`의 `createApiClient<Paths>`가 OpenAPI 스펙에서 생성된 타입을 기반으로 타입 안전한 HTTP 클라이언트를 제공합니다.

```typescript
// src/api/dummyjson.ts - API 인스턴스
export const dummyjson = createApiClient<paths>('https://dummyjson.com')

// 사용: 경로와 파라미터가 자동완성됨
dummyjson.GET('/todos')
dummyjson.PATCH('/todos/{id}', body, { path: { id: 1 } })
```

**API 함수 패턴** (`src/api/{domain}/{method}-{endpoint}.ts`):

```typescript
export const getTodosService = () => dummyjson.GET('/todos')
export const getTodosQueryOptions = () =>
  queryOptions({
    queryKey: ['getTodos'],
    queryFn: getTodosService,
  })
```

### Auth System

- **Store**: `src/lib/auth/store.ts` - Zustand + persist로 토큰 관리
- **Interceptor**: `src/lib/auth/interceptor.ts` - 401시 자동 refresh, 실패시 logout + redirect
- **Components**: `ProtectedRoute`, `PublicRoute` - 라우트 보호
- **AuthLoader**: 앱 시작시 `/auth/me`로 토큰 검증

### Router + Data Prefetching

`src/app/router.tsx`의 `convert()` 함수가 라우트 모듈의 `clientLoader`에 QueryClient를 주입합니다.

```typescript
// 라우트 파일에서 프리페치 정의
export const clientLoader = (queryClient: QueryClient) => async () => {
  await queryClient.ensureQueryData(getTodosQueryOptions())
  return null
}
```

### Error Boundaries

- `AsyncBoundary`: Suspense + QueryErrorBoundary 통합. `useSuspenseQuery`와 함께 사용
- `MainErrorFallback`: 전역 에러 UI
- Query/Mutation 에러는 `src/lib/react-query.ts`의 cache에서 toast로 표시

## Code Conventions

**ESLint 강제 규칙:**

- `type` 사용 (interface 금지): `@typescript-eslint/consistent-type-definitions`
- `import type` 사용: `@typescript-eslint/consistent-type-imports`
- dayjs 직접 import 금지: `import { $dayjs } from '@/lib/dayjs'` 사용
- import 자동 정렬: `simple-import-sort`

**Path Alias:**

- `@/*` → `src/*`

**환경변수:**

- `VITE_APP_` prefix 필수
- `src/config/env.ts`에서 Zod로 검증 (필수값 없으면 앱 시작 실패)
