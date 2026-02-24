# API 레이어

이 문서에서는 타입 안전한 API 호출 방법과 React Query 통합에 대해 설명합니다.

---

## 개요

이 프로젝트는 **OpenAPI 스펙 기반 타입 자동 생성**을 통해 API 호출 시 완벽한 타입 안전성을 보장합니다.

```
swagger.json
    ↓ (pnpm codegen)
src/types/dummyjson.d.ts (타입 자동 생성)
    ↓
createApiClient<paths>() (타입 주입)
    ↓
dummyjson.GET('/users/{id}', { path: { id: 1 } })  ← 자동완성 지원!
```

---

## API 클라이언트

### 기본 구조

```typescript
// src/api/dummyjson.ts
import { createApiClient } from '@/lib/api'
import { setupAuthInterceptor } from '@/lib/auth'
import type { paths } from '@/types/dummyjson'

export const dummyjson = createApiClient<paths>('https://dummyjson.com')

// 인증 인터셉터 설정
setupAuthInterceptor(dummyjson.instance, {
  refreshTokenFn: async (refreshToken) => {
    const response = await dummyjson.POST('/auth/refresh', { refreshToken })
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    }
  },
})
```

### 사용 가능한 메서드

```typescript
// GET
dummyjson.GET('/users')
dummyjson.GET('/users/{id}', { path: { id: 1 } })
dummyjson.GET('/users', { query: { limit: 10 } })

// POST
dummyjson.POST('/users/add', { firstName: 'John', lastName: 'Doe' })

// PUT
dummyjson.PUT('/users/{id}', { firstName: 'Jane' }, { path: { id: 1 } })

// PATCH
dummyjson.PATCH('/users/{id}', { firstName: 'Jane' }, { path: { id: 1 } })

// DELETE
dummyjson.DELETE('/users/{id}', { path: { id: 1 } })
```

---

## 타입 자동 생성

### 1. OpenAPI 스펙 준비

`swagger.json` 파일을 프로젝트 루트에 배치합니다.

### 2. 타입 생성

```bash
pnpm codegen
```

이 명령어는 `src/types/dummyjson.d.ts`를 생성합니다:

```typescript
// 자동 생성됨
export interface paths {
  '/auth/login': {
    post: {
      requestBody: {
        content: {
          'application/json': {
            username: string
            password: string
          }
        }
      }
      responses: {
        200: {
          content: {
            'application/json': {
              id: number
              username: string
              accessToken: string
              refreshToken: string
            }
          }
        }
      }
    }
  }
  // ... 나머지 엔드포인트
}
```

---

## API 코드 패턴

### Query (GET 요청)

```typescript
// src/api/auth/get-auth-me.ts
import { queryOptions } from '@tanstack/react-query'

import type { QueryConfig } from '@/lib/react-query'

import { dummyjson } from '../dummyjson'

// 1. Service 함수 (실제 API 호출)
export const getAuthMeService = () => dummyjson.GET('/auth/me')

// 2. Query Options (React Query용)
export const getAuthMeQueryOptions = () =>
  queryOptions({
    queryKey: ['getAuthMe'],
    queryFn: getAuthMeService,
  })

// 3. 타입 export
export type GetAuthMeQueryConfig = QueryConfig<typeof getAuthMeQueryOptions>
```

**Path Parameter가 있는 경우:**

```typescript
// src/api/todos/get-todos-{id}.ts
import type { InferPathParams } from '@/lib/api'
import type { paths } from '@/types/dummyjson'

export const getTodosByIdService = (params: InferPathParams<paths, '/todos/{id}', 'get'>) =>
  dummyjson.GET('/todos/{id}', { path: params })

export const getTodosByIdQueryOptions = (id: InferPathParams<paths, '/todos/{id}', 'get'>['id']) =>
  queryOptions({
    queryKey: ['getTodosById', id],
    queryFn: () => getTodosByIdService({ id }),
  })
```

### Mutation (POST/PUT/PATCH/DELETE)

```typescript
// src/api/auth/post-auth-login.ts
import { useMutation } from '@tanstack/react-query'

import type { InferBody } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

// 1. Service 함수
export const postAuthLoginService = (data: InferBody<paths, '/auth/login', 'post'>) =>
  dummyjson.POST('/auth/login', data)

// 2. Mutation Hook 타입
type UsePostAuthLoginMutationOptions = {
  mutationConfig?: MutationConfig<typeof postAuthLoginService>
}

// 3. Mutation Hook
export function usePostAuthLoginMutation({ mutationConfig }: UsePostAuthLoginMutationOptions = {}) {
  return useMutation({
    mutationFn: postAuthLoginService,
    ...mutationConfig,
  })
}
```

---

## 컴포넌트에서 사용하기

### Query 사용

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'
import { getTodosQueryOptions } from '@/api/todos'

function TodoList() {
  // useSuspenseQuery: 로딩/에러를 부모 Suspense/ErrorBoundary가 처리
  const { data } = useSuspenseQuery(getTodosQueryOptions())

  return (
    <ul>
      {data.todos.map((todo) => (
        <li key={todo.id}>{todo.todo}</li>
      ))}
    </ul>
  )
}

// 사용 시 Suspense로 감싸기
;<Suspense fallback={<Loading />}>
  <TodoList />
</Suspense>
```

### Mutation 사용

```tsx
import { usePostAuthLoginMutation } from '@/api/auth'

function LoginForm() {
  const loginMutation = usePostAuthLoginMutation({
    mutationConfig: {
      onSuccess: (data) => {
        // 로그인 성공 처리
        setUser(data)
      },
    },
  })

  const handleSubmit = (formData) => {
    loginMutation.mutate({
      username: formData.username,
      password: formData.password,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드 */}
      <button disabled={loginMutation.isPending}>
        {loginMutation.isPending ? '로그인 중...' : '로그인'}
      </button>
    </form>
  )
}
```

---

## 데이터 프리페칭 (clientLoader)

라우터의 `clientLoader`를 사용하여 페이지 진입 전에 데이터를 미리 로드할 수 있습니다.

```typescript
// src/app/routes/app/todos.tsx
import { type QueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getTodosQueryOptions } from '@/api/todos'

// 페이지 진입 전 데이터 프리페칭
export const clientLoader = (queryClient: QueryClient) => async () => {
  await queryClient.ensureQueryData(getTodosQueryOptions())
  return null
}

// 컴포넌트
export function Component() {
  const { data } = useSuspenseQuery(getTodosQueryOptions())
  // 이미 캐시에 있으므로 즉시 렌더링
  return <TodoList todos={data.todos} />
}
```

---

## 타입 헬퍼

`src/lib/api/types.ts`에서 제공하는 헬퍼 타입들:

```typescript
import type { InferBody, InferPathParams, InferQueryParams, InferResponse } from '@/lib/api'
import type { paths } from '@/types/dummyjson'

// Request Body 타입 추론
type LoginBody = InferBody<paths, '/auth/login', 'post'>
// { username: string; password: string }

// Path Parameter 타입 추론
type TodoPathParams = InferPathParams<paths, '/todos/{id}', 'get'>
// { id: number }

// Query Parameter 타입 추론
type TodosQueryParams = InferQueryParams<paths, '/todos', 'get'>
// { limit?: number; skip?: number }

// Response 타입 추론
type LoginResponse = InferResponse<paths, '/auth/login', 'post'>
// { id: number; username: string; accessToken: string; ... }
```

---

## API 코드 자동 생성

대화형 CLI를 사용하여 API 코드를 자동 생성할 수 있습니다:

```bash
pnpm api:gen
```

```
🚀 API Code Generator

? Select API path: /todos/{id}
? Select HTTP method: GET

  ✓ Created: src/api/todos/get-todos-{id}.ts
  ✓ Updated: src/api/todos/index.ts

✨ Done!
```

자세한 내용은 [코드 생성](./code-generation.md) 문서를 참고하세요.

---

## 인터셉터

### 토큰 자동 주입

모든 요청에 자동으로 `Authorization` 헤더가 추가됩니다:

```typescript
// 인터셉터 내부 동작
instance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### 토큰 자동 갱신

401 에러 발생 시 자동으로 refresh token으로 토큰을 갱신합니다:

```
1. 요청 → 401 에러
2. refresh token으로 새 토큰 요청
3. 토큰 저장
4. 원래 요청 재시도
```

동시에 여러 요청이 401을 받으면, 한 번만 refresh하고 나머지는 대기합니다.

---

## 에러 처리

API 에러는 `ApiError` 클래스로 래핑됩니다:

```typescript
// src/lib/api/error.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500
  }
  get isServerError() {
    return this.status >= 500
  }
}
```

사용 예시:

```typescript
try {
  await dummyjson.GET('/users/999')
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status) // 404
    console.log(error.message) // 'User not found'
  }
}
```

자세한 에러 처리 방법은 [에러 처리](./error-handling.md) 문서를 참고하세요.
