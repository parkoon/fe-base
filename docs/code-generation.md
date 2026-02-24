# 코드 자동 생성

이 문서에서는 프로젝트에서 사용하는 코드 자동 생성 도구들을 설명합니다.

---

## 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    swagger.json                              │
│  OpenAPI 스펙 파일 (API 정의)                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              pnpm codegen (openapi-typescript)               │
│  swagger.json → src/types/dummyjson.d.ts (타입 정의)          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              pnpm api:gen (인터랙티브 CLI)                    │
│  Path + Method 선택 → API 코드 자동 생성                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. OpenAPI 타입 생성

`openapi-typescript`를 사용하여 swagger.json에서 TypeScript 타입을 생성합니다.

### 실행

```bash
pnpm codegen
```

### 결과

```
swagger.json → src/types/dummyjson.d.ts
```

### 생성되는 타입

```typescript
// src/types/dummyjson.d.ts
export interface paths {
  '/auth/login': {
    post: {
      requestBody: {
        content: {
          'application/json': {
            username: string
            password: string
            expiresInMins?: number
          }
        }
      }
      responses: {
        200: {
          content: {
            'application/json': AuthResponse
          }
        }
      }
    }
  }
  // ...
}

export interface components {
  schemas: {
    AuthResponse: {
      id: number
      username: string
      accessToken: string
      refreshToken: string
    }
    // ...
  }
}
```

### 타입 활용

```typescript
import type { paths, components } from '@/types/dummyjson'

// 스키마 타입 사용
type User = components['schemas']['User']

// Path + Method에서 타입 추론 (InferBody, InferResponse 등)
import type { InferBody } from '@/lib/api'
type LoginRequest = InferBody<paths, '/auth/login', 'post'>
```

---

## 2. API 코드 생성 CLI

swagger.json을 기반으로 API 엔드포인트 코드를 인터랙티브하게 생성합니다.

### 설치 (최초 1회)

```bash
pnpm add -D @inquirer/prompts
```

### package.json 스크립트 추가

```json
{
  "scripts": {
    "api:gen": "node scripts/api-gen.js"
  }
}
```

### 실행

```bash
pnpm api:gen
```

### 사용 흐름

```bash
🚀 API Code Generator

? Select API path: (검색어 입력)
❯ /auth/login          POST
  /auth/me             GET
  /auth/refresh        POST
  /users               GET
  /users/{id}          GET, PUT, DELETE
  ...

? Select HTTP method for /users/{id}:
❯ GET
  PUT
  DELETE

  ✓ Created: src/api/users/get-users-{id}.ts
  ✓ Updated: src/api/users/index.ts

✨ Done! Run `pnpm lint --fix` to format the generated code.
```

---

## 3. 생성되는 코드 패턴

### 3.1 GET 요청 (Query 없음)

Path: `/auth/me`

```typescript
// src/api/auth/get-auth-me.ts
import { queryOptions } from '@tanstack/react-query'

import type { QueryConfig } from '@/lib/react-query'

import { dummyjson } from '../dummyjson'

export const getAuthMeService = () => dummyjson.GET('/auth/me')

export const getAuthMeQueryOptions = () =>
  queryOptions({
    queryKey: ['getAuthMe'],
    queryFn: getAuthMeService,
  })

export type GetAuthMeQueryConfig = QueryConfig<typeof getAuthMeQueryOptions>
```

### 3.2 GET 요청 (Path Parameter 있음)

Path: `/users/{id}`

```typescript
// src/api/users/get-users-{id}.ts
import { queryOptions } from '@tanstack/react-query'

import type { InferPathParams } from '@/lib/api'
import type { QueryConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const getUsersIdService = (params: InferPathParams<paths, '/users/{id}', 'get'>) =>
  dummyjson.GET('/users/{id}', { path: params })

export const getUsersIdQueryOptions = (
  id: InferPathParams<paths, '/users/{id}', 'get'>[keyof InferPathParams<
    paths,
    '/users/{id}',
    'get'
  >]
) =>
  queryOptions({
    queryKey: ['getUsersId', id],
    queryFn: () => getUsersIdService({ id }),
  })

export type GetUsersIdQueryConfig = QueryConfig<typeof getUsersIdQueryOptions>
```

### 3.3 GET 요청 (Query Parameter 있음)

Path: `/users?limit=10&skip=0`

```typescript
// src/api/users/get-users.ts
import { queryOptions } from '@tanstack/react-query'

import type { InferQueryParams } from '@/lib/api'
import type { QueryConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const getUsersService = (query?: InferQueryParams<paths, '/users', 'get'>) =>
  dummyjson.GET('/users', { query })

export const getUsersQueryOptions = (query?: InferQueryParams<paths, '/users', 'get'>) =>
  queryOptions({
    queryKey: ['getUsers', query],
    queryFn: () => getUsersService(query),
  })

export type GetUsersQueryConfig = QueryConfig<typeof getUsersQueryOptions>
```

### 3.4 POST 요청 (Mutation)

Path: `/auth/login`

```typescript
// src/api/auth/post-auth-login.ts
import { useMutation } from '@tanstack/react-query'

import type { InferBody } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const postAuthLoginService = (data: InferBody<paths, '/auth/login', 'post'>) =>
  dummyjson.POST('/auth/login', data)

type UsePostAuthLoginMutationOptions = {
  mutationConfig?: MutationConfig<typeof postAuthLoginService>
}

export function usePostAuthLoginMutation({ mutationConfig }: UsePostAuthLoginMutationOptions = {}) {
  return useMutation({
    mutationFn: postAuthLoginService,
    ...mutationConfig,
  })
}
```

### 3.5 DELETE 요청 (Body 없음)

Path: `/users/{id}`

```typescript
// src/api/users/delete-users-{id}.ts
import { useMutation } from '@tanstack/react-query'

import type { InferPathParams } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const deleteUsersIdService = (params: InferPathParams<paths, '/users/{id}', 'delete'>) =>
  dummyjson.DELETE('/users/{id}', { path: params })

type UseDeleteUsersIdMutationOptions = {
  mutationConfig?: MutationConfig<typeof deleteUsersIdService>
}

export function useDeleteUsersIdMutation({ mutationConfig }: UseDeleteUsersIdMutationOptions = {}) {
  return useMutation({
    mutationFn: deleteUsersIdService,
    ...mutationConfig,
  })
}
```

---

## 4. 파일 구조

생성된 파일들의 구조:

```
src/api/
├── dummyjson.ts          # API 클라이언트 인스턴스
├── auth/
│   ├── index.ts          # 자동 업데이트
│   ├── get-auth-me.ts    # GET /auth/me
│   ├── post-auth-login.ts    # POST /auth/login
│   └── post-auth-refresh.ts  # POST /auth/refresh
├── users/
│   ├── index.ts
│   ├── get-users.ts      # GET /users
│   ├── get-users-{id}.ts # GET /users/{id}
│   └── delete-users-{id}.ts  # DELETE /users/{id}
└── todos/
    ├── index.ts
    ├── get-todos.ts
    └── patch-todos-{id}.ts
```

---

## 5. 파일명 규칙

| Path          | Method | 파일명                 |
| ------------- | ------ | ---------------------- |
| `/auth/login` | POST   | `post-auth-login.ts`   |
| `/auth/me`    | GET    | `get-auth-me.ts`       |
| `/users`      | GET    | `get-users.ts`         |
| `/users/{id}` | GET    | `get-users-{id}.ts`    |
| `/users/{id}` | DELETE | `delete-users-{id}.ts` |

**규칙:**

- `{method}-{path}.ts` 형식
- Path의 `/`는 `-`로 변환
- Path Parameter `{id}`는 그대로 유지

---

## 6. index.ts 자동 업데이트

API 코드 생성 시 `index.ts`도 자동으로 업데이트됩니다:

```typescript
// src/api/auth/index.ts

// GET /auth/me
export type { GetAuthMeQueryConfig } from './get-auth-me'
export { getAuthMeQueryOptions, getAuthMeService } from './get-auth-me'

// POST /auth/login
export { postAuthLoginService, usePostAuthLoginMutation } from './post-auth-login'

// POST /auth/refresh
export { postAuthRefreshService, usePostAuthRefreshMutation } from './post-auth-refresh'
```

---

## 7. 타입 헬퍼

`src/lib/api/types.ts`에 정의된 타입 헬퍼:

```typescript
// Request Body 추론
export type InferBody<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod
> = ...

// Response 추론
export type InferResponse<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod
> = ...

// Path Parameters 추론
export type InferPathParams<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod
> = ...

// Query Parameters 추론
export type InferQueryParams<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod
> = ...
```

### 사용 예시

```typescript
import type { InferBody, InferResponse } from '@/lib/api'
import type { paths } from '@/types/dummyjson'

// Request Body 타입 추론
type LoginRequest = InferBody<paths, '/auth/login', 'post'>
// => { username: string; password: string; expiresInMins?: number }

// Response 타입 추론
type LoginResponse = InferResponse<paths, '/auth/login', 'post'>
// => AuthResponse
```

---

## 8. 워크플로우

### 새 API 추가 시

```bash
# 1. swagger.json 업데이트 (백엔드에서 받거나 수동 수정)

# 2. 타입 재생성
pnpm codegen

# 3. API 코드 생성
pnpm api:gen
# → Path 선택: /products
# → Method 선택: GET

# 4. 코드 포맷팅
pnpm lint --fix

# 5. 컴포넌트에서 사용
import { getProductsQueryOptions } from '@/api/products'
```

### 기존 API 변경 시

```bash
# 1. swagger.json 업데이트

# 2. 타입 재생성
pnpm codegen

# 3. 기존 코드에서 타입 에러 확인 및 수정
pnpm tsc --noEmit
```

---

## 9. 주의사항

### swagger.json 위치

프로젝트 루트에 `swagger.json` 파일이 있어야 합니다:

```
fe-base/
├── swagger.json    ← 여기
├── package.json
└── src/
```

### 중복 생성 방지

이미 존재하는 파일은 덮어쓰기 전에 확인을 요청합니다:

```bash
? post-auth-login.ts already exists. Overwrite? (y/N)
```

### 린트 실행

생성된 코드는 자동 포맷팅되지 않으므로 생성 후 린트를 실행하세요:

```bash
pnpm lint --fix
```

---

## 10. 커스터마이징

### 다른 API 서버 추가

새로운 API 서버를 추가하려면:

1. swagger.json 파일 추가:

   ```
   swagger-petstore.json
   ```

2. 타입 생성 스크립트 추가:

   ```json
   {
     "scripts": {
       "codegen:petstore": "openapi-typescript swagger-petstore.json -o src/types/petstore.d.ts"
     }
   }
   ```

3. API 클라이언트 생성:

   ```typescript
   // src/api/petstore.ts
   import { createApiClient } from '@/lib/api'
   import type { paths } from '@/types/petstore'

   export const petstore = createApiClient<paths>('https://petstore.swagger.io/v2')
   ```

4. api-gen.js 스크립트 복사 및 수정 (선택적)

---

## 요약

| 명령어            | 설명                                |
| ----------------- | ----------------------------------- |
| `pnpm codegen`    | swagger.json → TypeScript 타입 생성 |
| `pnpm api:gen`    | 인터랙티브 API 코드 생성            |
| `pnpm lint --fix` | 생성된 코드 포맷팅                  |
