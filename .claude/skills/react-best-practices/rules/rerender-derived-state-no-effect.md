---
title: 렌더링 중에 파생 상태 계산하기
impact: MEDIUM
impactDescription: 불필요한 렌더와 상태 드리프트 방지
tags: rerender, derived-state, useEffect, state
---

## 렌더링 중에 파생 상태 계산하기

현재 props/state에서 계산할 수 있는 값이라면, 상태에 저장하거나 Effect에서 업데이트하지 마세요. 렌더 중에 파생하여 추가 렌더와 상태 드리프트를 방지합니다. prop 변경에 대한 응답으로만 Effect에서 상태를 설정하지 마세요; 파생 값이나 키 리셋을 대신 사용하세요.

**잘못된 예 (불필요한 상태와 Effect):**

```tsx
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    setFullName(firstName + ' ' + lastName)
  }, [firstName, lastName])

  return <p>{fullName}</p>
}
```

**올바른 예 (렌더 중에 파생):**

```tsx
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const fullName = firstName + ' ' + lastName

  return <p>{fullName}</p>
}
```

참고: [Effect가 필요하지 않을 수도 있습니다](https://react.dev/learn/you-might-not-need-an-effect)
