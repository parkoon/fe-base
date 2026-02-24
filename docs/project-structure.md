# 프로젝트 구조

이 문서에서는 프로젝트의 폴더 구조와 각 폴더의 역할을 설명합니다.

---

## 전체 구조

```
src/
├── api/              # API 호출 함수 및 React Query 옵션
│   ├── auth/         # 인증 관련 API
│   ├── todos/        # Todos API (예시)
│   └── dummyjson.ts  # API 클라이언트 인스턴스
│
├── app/              # 애플리케이션 레이어
│   ├── routes/       # 페이지 컴포넌트
│   │   ├── app/      # 인증 필요 페이지 (/app/*)
│   │   ├── auth/     # 인증 페이지 (/auth/*)
│   │   ├── landing.tsx
│   │   └── not-found.tsx
│   ├── index.tsx     # App 컴포넌트
│   ├── provider.tsx  # 전역 프로바이더
│   └── router.tsx    # 라우터 설정
│
├── components/       # 공유 컴포넌트
│   ├── errors/       # 에러 관련 컴포넌트
│   ├── seo/          # SEO 컴포넌트 (Head)
│   └── ui/           # UI 컴포넌트 (Button, Spinner 등)
│
├── config/           # 설정
│   ├── env.ts        # 환경 변수 (Zod 검증)
│   └── paths.ts      # 라우트 경로 상수
│
├── hooks/            # 공유 훅
│   └── use-disclosure.ts
│
├── lib/              # 라이브러리 설정
│   ├── api/          # API 클라이언트 핵심 로직
│   ├── auth/         # 인증 로직 (store, interceptor, components)
│   ├── dayjs.ts      # dayjs 설정
│   └── react-query.ts # React Query 설정
│
├── types/            # 타입 정의
│   └── dummyjson.d.ts # OpenAPI에서 자동 생성된 타입
│
├── utils/            # 유틸리티 함수
│   └── cn.ts         # Tailwind 클래스 병합
│
└── main.tsx          # 앱 진입점
```

---

## 주요 폴더 설명

### `src/api/`

API 호출과 관련된 모든 코드가 위치합니다.

```
api/
├── auth/
│   ├── get-auth-me.ts      # GET /auth/me
│   ├── post-auth-login.ts  # POST /auth/login
│   ├── post-auth-refresh.ts
│   └── index.ts            # 모듈 export
├── todos/
│   ├── get-todos.ts        # GET /todos
│   ├── post-todos-add.ts   # POST /todos/add
│   └── index.ts
└── dummyjson.ts            # API 클라이언트 인스턴스
```

**파일 명명 규칙**: `{method}-{path}.ts`

예시:

- `GET /auth/me` → `get-auth-me.ts`
- `POST /todos/add` → `post-todos-add.ts`
- `DELETE /todos/{id}` → `delete-todos-{id}.ts`

**파일 구조 패턴**:

```typescript
// get-auth-me.ts (Query)
export const getAuthMeService = () => dummyjson.GET('/auth/me')

export const getAuthMeQueryOptions = () =>
  queryOptions({
    queryKey: ['getAuthMe'],
    queryFn: getAuthMeService,
  })

// post-auth-login.ts (Mutation)
export const postAuthLoginService = (data) => dummyjson.POST('/auth/login', data)

export function usePostAuthLoginMutation({ mutationConfig } = {}) {
  return useMutation({
    mutationFn: postAuthLoginService,
    ...mutationConfig,
  })
}
```

---

### `src/app/`

애플리케이션의 진입점과 라우팅을 담당합니다.

```
app/
├── routes/           # 페이지 컴포넌트
│   ├── app/          # 인증 필요 페이지
│   │   ├── root.tsx  # /app 레이아웃
│   │   ├── dashboard.tsx
│   │   ├── settings.tsx
│   │   └── todos.tsx
│   ├── auth/         # 인증 페이지
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── landing.tsx   # 랜딩 페이지 (/)
│   └── not-found.tsx # 404 페이지
├── index.tsx         # App 컴포넌트
├── provider.tsx      # 전역 프로바이더
└── router.tsx        # 라우터 설정
```

**라우트 구조**:

| URL              | 파일                | 인증                  |
| ---------------- | ------------------- | --------------------- |
| `/`              | `landing.tsx`       | 불필요                |
| `/auth/login`    | `auth/login.tsx`    | 불필요 (PublicRoute)  |
| `/auth/register` | `auth/register.tsx` | 불필요 (PublicRoute)  |
| `/app`           | `app/dashboard.tsx` | 필요 (ProtectedRoute) |
| `/app/settings`  | `app/settings.tsx`  | 필요                  |
| `/app/todos`     | `app/todos.tsx`     | 필요                  |

---

### `src/components/`

애플리케이션 전체에서 공유되는 컴포넌트입니다.

```
components/
├── errors/           # 에러 관련 컴포넌트
│   ├── error-fallback.tsx       # 인라인 에러 UI
│   ├── main-error-fallback.tsx  # 전체 화면 에러 UI
│   ├── query-error-boundary.tsx # React Query 에러 바운더리
│   └── index.ts
├── seo/              # SEO 관련
│   ├── head.tsx      # 페이지 타이틀/메타 태그
│   └── index.ts
└── ui/               # UI 컴포넌트
    ├── button.tsx
    ├── spinner.tsx
    └── index.ts
```

---

### `src/lib/`

외부 라이브러리 설정 및 핵심 유틸리티입니다.

```
lib/
├── api/              # API 클라이언트 핵심
│   ├── client.ts     # createApiClient 함수
│   ├── error.ts      # ApiError 클래스
│   ├── types.ts      # 타입 헬퍼 (InferBody, InferPathParams 등)
│   └── index.ts
├── auth/             # 인증 관련
│   ├── store.ts      # Zustand 인증 스토어
│   ├── interceptor.ts # 토큰 자동 주입/갱신
│   ├── auth-loader.tsx # 앱 시작 시 인증 검증
│   ├── components.tsx # ProtectedRoute, PublicRoute
│   └── index.ts
├── dayjs.ts          # dayjs 설정 (한국어, 타임존)
└── react-query.ts    # React Query 설정
```

---

### `src/config/`

애플리케이션 설정 파일입니다.

```typescript
// config/env.ts - 환경 변수 (Zod 검증)
import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
})

export const env = envSchema.parse(import.meta.env)
```

```typescript
// config/paths.ts - 라우트 경로 상수
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
  },
  app: {
    dashboard: {
      path: '',
      getHref: () => '/app',
    },
  },
} as const
```

---

### `src/hooks/`

애플리케이션 전체에서 공유되는 커스텀 훅입니다.

```typescript
// hooks/use-disclosure.ts
export const useDisclosure = (initial = false) => {
  const [isOpen, setIsOpen] = useState(initial)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((state) => !state), [])

  return { isOpen, open, close, toggle }
}
```

사용 예시:

```tsx
const dialog = useDisclosure()

<Button onClick={dialog.open}>열기</Button>
<Dialog open={dialog.isOpen} onClose={dialog.close}>
  ...
</Dialog>
```

---

### `src/utils/`

순수 유틸리티 함수입니다.

```typescript
// utils/cn.ts - Tailwind 클래스 병합
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

사용 예시:

```tsx
<div className={cn('px-4 py-2', isActive && 'bg-blue-500', className)} />
```

---

## 코드 흐름 원칙

### 단방향 의존성

```
shared (utils, hooks, lib, components)
         ↓
       api
         ↓
       app
```

- `shared` → 어디서든 import 가능
- `api` → shared만 import 가능
- `app` → shared, api 모두 import 가능

### import 예시

```typescript
// ✅ 좋음: app에서 api import
// src/app/routes/app/todos.tsx
import { getTodosQueryOptions } from '@/api/todos'

// ✅ 좋음: api에서 lib import
// src/api/auth/post-auth-login.ts
import { dummyjson } from '../dummyjson'

// ❌ 나쁨: lib에서 api import (순환 의존성)
// src/lib/auth/store.ts
import { getAuthMeService } from '@/api/auth' // 피하세요
```

---

## 새 파일 추가 가이드

### 새 페이지 추가

1. `src/app/routes/app/` 또는 `auth/`에 파일 생성
2. `src/config/paths.ts`에 경로 추가
3. `src/app/router.tsx`에 라우트 추가

### 새 API 추가

```bash
pnpm api:gen  # 대화형 CLI로 자동 생성
```

또는 수동으로:

1. `src/api/{module}/`에 파일 생성
2. `index.ts`에 export 추가

### 새 컴포넌트 추가

1. `src/components/{category}/`에 파일 생성
2. `index.ts`에 export 추가
