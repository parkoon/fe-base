---
title: 명시적 컴포넌트 변형 생성
impact: MEDIUM
impactDescription: 자기 문서화 코드, 숨겨진 조건문 없음
tags: composition, variants, architecture
---

## 명시적 컴포넌트 변형 생성

많은 boolean prop을 가진 하나의 컴포넌트 대신, 명시적인 변형 컴포넌트를 만드세요. 각 변형은 필요한 조각을 합성합니다. 코드가 스스로를 문서화합니다.

**잘못된 예 (하나의 컴포넌트에 많은 모드):**

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

**올바른 예 (명시적 변형):**

```tsx
// 무엇을 렌더링하는지 즉시 명확함
<ThreadComposer channelId="abc" />

// 또는
<EditMessageComposer messageId="xyz" />

// 또는
<ForwardMessageComposer messageId="123" />
```

각 구현은 고유하고, 명시적이며, 독립적입니다. 하지만 공유 파트를 각각 사용할 수 있습니다.

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

각 변형은 다음을 명시합니다:

- 어떤 프로바이더/상태를 사용하는지
- 어떤 UI 요소를 포함하는지
- 어떤 액션을 사용할 수 있는지

Boolean prop 조합에 대해 고민할 필요가 없습니다. 불가능한 상태가 없습니다.
