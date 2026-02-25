---
title: 예상되는 하이드레이션 불일치 억제하기
impact: LOW-MEDIUM
impactDescription: 알려진 차이에 대한 불필요한 하이드레이션 경고 방지
tags: rendering, hydration, ssr, nextjs
---

## 예상되는 하이드레이션 불일치 억제하기

SSR 프레임워크(예: Next.js)에서 일부 값은 의도적으로 서버와 클라이언트에서 다릅니다(랜덤 ID, 날짜, 로케일/타임존 포매팅). 이러한 _예상된_ 불일치에 대해, 동적 텍스트를 `suppressHydrationWarning`이 있는 엘리먼트로 감싸 불필요한 경고를 방지합니다. 실제 버그를 숨기기 위해 사용하지 마세요. 남용하지 마세요.

**잘못된 예 (알려진 불일치 경고):**

```tsx
function Timestamp() {
  return <span>{new Date().toLocaleString()}</span>
}
```

**올바른 예 (예상된 불일치만 억제):**

```tsx
function Timestamp() {
  return <span suppressHydrationWarning>{new Date().toLocaleString()}</span>
}
```
