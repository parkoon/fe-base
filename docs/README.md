# FE Base 프로젝트 가이드

React + TypeScript 기반의 프론트엔드 보일러플레이트입니다.

## 기술 스택

| 분류               | 기술                               |
| ------------------ | ---------------------------------- |
| **Framework**      | React 19, TypeScript               |
| **Build Tool**     | Vite 7                             |
| **Routing**        | React Router 7                     |
| **상태 관리**      | Zustand (전역), React Query (서버) |
| **스타일링**       | Tailwind CSS 4                     |
| **API 클라이언트** | Axios + openapi-typescript         |
| **폼 유효성 검사** | Zod                                |
| **코드 품질**      | ESLint, Prettier, Husky            |

---

## 문서 목차

### 필수 문서

1. **[시작하기](./getting-started.md)** - 설치 및 개발 환경 설정
2. **[프로젝트 구조](./project-structure.md)** - 폴더 구조 및 코드 구성 규칙
3. **[API 레이어](./api-layer.md)** - 타입 안전한 API 클라이언트 사용법
4. **[라우팅](./routing.md)** - 라우팅 및 인증 흐름
5. **[상태 관리](./state-management.md)** - 상태 관리 전략
6. **[에러 처리](./error-handling.md)** - 에러 바운더리 및 에러 핸들링

### 도구 문서

7. **[코드 생성](./code-generation.md)** - API 코드 자동 생성 CLI

---

## 핵심 컨셉

### 1. 타입 안전한 API 호출

OpenAPI 스펙에서 타입을 자동 생성하여, API 호출 시 **Path, Query, Body, Response**가 모두 타입으로 보장됩니다.

```typescript
// 자동완성 지원 + 타입 안전
const user = await dummyjson.GET('/users/{id}', {
  path: { id: 1 }, // 타입 체크됨
})
```

### 2. 선언적 에러 처리

React Query + ErrorBoundary를 활용한 선언적 에러 처리:

```tsx
<QueryErrorBoundary>
  <Suspense fallback={<Loading />}>
    <UserList /> {/* useSuspenseQuery 사용 */}
  </Suspense>
</QueryErrorBoundary>
```

### 3. 인증 자동화

- **토큰 자동 주입**: 모든 요청에 Authorization 헤더 자동 추가
- **토큰 자동 갱신**: 401 에러 시 자동으로 refresh token으로 갱신
- **보호된 라우트**: `ProtectedRoute`로 인증 필요 페이지 보호

### 4. 코드 생성 자동화

```bash
pnpm api:gen
# → swagger.json 기반으로 API 코드 자동 생성
```

---

## 빠른 시작

```bash
# 1. 의존성 설치
pnpm install

# 2. 개발 서버 실행
pnpm dev

# 3. API 코드 생성 (선택)
pnpm api:gen
```

---

## 주요 명령어

| 명령어          | 설명              |
| --------------- | ----------------- |
| `pnpm dev`      | 개발 서버 실행    |
| `pnpm build`    | 프로덕션 빌드     |
| `pnpm lint`     | ESLint 검사       |
| `pnpm lint:fix` | ESLint 자동 수정  |
| `pnpm format`   | Prettier 포맷팅   |
| `pnpm codegen`  | OpenAPI 타입 생성 |
| `pnpm api:gen`  | API 코드 생성 CLI |

---

## 프로젝트 영감

이 프로젝트는 [bulletproof-react](https://github.com/alan2207/bulletproof-react)의 아키텍처 패턴을 참고하여 만들어졌습니다.
