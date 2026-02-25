---
title: 긴 리스트를 위한 CSS content-visibility
impact: HIGH
impactDescription: 더 빠른 초기 렌더
tags: rendering, css, content-visibility, long-lists
---

## 긴 리스트를 위한 CSS content-visibility

`content-visibility: auto`를 적용하여 화면 밖 렌더링을 지연시킵니다.

**CSS:**

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

**예시:**

```tsx
function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="h-screen overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="message-item"
        >
          <Avatar user={msg.author} />
          <div>{msg.content}</div>
        </div>
      ))}
    </div>
  )
}
```

1000개의 메시지에서, 브라우저는 화면 밖 ~990개 항목의 레이아웃/페인트를 건너뜁니다 (10배 더 빠른 초기 렌더).
