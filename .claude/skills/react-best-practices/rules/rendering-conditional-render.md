---
title: 명시적 조건부 렌더링 사용하기
impact: LOW
impactDescription: 0 또는 NaN 렌더링 방지
tags: rendering, conditional, jsx, falsy-values
---

## 명시적 조건부 렌더링 사용하기

조건이 `0`, `NaN`, 또는 렌더링되는 다른 falsy 값일 수 있을 때, 조건부 렌더링에 `&&` 대신 명시적 삼항 연산자(`? :`)를 사용합니다.

**잘못된 예 (count가 0일 때 "0"을 렌더링):**

```tsx
function Badge({ count }: { count: number }) {
  return <div>{count && <span className="badge">{count}</span>}</div>
}

// count = 0일 때, 렌더링: <div>0</div>
// count = 5일 때, 렌더링: <div><span class="badge">5</span></div>
```

**올바른 예 (count가 0일 때 아무것도 렌더링하지 않음):**

```tsx
function Badge({ count }: { count: number }) {
  return <div>{count > 0 ? <span className="badge">{count}</span> : null}</div>
}

// count = 0일 때, 렌더링: <div></div>
// count = 5일 때, 렌더링: <div><span class="badge">5</span></div>
```
