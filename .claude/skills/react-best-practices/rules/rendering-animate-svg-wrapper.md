---
title: SVG 엘리먼트 대신 래퍼에 애니메이션 적용하기
impact: LOW
impactDescription: 하드웨어 가속 활성화
tags: rendering, svg, css, animation, performance
---

## SVG 엘리먼트 대신 래퍼에 애니메이션 적용하기

많은 브라우저에서 SVG 엘리먼트의 CSS3 애니메이션에 하드웨어 가속이 없습니다. SVG를 `<div>`로 감싸고 래퍼에 애니메이션을 적용합니다.

**잘못된 예 (SVG에 직접 애니메이션 - 하드웨어 가속 없음):**

```tsx
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
      />
    </svg>
  )
}
```

**올바른 예 (래퍼 div에 애니메이션 - 하드웨어 가속):**

```tsx
function LoadingSpinner() {
  return (
    <div className="animate-spin">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
        />
      </svg>
    </div>
  )
}
```

이는 모든 CSS 트랜스폼과 트랜지션(`transform`, `opacity`, `translate`, `scale`, `rotate`)에 적용됩니다. 래퍼 div는 브라우저가 더 부드러운 애니메이션을 위해 GPU 가속을 사용할 수 있게 합니다.
