---
title: 필요할 때까지 Await 지연하기
impact: HIGH
impactDescription: 사용되지 않는 코드 경로의 블로킹 방지
tags: async, await, conditional, optimization
---

## 필요할 때까지 Await 지연하기

`await` 연산을 실제로 사용되는 분기 안으로 이동시켜, 해당 값이 필요하지 않은 코드 경로를 블로킹하지 않도록 합니다.

**잘못된 예 (양쪽 분기를 모두 블로킹):**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)

  if (skipProcessing) {
    // 즉시 반환하지만 여전히 userData를 기다림
    return { skipped: true }
  }

  // 이 분기만 userData를 사용함
  return processUserData(userData)
}
```

**올바른 예 (필요한 경우에만 블로킹):**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    // 기다리지 않고 즉시 반환
    return { skipped: true }
  }

  // 필요한 경우에만 데이터 페칭
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

**다른 예시 (조기 반환 최적화):**

```typescript
// 잘못된 예: 항상 권한을 조회함
async function updateResource(resourceId: string, userId: string) {
  const permissions = await fetchPermissions(userId)
  const resource = await getResource(resourceId)

  if (!resource) {
    return { error: 'Not found' }
  }

  if (!permissions.canEdit) {
    return { error: 'Forbidden' }
  }

  return await updateResourceData(resource, permissions)
}

// 올바른 예: 필요한 경우에만 조회함
async function updateResource(resourceId: string, userId: string) {
  const resource = await getResource(resourceId)

  if (!resource) {
    return { error: 'Not found' }
  }

  const permissions = await fetchPermissions(userId)

  if (!permissions.canEdit) {
    return { error: 'Forbidden' }
  }

  return await updateResourceData(resource, permissions)
}
```

이 최적화는 건너뛰는 분기가 자주 실행되거나, 지연된 연산이 비용이 큰 경우에 특히 효과적입니다.
