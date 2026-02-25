---
title: 루프에서 속성 접근 캐싱
impact: LOW-MEDIUM
impactDescription: 조회 횟수 감소
tags: javascript, loops, optimization, caching
---

## 루프에서 속성 접근 캐싱

핫 패스에서 객체 속성 조회를 캐싱합니다.

**잘못된 예 (N번 반복 × 3번 조회):**

```typescript
for (let i = 0; i < arr.length; i++) {
  process(obj.config.settings.value)
}
```

**올바른 예 (총 1번 조회):**

```typescript
const value = obj.config.settings.value
const len = arr.length
for (let i = 0; i < len; i++) {
  process(value)
}
```
