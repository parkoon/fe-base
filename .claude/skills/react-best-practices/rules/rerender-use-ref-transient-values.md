---
title: 일시적인 값에 useRef 사용하기
impact: MEDIUM
impactDescription: 빈번한 업데이트에서 불필요한 리렌더 방지
tags: rerender, useref, state, performance
---

## 일시적인 값에 useRef 사용하기

값이 자주 변경되고 매 업데이트마다 리렌더를 원하지 않는 경우(예: 마우스 트래커, 인터벌, 일시적 플래그), `useState` 대신 `useRef`에 저장합니다. 컴포넌트 상태는 UI용으로 유지하고, ref는 일시적인 DOM 관련 값에 사용합니다. ref를 업데이트해도 리렌더가 트리거되지 않습니다.

**잘못된 예 (매 업데이트마다 렌더링):**

```tsx
function Tracker() {
  const [lastX, setLastX] = useState(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => setLastX(e.clientX)
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: lastX,
        width: 8,
        height: 8,
        background: 'black',
      }}
    />
  )
}
```

**올바른 예 (트래킹에 리렌더 없음):**

```tsx
function Tracker() {
  const lastXRef = useRef(0)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lastXRef.current = e.clientX
      const node = dotRef.current
      if (node) {
        node.style.transform = `translateX(${e.clientX}px)`
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={dotRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 8,
        height: 8,
        background: 'black',
        transform: 'translateX(0px)',
      }}
    />
  )
}
```
