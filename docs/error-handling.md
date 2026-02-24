# 에러 처리

이 문서에서는 프로젝트의 에러 처리 전략을 설명합니다.

---

## 에러 처리 계층

```
┌─────────────────────────────────────────────────────────────┐
│                    ErrorBoundary (전역)                      │
│  MainErrorFallback - 앱 전체 크래시 시 표시                    │
├─────────────────────────────────────────────────────────────┤
│                QueryErrorBoundary (컴포넌트)                  │
│  ErrorFallback - 특정 컴포넌트 에러 시 표시                    │
├─────────────────────────────────────────────────────────────┤
│                   QueryCache.onError                        │
│  Background refetch 실패 시 토스트 알림                       │
├─────────────────────────────────────────────────────────────┤
│                  MutationCache.onError                      │
│  Mutation 에러 시 토스트 알림                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. 전역 에러 바운더리

앱 전체를 감싸는 에러 바운더리입니다.

### 설정

```tsx
// src/app/provider.tsx
import { ErrorBoundary } from 'react-error-boundary'
import { MainErrorFallback } from '@/components/errors'

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      {/* ... 다른 프로바이더 */}
      {children}
    </ErrorBoundary>
  )
}
```

### MainErrorFallback

```tsx
// src/components/errors/main-error-fallback.tsx
import type { FallbackProps } from 'react-error-boundary'
import { Button } from '@/components/ui/button'

export function MainErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div
      className="flex h-screen flex-col items-center justify-center gap-4"
      role="alert"
    >
      <h1 className="text-2xl font-bold text-red-600">문제가 발생했습니다</h1>
      <p className="text-gray-600">
        {(error as Error).message ?? '알 수 없는 오류가 발생했습니다.'}
      </p>
      <Button onClick={resetErrorBoundary}>다시 시도</Button>
    </div>
  )
}
```

---

## 2. Query 에러 바운더리

특정 컴포넌트의 데이터 로딩 에러를 처리합니다.

### QueryErrorBoundary

```tsx
// src/components/errors/query-error-boundary.tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from './error-fallback'

export function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          FallbackComponent={ErrorFallback}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

### ErrorFallback (인라인)

```tsx
// src/components/errors/error-fallback.tsx
import type { FallbackProps } from 'react-error-boundary'
import { Button } from '@/components/ui/button'

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-6 text-center"
      role="alert"
    >
      <p className="text-sm text-red-600">
        {(error as Error).message ?? '데이터를 불러오는데 실패했습니다.'}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={resetErrorBoundary}
      >
        다시 시도
      </Button>
    </div>
  )
}
```

### 사용 예시

```tsx
import { Suspense } from 'react'
import { QueryErrorBoundary } from '@/components/errors'
import { Spinner } from '@/components/ui'

function TodosPage() {
  return (
    <div>
      <h1>Todos</h1>

      {/* 특정 섹션만 에러 바운더리로 감싸기 */}
      <QueryErrorBoundary>
        <Suspense fallback={<Spinner />}>
          <TodoList />
        </Suspense>
      </QueryErrorBoundary>

      {/* 다른 섹션은 영향 받지 않음 */}
      <SomeOtherSection />
    </div>
  )
}
```

---

## 3. React Query 에러 캐시

### QueryCache.onError

Background refetch 실패 시 토스트를 표시합니다:

```typescript
// src/lib/react-query.ts
const queryCache = new QueryCache({
  onError: (error, query) => {
    // 초기 로딩 실패는 ErrorBoundary가 처리
    // Background refetch 실패만 토스트로 알림
    if (query.state.data !== undefined) {
      const message =
        error instanceof ApiError ? error.message : '데이터를 새로고침하는데 실패했습니다.'
      toast.error(message)
    }
  },
})
```

**동작 흐름:**

```
1. 초기 로딩 성공 → 데이터 캐시됨
2. Background refetch 시도
3. 실패 → 토스트 알림 (UI는 캐시된 데이터 유지)
```

### MutationCache.onError

모든 Mutation 에러에 토스트를 표시합니다:

```typescript
const mutationCache = new MutationCache({
  onError: (error) => {
    const message = error instanceof ApiError ? error.message : '요청 처리 중 오류가 발생했습니다.'
    toast.error(message)
  },
})
```

---

## 4. API 에러 클래스

### ApiError

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

  get isUnauthorized() {
    return this.status === 401
  }

  get isForbidden() {
    return this.status === 403
  }

  get isNotFound() {
    return this.status === 404
  }
}
```

### 사용 예시

```typescript
try {
  await dummyjson.GET('/users/999')
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isNotFound) {
      console.log('사용자를 찾을 수 없습니다')
    } else if (error.isUnauthorized) {
      console.log('로그인이 필요합니다')
    }
  }
}
```

---

## 5. 재시도 전략

### shouldRetry

서버 에러와 네트워크 에러만 재시도합니다:

```typescript
// src/lib/react-query.ts
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  // 최대 3회 재시도
  if (failureCount >= 3) return false

  // 서버 에러(5xx)만 재시도
  if (error instanceof ApiError) {
    return error.isServerError
  }

  // 네트워크 에러도 재시도
  if (error instanceof Error && error.message === 'Network Error') {
    return true
  }

  // 4xx 에러는 재시도 안함 (클라이언트 에러)
  return false
}
```

### 지수 백오프

```typescript
const getRetryDelay = (attemptIndex: number): number => {
  // 1회: 1초, 2회: 2초, 3회: 4초... (최대 30초)
  return Math.min(1000 * 2 ** attemptIndex, 30000)
}
```

---

## 6. 조건부 에러 전파

특정 에러만 ErrorBoundary로 전파하고 싶을 때:

```typescript
const { data } = useQuery({
  ...getUserQueryOptions(userId),
  // 404만 ErrorBoundary로, 나머지는 컴포넌트에서 처리
  throwOnError: (error) => {
    return error instanceof ApiError && error.isNotFound
  },
})
```

---

## 7. 토스트 알림

sonner를 사용한 토스트 알림:

```tsx
// src/app/provider.tsx
import { Toaster } from 'sonner'

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        closeButton
      />
    </>
  )
}
```

### Mutation에서 수동 토스트

```tsx
import { toast } from 'sonner'

const handleSubmit = async () => {
  toast.promise(loginMutation.mutateAsync(formData), {
    loading: '로그인 중...',
    success: '로그인 성공!',
    error: (err) => err.message || '로그인 실패',
  })
}
```

---

## 에러 처리 흐름 요약

### Query (GET)

```
1. 초기 로딩 실패
   → throwOnError: true (기본값)
   → ErrorBoundary가 ErrorFallback 렌더링
   → "다시 시도" 버튼 클릭 → 재시도

2. Background refetch 실패
   → QueryCache.onError
   → 토스트 알림
   → 캐시된 데이터 유지
```

### Mutation (POST/PUT/DELETE)

```
1. Mutation 실패
   → MutationCache.onError
   → 토스트 알림
   → mutationConfig.onError (추가 처리)
```

### 401 Unauthorized

```
1. 요청 → 401 응답
2. 인터셉터가 refresh token 시도
3-a. 성공 → 새 토큰 저장 → 원래 요청 재시도
3-b. 실패 → logout → 로그인 페이지로 리다이렉트
```
