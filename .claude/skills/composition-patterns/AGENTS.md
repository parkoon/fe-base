# React 컴포지션 패턴

**버전 1.0.0**
Engineering
2026년 1월

> **참고:**
> 이 문서는 주로 에이전트와 LLM이 컴포지션을 사용하여 React 코드베이스를 유지보수,
> 생성 또는 리팩토링할 때 따라야 할 가이드입니다. 사람도 유용하게 활용할 수 있지만,
> 여기의 지침은 AI 지원 워크플로우에서의 자동화와 일관성을 위해 최적화되어 있습니다.

---

## 개요

유연하고 유지보수하기 쉬운 React 컴포넌트를 구축하기 위한 컴포지션 패턴입니다.
Compound components, 상태 끌어올리기, 내부 컴포넌트 조합을 사용하여 boolean prop
남발을 방지합니다. 이 패턴들은 코드베이스가 커질수록 사람과 AI 에이전트 모두가
작업하기 쉽게 만들어줍니다.

---

## 목차

1. [컴포넌트 아키텍처](#1-컴포넌트-아키텍처) — **HIGH**
   - 1.1 [Boolean Prop 남발 방지](#11-boolean-prop-남발-방지)
   - 1.2 [Compound Components 사용](#12-compound-components-사용)
2. [상태 관리](#2-상태-관리) — **MEDIUM**
   - 2.1 [UI에서 상태 관리 분리](#21-ui에서-상태-관리-분리)
   - 2.2 [의존성 주입을 위한 제네릭 Context 인터페이스 정의](#22-의존성-주입을-위한-제네릭-context-인터페이스-정의)
   - 2.3 [상태를 Provider 컴포넌트로 끌어올리기](#23-상태를-provider-컴포넌트로-끌어올리기)
3. [구현 패턴](#3-구현-패턴) — **MEDIUM**
   - 3.1 [명시적인 컴포넌트 Variant 생성](#31-명시적인-컴포넌트-variant-생성)
   - 3.2 [Render Props보다 Children 컴포지션 선호](#32-render-props보다-children-컴포지션-선호)
4. [React 19 APIs](#4-react-19-apis) — **MEDIUM**
   - 4.1 [React 19 API 변경 사항](#41-react-19-api-변경-사항)

---

## 1. 컴포넌트 아키텍처

**영향도: HIGH**

prop 남발을 방지하고 유연한 컴포지션을 가능하게 하는 컴포넌트 구조화의
기본 패턴입니다.

### 1.1 Boolean Prop 남발 방지

**영향도: CRITICAL (유지보수 불가능한 컴포넌트 variant 방지)**

컴포넌트 동작을 커스터마이징하기 위해 `isThread`, `isEditing`, `isDMThread` 같은
boolean prop을 추가하지 마세요. 각 boolean은 가능한 상태를 두 배로 만들고
유지보수 불가능한 조건부 로직을 생성합니다. 대신 컴포지션을 사용하세요.

**잘못된 예: boolean props가 지수적 복잡성을 생성**

```tsx
function Composer({
  onSubmit,
  isThread,
  channelId,
  isDMThread,
  dmId,
  isEditing,
  isForwarding,
}: Props) {
  return (
    <form>
      <Header />
      <Input />
      {isDMThread ? (
        <AlsoSendToDMField id={dmId} />
      ) : isThread ? (
        <AlsoSendToChannelField id={channelId} />
      ) : null}
      {isEditing ? <EditActions /> : isForwarding ? <ForwardActions /> : <DefaultActions />}
      <Footer onSubmit={onSubmit} />
    </form>
  )
}
```

**올바른 예: 컴포지션으로 조건문 제거**

```tsx
// 채널 컴포저
function ChannelComposer() {
  return (
    <Composer.Frame>
      <Composer.Header />
      <Composer.Input />
      <Composer.Footer>
        <Composer.Attachments />
        <Composer.Formatting />
        <Composer.Emojis />
        <Composer.Submit />
      </Composer.Footer>
    </Composer.Frame>
  )
}

// 스레드 컴포저 - "채널에도 전송" 필드 추가
function ThreadComposer({ channelId }: { channelId: string }) {
  return (
    <Composer.Frame>
      <Composer.Header />
      <Composer.Input />
      <AlsoSendToChannelField id={channelId} />
      <Composer.Footer>
        <Composer.Formatting />
        <Composer.Emojis />
        <Composer.Submit />
      </Composer.Footer>
    </Composer.Frame>
  )
}

// 편집 컴포저 - 다른 푸터 액션
function EditComposer() {
  return (
    <Composer.Frame>
      <Composer.Input />
      <Composer.Footer>
        <Composer.Formatting />
        <Composer.Emojis />
        <Composer.CancelEdit />
        <Composer.SaveEdit />
      </Composer.Footer>
    </Composer.Frame>
  )
}
```

각 variant는 무엇을 렌더링하는지 명시적입니다. 단일 모놀리식 부모 컴포넌트를
공유하지 않고도 내부 요소를 공유할 수 있습니다.

### 1.2 Compound Components 사용

**영향도: HIGH (prop drilling 없이 유연한 컴포지션 가능)**

공유 context를 가진 compound components로 복잡한 컴포넌트를 구조화하세요.
각 하위 컴포넌트는 props가 아닌 context를 통해 공유 상태에 접근합니다.
사용하는 쪽에서 필요한 조각들을 조합합니다.

**잘못된 예: render props를 사용한 모놀리식 컴포넌트**

```tsx
function Composer({
  renderHeader,
  renderFooter,
  renderActions,
  showAttachments,
  showFormatting,
  showEmojis,
}: Props) {
  return (
    <form>
      {renderHeader?.()}
      <Input />
      {showAttachments && <Attachments />}
      {renderFooter ? (
        renderFooter()
      ) : (
        <Footer>
          {showFormatting && <Formatting />}
          {showEmojis && <Emojis />}
          {renderActions?.()}
        </Footer>
      )}
    </form>
  )
}
```

**올바른 예: 공유 context를 가진 compound components**

```tsx
const ComposerContext = createContext<ComposerContextValue | null>(null)

function ComposerProvider({ children, state, actions, meta }: ProviderProps) {
  return <ComposerContext value={{ state, actions, meta }}>{children}</ComposerContext>
}

function ComposerFrame({ children }: { children: React.ReactNode }) {
  return <form>{children}</form>
}

function ComposerInput() {
  const {
    state,
    actions: { update },
    meta: { inputRef },
  } = use(ComposerContext)
  return (
    <TextInput
      ref={inputRef}
      value={state.input}
      onChangeText={(text) => update((s) => ({ ...s, input: text }))}
    />
  )
}

function ComposerSubmit() {
  const {
    actions: { submit },
  } = use(ComposerContext)
  return <Button onPress={submit}>전송</Button>
}

// Compound component로 export
const Composer = {
  Provider: ComposerProvider,
  Frame: ComposerFrame,
  Input: ComposerInput,
  Submit: ComposerSubmit,
  Header: ComposerHeader,
  Footer: ComposerFooter,
  Attachments: ComposerAttachments,
  Formatting: ComposerFormatting,
  Emojis: ComposerEmojis,
}
```

**사용법:**

```tsx
<Composer.Provider
  state={state}
  actions={actions}
  meta={meta}
>
  <Composer.Frame>
    <Composer.Header />
    <Composer.Input />
    <Composer.Footer>
      <Composer.Formatting />
      <Composer.Submit />
    </Composer.Footer>
  </Composer.Frame>
</Composer.Provider>
```

사용하는 쪽에서 정확히 필요한 것만 명시적으로 조합합니다. 숨겨진 조건문이 없습니다.
그리고 state, actions, meta는 부모 provider에 의해 의존성 주입되어, 동일한
컴포넌트 구조를 여러 곳에서 사용할 수 있습니다.

---

## 2. 상태 관리

**영향도: MEDIUM**

조합된 컴포넌트 간에 상태를 끌어올리고 공유 context를 관리하기 위한 패턴입니다.

### 2.1 UI에서 상태 관리 분리

**영향도: MEDIUM (UI 변경 없이 상태 구현 교체 가능)**

Provider 컴포넌트만이 상태 관리 방식을 알아야 합니다. UI 컴포넌트는 context
인터페이스를 사용합니다—상태가 useState, Zustand, 또는 서버 동기화에서 오는지
알 필요가 없습니다.

**잘못된 예: UI가 상태 구현에 결합됨**

```tsx
function ChannelComposer({ channelId }: { channelId: string }) {
  // UI 컴포넌트가 전역 상태 구현을 알고 있음
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

**올바른 예: 상태 관리가 provider에 격리됨**

```tsx
// Provider가 모든 상태 관리 세부사항을 처리
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

// UI 컴포넌트는 context 인터페이스만 알고 있음
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

**다른 provider, 동일한 UI:**

```tsx
// 일시적인 폼을 위한 로컬 상태
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

// 채널을 위한 전역 동기화 상태
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

동일한 `Composer.Input` 컴포넌트가 두 provider 모두에서 작동합니다.
구현이 아닌 context 인터페이스에만 의존하기 때문입니다.

### 2.2 의존성 주입을 위한 제네릭 Context 인터페이스 정의

**영향도: HIGH (사용 사례 전반에 걸쳐 의존성 주입 가능한 상태)**

컴포넌트 context를 위한 **제네릭 인터페이스**를 세 부분으로 정의하세요:
`state`, `actions`, `meta`. 이 인터페이스는 어떤 provider든 구현할 수 있는
계약입니다—동일한 UI 컴포넌트가 완전히 다른 상태 구현과 함께 작동할 수 있게
합니다.

**핵심 원칙:** 상태 끌어올리기, 내부 컴포넌트 조합, 상태를 의존성 주입 가능하게
만들기.

**잘못된 예: UI가 특정 상태 구현에 결합됨**

```tsx
function ComposerInput() {
  // 특정 훅에 강하게 결합됨
  const { input, setInput } = useChannelComposerState()
  return (
    <TextInput
      value={input}
      onChangeText={setInput}
    />
  )
}
```

**올바른 예: 제네릭 인터페이스로 의존성 주입 가능**

```tsx
// 어떤 provider든 구현할 수 있는 제네릭 인터페이스 정의
interface ComposerState {
  input: string
  attachments: Attachment[]
  isSubmitting: boolean
}

interface ComposerActions {
  update: (updater: (state: ComposerState) => ComposerState) => void
  submit: () => void
}

interface ComposerMeta {
  inputRef: React.RefObject<TextInput>
}

interface ComposerContextValue {
  state: ComposerState
  actions: ComposerActions
  meta: ComposerMeta
}

const ComposerContext = createContext<ComposerContextValue | null>(null)
```

**UI 컴포넌트는 구현이 아닌 인터페이스를 사용:**

```tsx
function ComposerInput() {
  const {
    state,
    actions: { update },
    meta,
  } = use(ComposerContext)

  // 이 컴포넌트는 인터페이스를 구현하는 모든 provider와 작동
  return (
    <TextInput
      ref={meta.inputRef}
      value={state.input}
      onChangeText={(text) => update((s) => ({ ...s, input: text }))}
    />
  )
}
```

**다른 provider가 동일한 인터페이스를 구현:**

```tsx
// Provider A: 일시적인 폼을 위한 로컬 상태
function ForwardMessageProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState)
  const inputRef = useRef(null)
  const submit = useForwardMessage()

  return (
    <ComposerContext
      value={{
        state,
        actions: { update: setState, submit },
        meta: { inputRef },
      }}
    >
      {children}
    </ComposerContext>
  )
}

// Provider B: 채널을 위한 전역 동기화 상태
function ChannelProvider({ channelId, children }: Props) {
  const { state, update, submit } = useGlobalChannel(channelId)
  const inputRef = useRef(null)

  return (
    <ComposerContext
      value={{
        state,
        actions: { update, submit },
        meta: { inputRef },
      }}
    >
      {children}
    </ComposerContext>
  )
}
```

**동일한 조합된 UI가 둘 다와 작동:**

```tsx
// ForwardMessageProvider(로컬 상태)와 작동
<ForwardMessageProvider>
  <Composer.Frame>
    <Composer.Input />
    <Composer.Submit />
  </Composer.Frame>
</ForwardMessageProvider>

// ChannelProvider(전역 동기화 상태)와 작동
<ChannelProvider channelId="abc">
  <Composer.Frame>
    <Composer.Input />
    <Composer.Submit />
  </Composer.Frame>
</ChannelProvider>
```

**컴포넌트 외부의 커스텀 UI도 상태와 액션에 접근 가능:**

```tsx
function ForwardMessageDialog() {
  return (
    <ForwardMessageProvider>
      <Dialog>
        {/* 컴포저 UI */}
        <Composer.Frame>
          <Composer.Input placeholder="원하시면 메시지를 추가하세요." />
          <Composer.Footer>
            <Composer.Formatting />
            <Composer.Emojis />
          </Composer.Footer>
        </Composer.Frame>

        {/* 컴포저 외부지만 provider 내부에 있는 커스텀 UI */}
        <MessagePreview />

        {/* 다이얼로그 하단의 액션 */}
        <DialogActions>
          <CancelButton />
          <ForwardButton />
        </DialogActions>
      </Dialog>
    </ForwardMessageProvider>
  )
}

// 이 버튼은 Composer.Frame 외부에 있지만 context를 기반으로 제출 가능!
function ForwardButton() {
  const {
    actions: { submit },
  } = use(ComposerContext)
  return <Button onPress={submit}>전달</Button>
}

// 이 프리뷰는 Composer.Frame 외부에 있지만 컴포저 상태를 읽을 수 있음!
function MessagePreview() {
  const { state } = use(ComposerContext)
  return (
    <Preview
      message={state.input}
      attachments={state.attachments}
    />
  )
}
```

중요한 것은 provider 경계입니다—시각적 중첩이 아닙니다. 공유 상태가 필요한
컴포넌트가 `Composer.Frame` 안에 있을 필요가 없습니다. provider 안에만 있으면
됩니다.

`ForwardButton`과 `MessagePreview`는 시각적으로 컴포저 박스 안에 있지 않지만,
여전히 상태와 액션에 접근할 수 있습니다. 이것이 상태를 provider로 끌어올리는
힘입니다.

UI는 함께 조합하는 재사용 가능한 조각입니다. 상태는 provider에 의해 의존성
주입됩니다. Provider를 교체하면서 UI는 유지하세요.

### 2.3 상태를 Provider 컴포넌트로 끌어올리기

**영향도: HIGH (컴포넌트 경계 외부에서 상태 공유 가능)**

상태 관리를 전용 provider 컴포넌트로 이동하세요. 이렇게 하면 메인 UI 외부의
형제 컴포넌트가 prop drilling이나 어색한 refs 없이 상태에 접근하고 수정할 수
있습니다.

**잘못된 예: 컴포넌트 안에 갇힌 상태**

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

// 문제: 이 버튼이 컴포저 상태에 어떻게 접근하나요?
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

**잘못된 예: useEffect로 상태 동기화**

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
    onInputChange(state.input) // 매번 변경 시 동기화 😬
  }, [state.input])
}
```

**잘못된 예: 제출 시 ref에서 상태 읽기**

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

**올바른 예: provider로 상태 끌어올리기**

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
  return <Button onPress={actions.submit}>전달</Button>
}
```

ForwardButton은 Composer.Frame 외부에 있지만 provider 안에 있기 때문에
submit 액션에 접근할 수 있습니다. 일회성 컴포넌트이지만, UI 자체 외부에서
컴포저의 상태와 액션에 접근할 수 있습니다.

**핵심 통찰:** 공유 상태가 필요한 컴포넌트가 시각적으로 서로 중첩되어 있을
필요가 없습니다—같은 provider 안에만 있으면 됩니다.

---

## 3. 구현 패턴

**영향도: MEDIUM**

Compound components와 context providers를 구현하기 위한 구체적인 기법입니다.

### 3.1 명시적인 컴포넌트 Variant 생성

**영향도: MEDIUM (자체 문서화 코드, 숨겨진 조건문 없음)**

많은 boolean props를 가진 하나의 컴포넌트 대신, 명시적인 variant 컴포넌트를
만드세요. 각 variant는 필요한 조각들을 조합합니다. 코드가 스스로를 문서화합니다.

**잘못된 예: 하나의 컴포넌트, 많은 모드**

```tsx
// 이 컴포넌트가 실제로 무엇을 렌더링하나요?
<Composer
  isThread
  isEditing={false}
  channelId="abc"
  showAttachments
  showFormatting={false}
/>
```

**올바른 예: 명시적인 variants**

```tsx
// 무엇을 렌더링하는지 즉시 명확함
<ThreadComposer channelId="abc" />

// 또는
<EditMessageComposer messageId="xyz" />

// 또는
<ForwardMessageComposer messageId="123" />
```

각 구현은 고유하고, 명시적이며, 자체 포함됩니다. 하지만 공유 부품을 사용할 수
있습니다.

**구현:**

```tsx
function ThreadComposer({ channelId }: { channelId: string }) {
  return (
    <ThreadProvider channelId={channelId}>
      <Composer.Frame>
        <Composer.Input />
        <AlsoSendToChannelField channelId={channelId} />
        <Composer.Footer>
          <Composer.Formatting />
          <Composer.Emojis />
          <Composer.Submit />
        </Composer.Footer>
      </Composer.Frame>
    </ThreadProvider>
  )
}

function EditMessageComposer({ messageId }: { messageId: string }) {
  return (
    <EditMessageProvider messageId={messageId}>
      <Composer.Frame>
        <Composer.Input />
        <Composer.Footer>
          <Composer.Formatting />
          <Composer.Emojis />
          <Composer.CancelEdit />
          <Composer.SaveEdit />
        </Composer.Footer>
      </Composer.Frame>
    </EditMessageProvider>
  )
}

function ForwardMessageComposer({ messageId }: { messageId: string }) {
  return (
    <ForwardMessageProvider messageId={messageId}>
      <Composer.Frame>
        <Composer.Input placeholder="원하시면 메시지를 추가하세요." />
        <Composer.Footer>
          <Composer.Formatting />
          <Composer.Emojis />
          <Composer.Mentions />
        </Composer.Footer>
      </Composer.Frame>
    </ForwardMessageProvider>
  )
}
```

각 variant는 다음을 명시합니다:

- 어떤 provider/상태를 사용하는지

- 어떤 UI 요소를 포함하는지

- 어떤 액션이 사용 가능한지

추론해야 할 boolean prop 조합이 없습니다. 불가능한 상태가 없습니다.

### 3.2 Render Props보다 Children 컴포지션 선호

**영향도: MEDIUM (더 깨끗한 컴포지션, 더 나은 가독성)**

`renderX` props 대신 `children`을 사용하여 컴포지션하세요. Children은 더
읽기 쉽고, 자연스럽게 조합되며, 콜백 시그니처를 이해할 필요가 없습니다.

**잘못된 예: render props**

```tsx
function Composer({
  renderHeader,
  renderFooter,
  renderActions,
}: {
  renderHeader?: () => React.ReactNode
  renderFooter?: () => React.ReactNode
  renderActions?: () => React.ReactNode
}) {
  return (
    <form>
      {renderHeader?.()}
      <Input />
      {renderFooter ? renderFooter() : <DefaultFooter />}
      {renderActions?.()}
    </form>
  )
}

// 사용이 어색하고 유연하지 않음
return (
  <Composer
    renderHeader={() => <CustomHeader />}
    renderFooter={() => (
      <>
        <Formatting />
        <Emojis />
      </>
    )}
    renderActions={() => <SubmitButton />}
  />
)
```

**올바른 예: children을 사용한 compound components**

```tsx
function ComposerFrame({ children }: { children: React.ReactNode }) {
  return <form>{children}</form>
}

function ComposerFooter({ children }: { children: React.ReactNode }) {
  return <footer className="flex">{children}</footer>
}

// 사용이 유연함
return (
  <Composer.Frame>
    <CustomHeader />
    <Composer.Input />
    <Composer.Footer>
      <Composer.Formatting />
      <Composer.Emojis />
      <SubmitButton />
    </Composer.Footer>
  </Composer.Frame>
)
```

**Render props가 적절한 경우:**

```tsx
// Render props는 데이터를 다시 전달해야 할 때 잘 작동
<List
  data={items}
  renderItem={({ item, index }) => (
    <Item
      item={item}
      index={index}
    />
  )}
/>
```

부모가 자식에게 데이터나 상태를 제공해야 할 때는 render props를 사용하세요.
정적 구조를 조합할 때는 children을 사용하세요.

---

## 4. React 19 APIs

**영향도: MEDIUM**

React 19 이상. `forwardRef`를 사용하지 마세요; `useContext()` 대신 `use()`를
사용하세요.

### 4.1 React 19 API 변경 사항

**영향도: MEDIUM (더 깨끗한 컴포넌트 정의와 context 사용)**

> **⚠️ React 19 이상에서만 적용.** React 18 이하라면 이 섹션을 건너뛰세요.

React 19에서 `ref`는 이제 일반 prop입니다(`forwardRef` 래퍼가 필요 없음),
그리고 `use()`가 `useContext()`를 대체합니다.

**잘못된 예: React 19에서 forwardRef**

```tsx
const ComposerInput = forwardRef<TextInput, Props>((props, ref) => {
  return (
    <TextInput
      ref={ref}
      {...props}
    />
  )
})
```

**올바른 예: ref를 일반 prop으로**

```tsx
function ComposerInput({ ref, ...props }: Props & { ref?: React.Ref<TextInput> }) {
  return (
    <TextInput
      ref={ref}
      {...props}
    />
  )
}
```

**잘못된 예: React 19에서 useContext**

```tsx
const value = useContext(MyContext)
```

**올바른 예: useContext 대신 use**

```tsx
const value = use(MyContext)
```

`use()`는 `useContext()`와 달리 조건부로 호출할 수도 있습니다.

---

## 참고 자료

1. [https://react.dev](https://react.dev)
2. [https://react.dev/learn/passing-data-deeply-with-context](https://react.dev/learn/passing-data-deeply-with-context)
3. [https://react.dev/reference/react/use](https://react.dev/reference/react/use)
