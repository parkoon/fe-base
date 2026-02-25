---
title: 표시/숨김에 Activity 컴포넌트 사용하기
impact: MEDIUM
impactDescription: 상태/DOM 보존
tags: rendering, activity, visibility, state-preservation
---

## 표시/숨김에 Activity 컴포넌트 사용하기

자주 가시성이 토글되는 비용이 큰 컴포넌트의 상태/DOM을 보존하기 위해 React의 `<Activity>`를 사용합니다.

**사용법:**

```tsx
import { Activity } from 'react'

function Dropdown({ isOpen }: Props) {
  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <ExpensiveMenu />
    </Activity>
  )
}
```

비용이 큰 리렌더와 상태 손실을 방지합니다.
