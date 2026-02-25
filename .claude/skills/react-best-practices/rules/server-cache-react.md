---
title: React.cache()를 사용한 요청 단위 중복 제거
impact: MEDIUM
impactDescription: 요청 내에서 중복 제거
tags: server, cache, react-cache, deduplication
---

## React.cache()를 사용한 요청 단위 중복 제거

서버 사이드 요청 중복 제거를 위해 `React.cache()`를 사용합니다. 인증과 데이터베이스 쿼리에서 가장 큰 효과가 있습니다.

**사용법:**

```typescript
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return await db.user.findUnique({
    where: { id: session.user.id },
  })
})
```

단일 요청 내에서 `getCurrentUser()`를 여러 번 호출해도 쿼리는 한 번만 실행됩니다.

**인라인 객체를 인수로 사용하지 마세요:**

`React.cache()`는 캐시 히트를 판단하기 위해 얕은 동등성(`Object.is`)을 사용합니다. 인라인 객체는 호출마다 새로운 참조를 생성하므로 캐시 히트가 발생하지 않습니다.

**잘못된 예 (항상 캐시 미스):**

```typescript
const getUser = cache(async (params: { uid: number }) => {
  return await db.user.findUnique({ where: { id: params.uid } })
})

// 각 호출이 새 객체를 생성하므로, 캐시에 절대 히트하지 않음
getUser({ uid: 1 })
getUser({ uid: 1 }) // 캐시 미스, 쿼리 다시 실행
```

**올바른 예 (캐시 히트):**

```typescript
const getUser = cache(async (uid: number) => {
  return await db.user.findUnique({ where: { id: uid } })
})

// 원시 타입 인수는 값 동등성 사용
getUser(1)
getUser(1) // 캐시 히트, 캐시된 결과 반환
```

객체를 전달해야 하는 경우, 같은 참조를 전달합니다:

```typescript
const params = { uid: 1 }
getUser(params) // 쿼리 실행
getUser(params) // 캐시 히트 (같은 참조)
```

**Next.js 관련 참고사항:**

Next.js에서 `fetch` API는 자동으로 요청 메모이제이션이 확장되어 있습니다. 같은 URL과 옵션을 가진 요청은 단일 요청 내에서 자동으로 중복 제거되므로, `fetch` 호출에는 `React.cache()`가 필요하지 않습니다. 하지만 `React.cache()`는 다른 비동기 작업에는 여전히 필수적입니다:

- 데이터베이스 쿼리 (Prisma, Drizzle 등)
- 무거운 연산
- 인증 체크
- 파일 시스템 작업
- fetch가 아닌 모든 비동기 작업

컴포넌트 트리 전체에서 이러한 작업을 중복 제거하려면 `React.cache()`를 사용하세요.

Reference: [React.cache documentation](https://react.dev/reference/react/cache)
