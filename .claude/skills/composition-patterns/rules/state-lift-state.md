---
title: 프로바이더 컴포넌트로 상태 끌어올리기
impact: HIGH
impactDescription: 컴포넌트 경계 외부에서 상태 공유 가능
tags: composition, state, context, providers
---

## 프로바이더 컴포넌트로 상태 끌어올리기

상태 관리를 전용 프로바이더 컴포넌트로 옮기세요. 이렇게 하면 메인 UI 외부의 형제 컴포넌트가 prop 드릴링이나 불편한 ref 없이 상태에 접근하고 수정할 수 있습니다.

**잘못된 예 (상태가 컴포넌트 내부에 갇힘):**

```tsx
function ForwardMessageComposer() {
  const [state, setState] = useState(initialState)
  const forwardMessage = useForwardMessage()

  return (
    <Composer.Frame>
      <Composer.Input />
      <Composer.Footer />
    </Composer.Frame>
  )
}

// 문제: 이 버튼이 어떻게 컴포저 상태에 접근하나요?
function ForwardMessageDialog() {
  return (
    <Dialog>
      <ForwardMessageComposer />
      <MessagePreview /> {/* 컴포저 상태 필요 */}
      <DialogActions>
        <CancelButton />
        <ForwardButton /> {/* submit 호출 필요 */}
      </DialogActions>
    </Dialog>
  )
}
```

**잘못된 예 (useEffect로 상태를 위로 동기화):**

```tsx
function ForwardMessageDialog() {
  const [input, setInput] = useState('')
  return (
    <Dialog>
      <ForwardMessageComposer onInputChange={setInput} />
      <MessagePreview input={input} />
    </Dialog>
  )
}

function ForwardMessageComposer({ onInputChange }) {
  const [state, setState] = useState(initialState)
  useEffect(() => {
    onInputChange(state.input) // 매번 변경마다 동기화
  }, [state.input])
}
```

**잘못된 예 (제출 시 ref에서 상태 읽기):**

```tsx
function ForwardMessageDialog() {
  const stateRef = useRef(null)
  return (
    <Dialog>
      <ForwardMessageComposer stateRef={stateRef} />
      <ForwardButton onPress={() => submit(stateRef.current)} />
    </Dialog>
  )
}
```

**올바른 예 (상태를 프로바이더로 끌어올림):**

```tsx
function ForwardMessageProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState)
  const forwardMessage = useForwardMessage()
  const inputRef = useRef(null)

  return (
    <Composer.Provider
      state={state}
      actions={{ update: setState, submit: forwardMessage }}
      meta={{ inputRef }}
    >
      {children}
    </Composer.Provider>
  )
}

function ForwardMessageDialog() {
  return (
    <ForwardMessageProvider>
      <Dialog>
        <ForwardMessageComposer />
        <MessagePreview /> {/* 커스텀 컴포넌트가 상태와 액션에 접근 가능 */}
        <DialogActions>
          <CancelButton />
          <ForwardButton /> {/* 커스텀 컴포넌트가 상태와 액션에 접근 가능 */}
        </DialogActions>
      </Dialog>
    </ForwardMessageProvider>
  )
}

function ForwardButton() {
  const { actions } = use(Composer.Context)
  return <Button onPress={actions.submit}>Forward</Button>
}
```

ForwardButton은 Composer.Frame 외부에 있지만 프로바이더 내부에 있기 때문에 여전히 submit 액션에 접근할 수 있습니다. 일회성 컴포넌트이더라도 UI 자체 외부에서 컴포저의 상태와 액션에 접근할 수 있습니다.

**핵심 인사이트:** 공유 상태가 필요한 컴포넌트는 시각적으로 서로 중첩될 필요가 없습니다. 동일한 프로바이더 내부에 있기만 하면 됩니다.
