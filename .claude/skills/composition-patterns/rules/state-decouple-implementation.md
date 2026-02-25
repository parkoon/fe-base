---
title: 상태 관리와 UI 분리
impact: MEDIUM
impactDescription: UI 변경 없이 상태 구현 교체 가능
tags: composition, state, architecture
---

## 상태 관리와 UI 분리

프로바이더 컴포넌트만이 상태가 어떻게 관리되는지 알아야 합니다. UI 컴포넌트는 컨텍스트 인터페이스를 소비할 뿐, 상태가 useState에서 오는지, Zustand에서 오는지, 서버 동기화에서 오는지 알지 못합니다.

**잘못된 예 (UI가 상태 구현에 결합됨):**

```tsx
function ChannelComposer({ channelId }: { channelId: string }) {
  // UI 컴포넌트가 전역 상태 구현에 대해 알고 있음
  const state = useGlobalChannelState(channelId)
  const { submit, updateInput } = useChannelSync(channelId)

  return (
    <Composer.Frame>
      <Composer.Input
        value={state.input}
        onChange={(text) => sync.updateInput(text)}
      />
      <Composer.Submit onPress={() => sync.submit()} />
    </Composer.Frame>
  )
}
```

**올바른 예 (상태 관리를 프로바이더에 격리):**

```tsx
// 프로바이더가 모든 상태 관리 세부사항을 처리
function ChannelProvider({
  channelId,
  children,
}: {
  channelId: string
  children: React.ReactNode
}) {
  const { state, update, submit } = useGlobalChannel(channelId)
  const inputRef = useRef(null)

  return (
    <Composer.Provider
      state={state}
      actions={{ update, submit }}
      meta={{ inputRef }}
    >
      {children}
    </Composer.Provider>
  )
}

// UI 컴포넌트는 컨텍스트 인터페이스만 알면 됨
function ChannelComposer() {
  return (
    <Composer.Frame>
      <Composer.Header />
      <Composer.Input />
      <Composer.Footer>
        <Composer.Submit />
      </Composer.Footer>
    </Composer.Frame>
  )
}

// 사용법
function Channel({ channelId }: { channelId: string }) {
  return (
    <ChannelProvider channelId={channelId}>
      <ChannelComposer />
    </ChannelProvider>
  )
}
```

**서로 다른 프로바이더, 동일한 UI:**

```tsx
// 일회성 폼을 위한 로컬 상태
function ForwardMessageProvider({ children }) {
  const [state, setState] = useState(initialState)
  const forwardMessage = useForwardMessage()

  return (
    <Composer.Provider
      state={state}
      actions={{ update: setState, submit: forwardMessage }}
    >
      {children}
    </Composer.Provider>
  )
}

// 채널용 전역 동기화 상태
function ChannelProvider({ channelId, children }) {
  const { state, update, submit } = useGlobalChannel(channelId)

  return (
    <Composer.Provider
      state={state}
      actions={{ update, submit }}
    >
      {children}
    </Composer.Provider>
  )
}
```

동일한 `Composer.Input` 컴포넌트가 두 프로바이더 모두에서 동작합니다. 구현이 아닌 컨텍스트 인터페이스에만 의존하기 때문입니다.
