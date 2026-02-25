---
title: Storage API 호출 캐싱
impact: LOW-MEDIUM
impactDescription: 비용이 큰 I/O 감소
tags: javascript, localStorage, storage, caching, performance
---

## Storage API 호출 캐싱

`localStorage`, `sessionStorage`, `document.cookie`는 동기적이고 비용이 큽니다. 읽기를 메모리에 캐싱합니다.

**잘못된 예 (호출마다 스토리지 읽기):**

```typescript
function getTheme() {
  return localStorage.getItem('theme') ?? 'light'
}
// 10번 호출 = 10번 스토리지 읽기
```

**올바른 예 (Map 캐시):**

```typescript
const storageCache = new Map<string, string | null>()

function getLocalStorage(key: string) {
  if (!storageCache.has(key)) {
    storageCache.set(key, localStorage.getItem(key))
  }
  return storageCache.get(key)
}

function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value)
  storageCache.set(key, value) // 캐시 동기화 유지
}
```

유틸리티, 이벤트 핸들러 등 React 컴포넌트뿐만 아니라 어디서든 작동하도록 Map(훅이 아닌)을 사용합니다.

**쿠키 캐싱:**

```typescript
let cookieCache: Record<string, string> | null = null

function getCookie(name: string) {
  if (!cookieCache) {
    cookieCache = Object.fromEntries(document.cookie.split('; ').map((c) => c.split('=')))
  }
  return cookieCache[name]
}
```

**중요 (외부 변경 시 무효화):**

스토리지가 외부에서 변경될 수 있는 경우(다른 탭, 서버 설정 쿠키), 캐시를 무효화합니다:

```typescript
window.addEventListener('storage', (e) => {
  if (e.key) storageCache.delete(e.key)
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    storageCache.clear()
  }
})
```
