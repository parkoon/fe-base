---
title: 사용자 의도 기반 프리로드
impact: MEDIUM
impactDescription: 체감 지연 시간 단축
tags: bundle, preload, user-intent, hover
---

## 사용자 의도 기반 프리로드

무거운 번들이 필요하기 전에 미리 로드하여 체감 지연 시간을 줄입니다.

**예시 (호버/포커스 시 프리로드):**

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== 'undefined') {
      void import('./monaco-editor')
    }
  }

  return (
    <button
      onMouseEnter={preload}
      onFocus={preload}
      onClick={onClick}
    >
      Open Editor
    </button>
  )
}
```

**예시 (피처 플래그 활성화 시 프리로드):**

```tsx
function FlagsProvider({ children, flags }: Props) {
  useEffect(() => {
    if (flags.editorEnabled && typeof window !== 'undefined') {
      void import('./monaco-editor').then((mod) => mod.init())
    }
  }, [flags.editorEnabled])

  return <FlagsContext.Provider value={flags}>{children}</FlagsContext.Provider>
}
```

`typeof window !== 'undefined'` 체크는 프리로드 모듈이 SSR용으로 번들링되는 것을 방지하여, 서버 번들 크기와 빌드 속도를 최적화합니다.
