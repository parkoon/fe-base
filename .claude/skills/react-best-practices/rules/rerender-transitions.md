---
title: 긴급하지 않은 업데이트에 Transition 사용하기
impact: MEDIUM
impactDescription: UI 반응성 유지
tags: rerender, transitions, startTransition, performance
---

## 긴급하지 않은 업데이트에 Transition 사용하기

빈번하지만 긴급하지 않은 상태 업데이트를 Transition으로 표시하여 UI 반응성을 유지합니다.

**잘못된 예 (매 스크롤마다 UI 블로킹):**

```tsx
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```

**올바른 예 (논블로킹 업데이트):**

```tsx
import { startTransition } from 'react'

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => {
      startTransition(() => setScrollY(window.scrollY))
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```
