---
title: 인터랙션 로직을 이벤트 핸들러에 넣기
impact: MEDIUM
impactDescription: Effect 재실행과 중복 사이드 이펙트 방지
tags: rerender, useEffect, events, side-effects, dependencies
---

## 인터랙션 로직을 이벤트 핸들러에 넣기

사이드 이펙트가 특정 사용자 액션(제출, 클릭, 드래그)에 의해 트리거되면, 해당 이벤트 핸들러에서 실행합니다. 액션을 상태 + Effect로 모델링하지 마세요. 관련 없는 변경에 Effect가 재실행되고 액션이 중복될 수 있습니다.

**잘못된 예 (이벤트가 상태 + Effect로 모델링됨):**

```tsx
function Form() {
  const [submitted, setSubmitted] = useState(false)
  const theme = useContext(ThemeContext)

  useEffect(() => {
    if (submitted) {
      post('/api/register')
      showToast('Registered', theme)
    }
  }, [submitted, theme])

  return <button onClick={() => setSubmitted(true)}>Submit</button>
}
```

**올바른 예 (핸들러에서 직접 실행):**

```tsx
function Form() {
  const theme = useContext(ThemeContext)

  function handleSubmit() {
    post('/api/register')
    showToast('Registered', theme)
  }

  return <button onClick={handleSubmit}>Submit</button>
}
```

Reference: [이 코드를 이벤트 핸들러로 옮겨야 할까요?](https://react.dev/learn/removing-effect-dependencies#should-this-code-move-to-an-event-handler)
