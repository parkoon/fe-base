---
name: react-implementation
description: >
  이 프로젝트(fe-base)에서 React/TypeScript 코드를 요구사항 기반으로 구현할 때 사용하는 스킬.
  새 페이지, 컴포넌트, 기능, API 연동, 훅 작성 등 실제 코드를 작성하는 모든 작업에서 활성화됩니다.
  "~만들어줘", "~구현해줘", "~페이지 추가해줘", "~기능 작성해줘", "~컴포넌트 만들어줘",
  "API 연동해줘" 같은 요청에서 반드시 이 스킬을 참고하세요.
  이 스킬은 프로젝트 고유의 파일 구조, 코딩 스타일, 아키텍처 규칙을 포함합니다.
---

# React Implementation

요구사항을 받아 이 프로젝트의 규칙에 맞게 React/TypeScript 코드를 구현합니다.

## 참조 문서 안내

| 문서                                 | 언제 읽을지                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| `references/coding-style.md`         | React Query 훅 작성, AsyncBoundary 적용 — 코드 작성 전 확인                            |
| `references/clean-code.md`           | 컴포넌트/훅 분리 판단이 필요할 때                                                      |
| `references/page-structure.md`       | 새 파일/디렉토리 위치 결정 시 — 새 페이지 추가 시 필독                                 |
| `references/react-best-practices.md` | 비동기 처리, 번들, 리렌더 최적화 패턴이 필요할 때 (큰 문서 — 목차 확인 후 필요 섹션만) |

---

## 코딩 스타일 핵심 규칙

이 규칙들은 코드 작성 시 항상 적용합니다. 상세 내용은 `references/coding-style.md` 참고.

### React Query 훅 결과 명명

`useQuery`, `useSuspenseQuery`, `useMutation` 결과는 **구조 분해하지 않고** `xxxQuery` / `xxxMutation` 변수에 할당합니다.

```tsx
// ❌
const { data: users = [], isLoading } = useQuery(getUsersQueryOptions())
const { mutate: deleteUser } = useDeleteUserMutation()

// ✅
const usersQuery = useQuery(getUsersQueryOptions())
const deleteUserMutation = useDeleteUserMutation()

// 사용
usersQuery.data ?? []
usersQuery.isLoading
deleteUserMutation.mutate(id)
```

이유: 여러 쿼리가 있을 때 어디서 온 값인지 명확하게 추적할 수 있습니다.

### 쿼리 추상화 기준

컴포넌트에서만 사용되는 쿼리는 커스텀 훅으로 추출하지 않고 **컴포넌트 내 인라인**으로 작성합니다. 2개 이상 컴포넌트에서 재사용할 때만 추출합니다.

### AsyncBoundary 패턴

데이터 페칭 컴포넌트는 `useSuspenseQuery`를 사용하고, **부모에서 `AsyncBoundary`로 감쌉니다**.

```tsx
// 데이터 페칭 컴포넌트
function UserList() {
  const usersQuery = useSuspenseQuery(getUsersQueryOptions())
  return (
    <ul>
      {usersQuery.data.map((u) => (
        <UserItem
          key={u.id}
          user={u}
        />
      ))}
    </ul>
  )
}

// 부모
;<AsyncBoundary loadingFallback={<ListSkeleton />}>
  <UserList />
</AsyncBoundary>
```

> **예외**: `enabled` 조건이 있는 쿼리는 `useQuery`를 사용합니다 (`useSuspenseQuery` + `enabled: false`는 무한 suspense 발생).

---

## 클린코드 원칙

코드를 작성할 때 아래 세 가지 원칙을 염두에 둡니다. 상세 예시는 `references/clean-code.md` 참고.

**추상화 레벨 일관성**: 하나의 컴포넌트/함수 안에서 고수준 비즈니스 로직과 저수준 구현 디테일(포맷팅, DOM 조작)이 섞이지 않도록 합니다. JSX 안에 긴 `.filter().map().sort()` 체인이 있다면 의미 있는 이름의 변수나 함수로 추출하세요.

**단일 책임 원칙**: "이 컴포넌트/훅은 왜 바뀔 수 있는가?"의 답이 2개 이상이면 분리를 고려합니다. 단, 100줄 이내의 명확한 목적을 가진 컴포넌트는 굳이 분리할 필요 없습니다.

**관심사 분리**: API 통신은 `src/api/`에, 비즈니스 로직은 커스텀 훅/유틸에, 전역 UI 상태는 Zustand store에 배치합니다. 컴포넌트 안에 `fetch()`를 직접 쓰지 않습니다.

---

## 파일 배치 규칙

파일을 생성하기 전에 `references/page-structure.md`를 확인합니다. 핵심 규칙:

```
# 새 페이지
src/app/routes/app/{domain}/{page}/page.tsx     ← 진입점 (default export 필수)
src/app/routes/app/{domain}/{page}/_components/ ← 이 페이지 전용 컴포넌트
src/app/routes/app/{domain}/{page}/_hooks/      ← 이 페이지 전용 훅
src/app/routes/app/{domain}/{page}/_context/    ← 다단계 상태 (멀티스텝 폼 등)

# API
src/api/{domain}/{method}-{endpoint}.ts         ← service 함수 + queryOptions / mutation 훅

# 2개 이상 페이지에서 공유
src/components/          ← 공통 컴포넌트
src/hooks/               ← 공통 훅
src/stores/              ← Zustand (전역 UI 상태만, 서버 데이터 금지)
src/types/manual/        ← 공유 타입
```

새 페이지 추가 시 `src/config/paths.ts`와 `src/app/router.tsx`도 수정합니다.

---

## API 레이어 패턴

```typescript
// src/api/{domain}/get-{resource}.ts
export const get{Resource}Service = (): Promise<ResourceType[]> =>
  instance.get('/api/...').then(res => res.data)

export const get{Resource}QueryOptions = () =>
  queryOptions({
    queryKey: ['get{Resource}'],
    queryFn: get{Resource}Service,
  })

// Mutation은 훅으로 정의
export const useCreate{Resource}Mutation = () =>
  useMutation({
    mutationFn: (body: CreateBody) =>
      instance.post('/api/...', body).then(res => res.data),
  })
```

---

## ESLint 강제 규칙 (자동 검증)

- `interface` 금지 → `type` 사용
- 타입 import는 `import type` 사용
- `dayjs` 직접 import 금지 → `import { $dayjs } from '@/lib/dayjs'`

---

## React Best Practices 활용

`references/react-best-practices.md`의 목차를 보고 필요한 섹션을 참고합니다.

- **Async**: 독립적 비동기 연산 → `Promise.all()`, 워터폴 체인 방지
- **Bundle**: 대용량 컴포넌트 → `lazy()` 동적 임포트, 배럴 파일 직접 import 피하기
- **Rerender**: 함수형 `setState`, 파생 상태는 렌더 중 계산 (useEffect 금지), `useRef` for non-render values
- **Client**: 패시브 이벤트 리스너, localStorage 버전 관리
