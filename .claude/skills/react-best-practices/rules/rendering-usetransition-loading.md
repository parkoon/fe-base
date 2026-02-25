---
title: 수동 로딩 상태 대신 useTransition 사용하기
impact: LOW
impactDescription: 리렌더 감소 및 코드 명확성 향상
tags: rendering, transitions, useTransition, loading, state
---

## 수동 로딩 상태 대신 useTransition 사용하기

로딩 상태에 수동 `useState` 대신 `useTransition`을 사용합니다. 내장 `isPending` 상태를 제공하고 트랜지션을 자동으로 관리합니다.

**잘못된 예 (수동 로딩 상태):**

```tsx
function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (value: string) => {
    setIsLoading(true)
    setQuery(value)
    const data = await fetchResults(value)
    setResults(data)
    setIsLoading(false)
  }

  return (
    <>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isLoading && <Spinner />}
      <ResultsList results={results} />
    </>
  )
}
```

**올바른 예 (내장 pending 상태가 있는 useTransition):**

```tsx
import { useTransition, useState } from 'react'

function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  const handleSearch = (value: string) => {
    setQuery(value) // 입력 즉시 업데이트

    startTransition(async () => {
      // 결과 페칭 및 업데이트
      const data = await fetchResults(value)
      setResults(data)
    })
  }

  return (
    <>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </>
  )
}
```

**장점:**

- **자동 pending 상태**: `setIsLoading(true/false)`를 수동으로 관리할 필요 없음
- **에러 복원력**: 트랜지션이 throw해도 pending 상태가 올바르게 리셋됨
- **더 나은 반응성**: 업데이트 중에도 UI 반응성 유지
- **인터럽트 처리**: 새 트랜지션이 대기 중인 트랜지션을 자동으로 취소

Reference: [useTransition](https://react.dev/reference/react/useTransition)
