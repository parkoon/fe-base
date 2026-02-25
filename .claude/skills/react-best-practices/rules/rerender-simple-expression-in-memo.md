---
title: 원시 타입 결과의 간단한 표현식에 useMemo를 감싸지 않기
impact: LOW-MEDIUM
impactDescription: 매 렌더마다 낭비되는 연산
tags: rerender, useMemo, optimization
---

## 원시 타입 결과의 간단한 표현식에 useMemo를 감싸지 않기

표현식이 간단하고(몇 개의 논리 또는 산술 연산자) 원시 타입 결과(boolean, number, string)를 가질 때, `useMemo`로 감싸지 마세요.
`useMemo`를 호출하고 훅 의존성을 비교하는 것이 표현식 자체보다 더 많은 리소스를 소비할 수 있습니다.

**잘못된 예:**

```tsx
function Header({ user, notifications }: Props) {
  const isLoading = useMemo(() => {
    return user.isLoading || notifications.isLoading
  }, [user.isLoading, notifications.isLoading])

  if (isLoading) return <Skeleton />
  // 마크업 반환
}
```

**올바른 예:**

```tsx
function Header({ user, notifications }: Props) {
  const isLoading = user.isLoading || notifications.isLoading

  if (isLoading) return <Skeleton />
  // 마크업 반환
}
```
