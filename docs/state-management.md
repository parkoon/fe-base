# 상태 관리

이 문서에서는 프로젝트의 상태 관리 전략을 설명합니다.

---

## 상태 분류

효과적인 상태 관리를 위해 상태를 다음과 같이 분류합니다:

| 분류              | 설명                          | 해결책                      |
| ----------------- | ----------------------------- | --------------------------- |
| **컴포넌트 상태** | 단일 컴포넌트 내부 상태       | `useState`, `useReducer`    |
| **전역 상태**     | 여러 컴포넌트가 공유하는 상태 | Zustand                     |
| **서버 상태**     | 서버에서 가져온 데이터        | React Query                 |
| **폼 상태**       | 폼 입력 값과 유효성 검사      | Controlled Components + Zod |
| **URL 상태**      | URL 파라미터와 쿼리 스트링    | React Router                |

---

## 1. 컴포넌트 상태

### useState

단순한 상태에 사용합니다:

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  return <button onClick={() => setCount(count + 1)}>클릭: {count}</button>
}
```

### useReducer

복잡한 상태 로직에 사용합니다:

```tsx
type State = { count: number; step: number }
type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'setStep'; step: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step }
    case 'decrement':
      return { ...state, count: state.count - state.step }
    case 'setStep':
      return { ...state, step: action.step }
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 })

  return (
    <>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  )
}
```

---

## 2. 전역 상태 (Zustand)

### 인증 스토어

프로젝트의 대표적인 전역 상태는 **인증 정보**입니다:

```typescript
// src/lib/auth/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { components } from '@/types/dummyjson'

type AuthResponse = components['schemas']['AuthResponse']

export type AuthState = {
  user: AuthResponse | null
  setUser: (user: AuthResponse | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage', // localStorage 키
    }
  )
)
```

### 사용 방법

```tsx
import { useAuthStore } from '@/lib/auth'

function UserProfile() {
  // 특정 값만 구독 (불필요한 리렌더링 방지)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div>
      <span>{user?.firstName}</span>
      <button onClick={logout}>로그아웃</button>
    </div>
  )
}
```

### 컴포넌트 외부에서 접근

인터셉터 등 React 외부에서 상태에 접근할 때:

```typescript
// src/lib/auth/store.ts
export function getAccessToken(): string | null {
  const state = useAuthStore.getState()
  return state.user?.accessToken ?? null
}

export function getRefreshToken(): string | null {
  const state = useAuthStore.getState()
  return state.user?.refreshToken ?? null
}
```

### persist 미들웨어

상태를 localStorage에 자동 저장합니다:

```typescript
create<AuthState>()(
  persist(
    (set) => ({
      // ... 스토어 정의
    }),
    {
      name: 'auth-storage', // localStorage 키
      // 특정 필드만 저장 (선택)
      partialize: (state) => ({ user: state.user }),
    }
  )
)
```

---

## 3. 서버 상태 (React Query)

서버에서 가져온 데이터는 React Query로 관리합니다.

### 기본 설정

```typescript
// src/lib/react-query.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'

const queryCache = new QueryCache({
  onError: (error, query) => {
    // Background refetch 실패 시에만 토스트 표시
    if (query.state.data !== undefined) {
      toast.error(error.message)
    }
  },
})

const mutationCache = new MutationCache({
  onError: (error) => {
    toast.error(error.message)
  },
})

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60, // 1분
        retry: shouldRetry,
        throwOnError: true, // ErrorBoundary 사용
      },
    },
    queryCache,
    mutationCache,
  })
}
```

### Query 사용

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'
import { getTodosQueryOptions } from '@/api/todos'

function TodoList() {
  const { data } = useSuspenseQuery(getTodosQueryOptions())

  return (
    <ul>
      {data.todos.map((todo) => (
        <li key={todo.id}>{todo.todo}</li>
      ))}
    </ul>
  )
}

// Suspense와 함께 사용
;<Suspense fallback={<Loading />}>
  <TodoList />
</Suspense>
```

### Mutation 사용

```tsx
import { usePostTodosAddMutation } from '@/api/todos'

function AddTodoForm() {
  const addTodoMutation = usePostTodosAddMutation({
    mutationConfig: {
      onSuccess: () => {
        // 성공 시 todos 목록 새로고침
        queryClient.invalidateQueries({ queryKey: ['getTodos'] })
      },
    },
  })

  const handleSubmit = (data: FormData) => {
    addTodoMutation.mutate({
      todo: data.todo,
      completed: false,
      userId: 1,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="todo" />
      <button disabled={addTodoMutation.isPending}>
        {addTodoMutation.isPending ? '추가 중...' : '추가'}
      </button>
    </form>
  )
}
```

### 캐시 무효화

```typescript
import { useQueryClient } from '@tanstack/react-query'

function SomeComponent() {
  const queryClient = useQueryClient()

  const handleRefresh = () => {
    // 특정 쿼리 무효화
    queryClient.invalidateQueries({ queryKey: ['getTodos'] })

    // 모든 쿼리 무효화
    queryClient.invalidateQueries()

    // 특정 쿼리 제거
    queryClient.removeQueries({ queryKey: ['getTodos'] })
  }
}
```

---

## 4. 폼 상태

### Controlled Components + Zod

```tsx
import { useState } from 'react'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(1, '사용자명을 입력하세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginForm() {
  const [form, setForm] = useState<LoginForm>({ username: '', password: '' })
  const [errors, setErrors] = useState<Partial<LoginForm>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const result = loginSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors({
        username: fieldErrors.username?.[0],
        password: fieldErrors.password?.[0],
      })
      return
    }

    // 유효성 검사 통과
    submitLogin(result.data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      {errors.username && <span className="text-red-500">{errors.username}</span>}

      <input
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      {errors.password && <span className="text-red-500">{errors.password}</span>}

      <button type="submit">로그인</button>
    </form>
  )
}
```

---

## 5. URL 상태

### URL 파라미터

```tsx
import { useParams } from 'react-router'

// URL: /users/123
function UserDetail() {
  const { userId } = useParams<{ userId: string }>()

  return <div>사용자 ID: {userId}</div>
}
```

### 쿼리 스트링

```tsx
import { useSearchParams } from 'react-router'

// URL: /users?page=2&limit=10
function UserList() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '10')

  const handleNextPage = () => {
    setSearchParams({ page: String(page + 1), limit: String(limit) })
  }

  return (
    <>
      <div>페이지: {page}</div>
      <button onClick={handleNextPage}>다음 페이지</button>
    </>
  )
}
```

---

## 상태 관리 원칙

### 1. 로컬 우선

상태는 가능한 한 **사용되는 곳 가까이**에 정의합니다:

```tsx
// ✅ 좋음: 컴포넌트 내부에서 관리
function SearchBox() {
  const [query, setQuery] = useState('')
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  )
}

// ❌ 나쁨: 불필요하게 전역으로 관리
const useSearchStore = create((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
}))
```

### 2. 서버 상태는 React Query

서버 데이터를 Zustand에 저장하지 마세요:

```tsx
// ❌ 나쁨: 서버 데이터를 Zustand에 저장
const useTodoStore = create((set) => ({
  todos: [],
  fetchTodos: async () => {
    const data = await fetchTodos()
    set({ todos: data })
  },
}))

// ✅ 좋음: React Query 사용
const { data: todos } = useSuspenseQuery(getTodosQueryOptions())
```

### 3. 선택적 구독

Zustand에서 필요한 값만 구독합니다:

```tsx
// ✅ 좋음: 필요한 값만 구독
const user = useAuthStore((s) => s.user)

// ❌ 나쁨: 전체 스토어 구독 (불필요한 리렌더링)
const { user, setUser, logout } = useAuthStore()
```
