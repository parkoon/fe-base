# 라우팅

이 문서에서는 React Router 7 기반 라우팅 시스템과 인증 흐름을 설명합니다.

---

## 라우트 구조

```
/                    → 랜딩 페이지 (인증 불필요)
/auth/login          → 로그인 (PublicRoute - 로그인 시 /app으로 리다이렉트)
/auth/register       → 회원가입 (PublicRoute)
/app                 → 대시보드 (ProtectedRoute - 비로그인 시 /auth/login으로)
/app/settings        → 설정 (ProtectedRoute)
/app/todos           → Todos (ProtectedRoute)
*                    → 404 Not Found
```

---

## 라우터 설정

### router.tsx

```typescript
// src/app/router.tsx
import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'

import { paths } from '@/config/paths'
import { ProtectedRoute, PublicRoute } from '@/lib/auth'

import AppRoot from './routes/app/root'

// clientLoader에 QueryClient 주입
const convert = (queryClient: QueryClient) => (m: any) => {
  const { clientLoader, clientAction, default: Component, ...rest } = m
  return {
    ...rest,
    loader: clientLoader?.(queryClient),
    action: clientAction?.(queryClient),
    Component,
  }
}

const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: paths.home.path,
      lazy: () => import('./routes/landing').then(convert(queryClient)),
    },
    {
      path: paths.auth.login.path,
      element: (
        <PublicRoute>
          <AuthLogin />
        </PublicRoute>
      ),
    },
    {
      path: paths.app.root.path,
      element: (
        <ProtectedRoute>
          <AppRoot />
        </ProtectedRoute>
      ),
      children: [
        {
          path: paths.app.dashboard.path,
          lazy: () => import('./routes/app/dashboard').then(convert(queryClient)),
        },
        // ... 다른 라우트
      ],
    },
    {
      path: '*',
      lazy: () => import('./routes/not-found').then(convert(queryClient)),
    },
  ])
```

---

## 경로 상수 (paths.ts)

모든 경로는 `src/config/paths.ts`에서 중앙 관리합니다.

```typescript
// src/config/paths.ts
export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },

  auth: {
    login: {
      path: '/auth/login',
      getHref: (redirectTo?: string) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    register: {
      path: '/auth/register',
      getHref: (redirectTo?: string) =>
        `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },

  app: {
    root: {
      path: '/app',
      getHref: () => '/app',
    },
    dashboard: {
      path: '', // /app 상대 경로
      getHref: () => '/app',
    },
    settings: {
      path: 'settings',
      getHref: () => '/app/settings',
    },
    todos: {
      path: 'todos',
      getHref: () => '/app/todos',
    },
  },
} as const
```

### 사용 예시

```tsx
import { Link, useNavigate } from 'react-router'
import { paths } from '@/config/paths'

// Link 컴포넌트에서
;<Link to={paths.app.dashboard.getHref()}>대시보드</Link>

// 프로그래밍 방식 네비게이션
const navigate = useNavigate()
navigate(paths.auth.login.getHref('/app/settings'))
// → /auth/login?redirectTo=%2Fapp%2Fsettings
```

---

## 인증 라우트 가드

### ProtectedRoute

인증이 필요한 페이지를 보호합니다.

```typescript
// src/lib/auth/components.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    // 로그인 페이지로 리다이렉트 (현재 경로를 redirectTo에 저장)
    return (
      <Navigate
        to={paths.auth.login.getHref(location.pathname)}
        replace
      />
    )
  }

  return <>{children}</>
}
```

**동작 흐름:**

```
1. 비로그인 사용자가 /app/settings 접근
2. ProtectedRoute가 user 없음 감지
3. /auth/login?redirectTo=%2Fapp%2Fsettings 로 리다이렉트
4. 로그인 성공 후 redirectTo 경로로 이동
```

### PublicRoute

로그인한 사용자가 접근하면 /app으로 리다이렉트합니다.

```typescript
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)

  if (user) {
    return <Navigate to={paths.app.root.getHref()} replace />
  }

  return <>{children}</>
}
```

**동작 흐름:**

```
1. 로그인한 사용자가 /auth/login 접근
2. PublicRoute가 user 있음 감지
3. /app 으로 리다이렉트
```

---

## 중첩 라우트

`/app/*` 경로는 중첩 라우트로 구성됩니다.

### 레이아웃 (root.tsx)

```typescript
// src/app/routes/app/root.tsx
import { Outlet } from 'react-router'

function AppRoot() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header>...</header>

      {/* 네비게이션 */}
      <nav>...</nav>

      {/* 자식 라우트 렌더링 */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default AppRoot
```

### 자식 라우트

```typescript
// src/app/routes/app/dashboard.tsx
export function Component() {
  return (
    <div>
      <h1>대시보드</h1>
      {/* 대시보드 내용 */}
    </div>
  )
}
```

---

## 데이터 프리페칭 (clientLoader)

페이지 진입 전에 데이터를 미리 로드할 수 있습니다.

```typescript
// src/app/routes/app/todos.tsx
import { type QueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getTodosQueryOptions } from '@/api/todos'

// 라우터가 이 함수를 호출하여 데이터 프리페칭
export const clientLoader = (queryClient: QueryClient) => async () => {
  // 캐시에 없으면 fetch, 있으면 캐시 사용
  await queryClient.ensureQueryData(getTodosQueryOptions())
  return null  // 데이터는 캐시에서 가져옴
}

export function Component() {
  // 이미 캐시에 있으므로 즉시 렌더링
  const { data } = useSuspenseQuery(getTodosQueryOptions())

  return <TodoList todos={data.todos} />
}
```

### convert 함수

`router.tsx`의 `convert` 함수가 `clientLoader`에 `QueryClient`를 주입합니다:

```typescript
const convert = (queryClient: QueryClient) => (m: any) => {
  const { clientLoader, clientAction, default: Component, ...rest } = m
  return {
    ...rest,
    loader: clientLoader?.(queryClient), // QueryClient 주입
    action: clientAction?.(queryClient),
    Component,
  }
}

// 사용
lazy: () => import('./routes/app/todos').then(convert(queryClient))
```

---

## 새 페이지 추가하기

### 1. paths.ts에 경로 추가

```typescript
// src/config/paths.ts
app: {
  // 기존 경로...
  users: {
    path: 'users',
    getHref: () => '/app/users',
  },
},
```

### 2. 페이지 컴포넌트 생성

```typescript
// src/app/routes/app/users.tsx
import { type QueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getUsersQueryOptions } from '@/api/users'
import { Head } from '@/components/seo'

// 데이터 프리페칭 (선택)
export const clientLoader = (queryClient: QueryClient) => async () => {
  await queryClient.ensureQueryData(getUsersQueryOptions())
  return null
}

export function Component() {
  const { data } = useSuspenseQuery(getUsersQueryOptions())

  return (
    <>
      <Head title="사용자 목록" />
      <h1>사용자 목록</h1>
      {/* 내용 */}
    </>
  )
}
```

### 3. router.tsx에 라우트 추가

```typescript
// src/app/router.tsx
children: [
  // 기존 라우트...
  {
    path: paths.app.users.path,
    lazy: () => import('./routes/app/users').then(convert(queryClient)),
  },
],
```

### 4. 네비게이션에 링크 추가

```tsx
// src/app/routes/app/root.tsx
<Link to={paths.app.users.getHref()}>사용자</Link>
```

---

## 404 페이지

알 수 없는 경로는 `not-found.tsx`로 라우팅됩니다:

```typescript
// src/app/routes/not-found.tsx
import { Link } from 'react-router'
import { paths } from '@/config/paths'

export function Component() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-gray-600">페이지를 찾을 수 없습니다</p>
      <Link to={paths.home.getHref()} className="mt-4 text-blue-600">
        홈으로 돌아가기
      </Link>
    </div>
  )
}
```
