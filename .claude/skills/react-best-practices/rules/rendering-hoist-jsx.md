---
title: 정적 JSX 엘리먼트 호이스팅
impact: LOW
impactDescription: 재생성 방지
tags: rendering, jsx, static, optimization
---

## 정적 JSX 엘리먼트 호이스팅

정적 JSX를 컴포넌트 외부로 추출하여 재생성을 방지합니다.

**잘못된 예 (매 렌더마다 엘리먼트 재생성):**

```tsx
function LoadingSkeleton() {
  return <div className="h-20 animate-pulse bg-gray-200" />
}

function Container() {
  return <div>{loading && <LoadingSkeleton />}</div>
}
```

**올바른 예 (같은 엘리먼트 재사용):**

```tsx
const loadingSkeleton = <div className="h-20 animate-pulse bg-gray-200" />

function Container() {
  return <div>{loading && loadingSkeleton}</div>
}
```

이는 특히 크고 정적인 SVG 노드에 유용하며, 매 렌더마다 재생성하는 비용이 클 수 있습니다.

**참고:** 프로젝트에 [React Compiler](https://react.dev/learn/react-compiler)가 활성화되어 있다면, 컴파일러가 자동으로 정적 JSX 엘리먼트를 호이스팅하고 컴포넌트 리렌더를 최적화하므로 수동 호이스팅이 불필요합니다.
