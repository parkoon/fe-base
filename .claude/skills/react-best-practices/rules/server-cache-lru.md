---
title: 교차 요청 LRU 캐싱
impact: HIGH
impactDescription: 요청 간 캐싱
tags: server, cache, lru, cross-request
---

## 교차 요청 LRU 캐싱

`React.cache()`는 하나의 요청 내에서만 작동합니다. 순차적인 요청 간에 공유되는 데이터(사용자가 버튼 A를 클릭한 후 버튼 B를 클릭하는 경우)에는 LRU 캐시를 사용합니다.

**구현:**

```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5분
})

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached

  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}

// 요청 1: DB 쿼리, 결과 캐싱
// 요청 2: 캐시 히트, DB 쿼리 없음
```

순차적인 사용자 액션이 수 초 이내에 동일한 데이터가 필요한 여러 엔드포인트를 호출할 때 사용합니다.

**Vercel의 [Fluid Compute](https://vercel.com/docs/fluid-compute)와 함께:** 여러 동시 요청이 같은 함수 인스턴스와 캐시를 공유할 수 있으므로, LRU 캐싱이 특히 효과적입니다. Redis 같은 외부 스토리지 없이도 캐시가 요청 간에 유지됩니다.

**기존 서버리스 환경에서:** 각 호출이 격리된 환경에서 실행되므로, 프로세스 간 캐싱에는 Redis를 고려하세요.

Reference: [https://github.com/isaacs/node-lru-cache](https://github.com/isaacs/node-lru-cache)
