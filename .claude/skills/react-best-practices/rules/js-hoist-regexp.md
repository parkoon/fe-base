---
title: RegExp 생성 호이스팅
impact: LOW-MEDIUM
impactDescription: 재생성 방지
tags: javascript, regexp, optimization, memoization
---

## RegExp 생성 호이스팅

렌더 내부에서 RegExp를 생성하지 마세요. 모듈 스코프로 호이스팅하거나 `useMemo()`로 메모이제이션합니다.

**잘못된 예 (매 렌더마다 새 RegExp):**

```tsx
function Highlighter({ text, query }: Props) {
  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)
  return <>{parts.map((part, i) => ...)}</>
}
```

**올바른 예 (메모이제이션 또는 호이스팅):**

```tsx
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Highlighter({ text, query }: Props) {
  const regex = useMemo(
    () => new RegExp(`(${escapeRegex(query)})`, 'gi'),
    [query]
  )
  const parts = text.split(regex)
  return <>{parts.map((part, i) => ...)}</>
}
```

**경고 (글로벌 regex는 변경 가능한 상태를 가짐):**

글로벌 regex(`/g`)는 변경 가능한 `lastIndex` 상태를 가집니다:

```typescript
const regex = /foo/g
regex.test('foo') // true, lastIndex = 3
regex.test('foo') // false, lastIndex = 0
```
