---
title: Render Props보다 Children 합성 선호
impact: MEDIUM
impactDescription: 더 깔끔한 합성, 더 나은 가독성
tags: composition, children, render-props
---

## Render Props보다 Children 선호

합성에는 `renderX` prop 대신 `children`을 사용하세요. children은 더 읽기 쉽고, 자연스럽게 합성되며, 콜백 시그니처를 이해할 필요가 없습니다.

**잘못된 예 (render props):**

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

// 사용이 불편하고 유연하지 않음
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

**올바른 예 (children을 사용하는 복합 컴포넌트):**

```tsx
function ComposerFrame({ children }: { children: React.ReactNode }) {
  return <form>{children}</form>
}

function ComposerFooter({ children }: { children: React.ReactNode }) {
  return <footer className="flex">{children}</footer>
}

// 유연한 사용법
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

**render props가 적절한 경우:**

```tsx
// 부모가 데이터를 자식에게 전달해야 할 때 render props가 잘 맞음
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

부모가 자식에게 데이터나 상태를 제공해야 할 때는 render props를 사용하세요. 정적 구조를 합성할 때는 children을 사용하세요.
