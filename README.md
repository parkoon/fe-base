# fe-base

React 19 기반의 프론트엔드 보일러플레이트입니다. 타입 안전한 API 통신, 인증 시스템, 코드 품질 도구가 설정되어 있습니다.

## 기술 스택

| 카테고리         | 기술                                        |
| ---------------- | ------------------------------------------- |
| **Core**         | React 19, TypeScript 5.9, Vite 7            |
| **Routing**      | React Router 7                              |
| **State**        | Zustand (클라이언트), TanStack Query (서버) |
| **Styling**      | Tailwind CSS 4                              |
| **API**          | Axios + OpenAPI TypeScript                  |
| **Code Quality** | ESLint, Prettier, Husky, lint-staged        |
| **Utils**        | dayjs, zod, clsx, tailwind-merge            |

## 빠른 시작

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경변수 설정
cp .env.example .env

# 3. 개발 서버 시작
pnpm dev
```

**.env 필수 설정:**

```env
VITE_APP_API_URL=http://localhost:8080
```

## 프로젝트 구조

```
src/
├── api/                    # API 레이어
│   ├── dummyjson.ts        # API 클라이언트 인스턴스
│   ├── auth/               # 인증 API (login, refresh, me)
│   └── todos/              # Todo API (CRUD)
├── app/                    # 앱 진입점
│   ├── index.tsx           # 앱 루트
│   ├── provider.tsx        # 전역 Provider 구성
│   ├── router.tsx          # 라우트 정의
│   └── routes/             # 페이지 컴포넌트
│       ├── app/            # 인증 필요 페이지 (/app/*)
│       ├── auth/           # 인증 페이지 (/auth/*)
│       └── landing.tsx     # 랜딩 페이지 (/)
├── components/             # 재사용 컴포넌트
│   ├── ui/                 # 기본 UI (Button, Spinner)
│   ├── errors/             # 에러 바운더리
│   └── seo/                # SEO (Head)
├── config/                 # 설정
│   ├── env.ts              # 환경변수 (Zod 검증)
│   └── paths.ts            # 라우트 경로 상수
├── hooks/                  # 커스텀 훅
├── lib/                    # 핵심 라이브러리
│   ├── api/                # API 클라이언트 팩토리
│   ├── auth/               # 인증 로직 (store, interceptor)
│   ├── react-query.ts      # QueryClient 설정
│   └── dayjs.ts            # dayjs 설정 (한국어, 타임존)
├── types/                  # 타입 정의
│   └── dummyjson.d.ts      # OpenAPI 자동 생성 타입
└── utils/                  # 유틸리티
    └── cn.ts               # className 병합 (clsx + tailwind-merge)
```

## 핵심 아키텍처

### 1. API 레이어 (타입 안전한 API 호출)

OpenAPI 스펙에서 타입을 자동 생성하여 타입 안전한 API 호출을 보장합니다.

```bash
# swagger.json에서 타입 생성
pnpm codegen
```

**API 클라이언트 사용:**

```typescript
// src/api/dummyjson.ts
import { createApiClient } from '@/lib/api'
import type { paths } from '@/types/dummyjson'

export const dummyjson = createApiClient<paths>('https://dummyjson.com')

// 자동완성 + 타입 체크
dummyjson.GET('/todos') // 반환 타입 자동 추론
dummyjson.POST('/todos/add', { todo: 'test', completed: false, userId: 1 })
dummyjson.PATCH('/todos/{id}', { completed: true }, { path: { id: 1 } })
```

**Query 함수 작성 패턴:**

```typescript
// src/api/todos/get-todos.ts
import { queryOptions } from '@tanstack/react-query'

export const getTodosService = () => dummyjson.GET('/todos')

export const getTodosQueryOptions = () =>
  queryOptions({
    queryKey: ['getTodos'],
    queryFn: getTodosService,
  })
```

### 2. 인증 시스템

JWT 기반 인증이 구현되어 있습니다. Access Token 만료 시 자동으로 Refresh Token으로 갱신합니다.

**인증 상태 관리 (Zustand):**

```typescript
import { useAuthStore } from '@/lib/auth'

// 컴포넌트에서 사용
const user = useAuthStore((s) => s.user)
const logout = useAuthStore((s) => s.logout)
```

**인증 흐름:**

1. 로그인 → accessToken, refreshToken 저장 (localStorage)
2. API 요청 → Authorization 헤더 자동 추가 (interceptor)
3. 401 응답 → refreshToken으로 토큰 갱신 후 재요청
4. 갱신 실패 → 로그아웃 및 로그인 페이지로 리다이렉트

**라우트 보호:**

```typescript
// 인증 필요 페이지
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// 비로그인 전용 페이지 (로그인 시 /app으로 리다이렉트)
<PublicRoute>
  <Login />
</PublicRoute>
```

### 3. 라우팅 + 데이터 프리페칭

React Router 7의 `lazy`와 `clientLoader`를 사용하여 코드 스플리팅과 데이터 프리페칭을 동시에 처리합니다.

```typescript
// src/app/routes/app/todos.tsx
export const clientLoader = (queryClient: QueryClient) => async () => {
  // 라우트 진입 전 데이터 프리페치 (waterfall 방지)
  await queryClient.ensureQueryData(getTodosQueryOptions())
  return null
}

export function Component() {
  // 프리페치된 데이터 즉시 사용 (로딩 없음)
  const { data } = useSuspenseQuery(getTodosQueryOptions())
  return <TodoList todos={data.todos} />
}
```

### 4. 에러 처리

**AsyncBoundary:**
`Suspense + ErrorBoundary`를 결합한 컴포넌트로, `useSuspenseQuery`와 함께 사용합니다.

```typescript
import { AsyncBoundary } from '@/components/errors'

<AsyncBoundary
  loadingFallback={<Skeleton />}
  FallbackComponent={CustomError}
>
  <TodoList />
</AsyncBoundary>
```

**전역 에러 처리:**

- Query 에러: QueryCache에서 toast로 표시
- Mutation 에러: MutationCache에서 toast로 표시
- 치명적 에러: MainErrorFallback으로 전체 화면 에러 표시

### 5. 환경변수

Zod로 환경변수를 런타임에 검증합니다. 필수 값이 없으면 앱이 시작되지 않습니다.

```typescript
import { env } from '@/config/env'

env.API_URL // string (필수)
env.ENABLE_API_MOCKING // boolean | undefined (선택)
```

**환경변수 추가 시:**

1. `.env.example`에 예시 추가
2. `src/config/env.ts`의 EnvSchema에 타입 추가

## 코드 컨벤션

### Import 정렬

ESLint가 자동으로 import를 정렬합니다:

```typescript
// 1. 외부 패키지
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. 내부 모듈 (@/)
import { Button } from '@/components/ui'
import { useAuthStore } from '@/lib/auth'

// 3. 상대 경로
import { TodoItem } from './todo-item'
```

### dayjs 사용

직접 import 금지 (ESLint 에러). 반드시 wrapper 사용:

```typescript
// ❌ 금지
import dayjs from 'dayjs'

// ✅ 권장
import { $dayjs } from '@/lib/dayjs'

$dayjs().format('YYYY-MM-DD')
$dayjs.tz('2024-01-01', 'Asia/Seoul')
```

### 타입 정의

`interface` 대신 `type` 사용:

```typescript
// ❌
interface Props {
  name: string
}

// ✅
type Props = { name: string }
```

### 타입 import

타입은 반드시 `import type` 사용:

```typescript
import type { User } from '@/types'
import { fetchUser } from '@/api/users'
```

## 스크립트

| 명령어              | 설명                                   |
| ------------------- | -------------------------------------- |
| `pnpm dev`          | 개발 서버 시작 (http://localhost:5173) |
| `pnpm build`        | 프로덕션 빌드                          |
| `pnpm preview`      | 빌드 결과물 미리보기                   |
| `pnpm lint`         | ESLint 검사                            |
| `pnpm lint:fix`     | ESLint 자동 수정                       |
| `pnpm format`       | Prettier 포맷팅                        |
| `pnpm format:check` | Prettier 검사만                        |
| `pnpm codegen`      | OpenAPI 타입 생성                      |

## 새 페이지 추가

```typescript
// 1. 라우트 컴포넌트 생성: src/app/routes/app/users.tsx
import { type QueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getUsersQueryOptions } from '@/api/users'
import { AsyncBoundary } from '@/components/errors'

// 프리페치 (선택사항)
export const clientLoader = (queryClient: QueryClient) => async () => {
  await queryClient.ensureQueryData(getUsersQueryOptions())
  return null
}

function UserList() {
  const { data } = useSuspenseQuery(getUsersQueryOptions())
  return <ul>{data.users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}

export function Component() {
  return (
    <AsyncBoundary>
      <UserList />
    </AsyncBoundary>
  )
}

export default Component

// 2. paths.ts에 경로 추가
app: {
  users: {
    path: 'users',
    getHref: () => '/app/users',
  },
}

// 3. router.tsx에 라우트 추가
{
  path: paths.app.users.path,
  lazy: () => import('./routes/app/users').then(convert(queryClient)),
}
```

## 새 API 추가

```typescript
// 1. src/api/users/get-users.ts
import { queryOptions } from '@tanstack/react-query'
import { dummyjson } from '../dummyjson'

export const getUsersService = () => dummyjson.GET('/users')

export const getUsersQueryOptions = () =>
  queryOptions({
    queryKey: ['getUsers'],
    queryFn: getUsersService,
  })

// 2. Mutation 예시: src/api/users/post-users.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dummyjson } from '../dummyjson'

const postUsersService = (body: { name: string; email: string }) =>
  dummyjson.POST('/users/add', body)

export function usePostUsersMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postUsersService,
    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['getUsers'] })
    },
  })
}

// 3. src/api/users/index.ts
export * from './get-users'
export * from './post-users'
```

## 트러블슈팅

### ESLint 에러: dayjs 직접 import 금지

```
import { $dayjs } from '@/lib/dayjs' 사용하세요.
```

→ `@/lib/dayjs`의 `$dayjs`를 사용. 한국어 로케일, 타임존 등이 설정되어 있음.

### 빌드 에러: 환경변수 누락

```
환경변수 설정이 올바르지 않습니다.
- API_URL: Required
```

→ `.env` 파일에 `VITE_APP_API_URL` 설정 필요.

### API 타입 오류

```
Property 'xxx' does not exist on type 'paths'
```

→ `pnpm codegen` 실행하여 타입 재생성.
