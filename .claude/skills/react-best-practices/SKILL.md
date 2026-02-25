---
name: vercel-react-best-practices
description: Vercel Engineering의 React 및 Next.js 성능 최적화 가이드라인입니다. React/Next.js 코드를 작성, 리뷰 또는 리팩토링할 때 최적의 성능 패턴을 보장하기 위해 이 스킬을 사용해야 합니다. React 컴포넌트, Next.js 페이지, 데이터 페칭, 번들 최적화 또는 성능 개선과 관련된 작업에서 활성화됩니다.
license: MIT
metadata:
  author: vercel
  version: '1.0.0'
---

# Vercel React 모범 사례

Vercel이 관리하는 React 및 Next.js 애플리케이션을 위한 종합 성능 최적화 가이드입니다. 영향도별로 우선순위가 지정된 8개 카테고리에 걸쳐 57개의 규칙이 포함되어 있어 자동화된 리팩토링과 코드 생성을 안내합니다.

## 적용 시점

다음 상황에서 이 가이드라인을 참조하세요:

- 새로운 React 컴포넌트나 Next.js 페이지를 작성할 때
- 데이터 페칭(클라이언트 또는 서버 사이드)을 구현할 때
- 성능 이슈에 대한 코드를 리뷰할 때
- 기존 React/Next.js 코드를 리팩토링할 때
- 번들 사이즈나 로드 시간을 최적화할 때

## 우선순위별 규칙 카테고리

| 우선순위 | 카테고리                      | 영향도      | 접두사       |
| -------- | ----------------------------- | ----------- | ------------ |
| 1        | 워터폴 제거                   | CRITICAL    | `async-`     |
| 2        | 번들 사이즈 최적화            | CRITICAL    | `bundle-`    |
| 3        | 서버 사이드 성능              | HIGH        | `server-`    |
| 4        | 클라이언트 사이드 데이터 페칭 | MEDIUM-HIGH | `client-`    |
| 5        | 리렌더링 최적화               | MEDIUM      | `rerender-`  |
| 6        | 렌더링 성능                   | MEDIUM      | `rendering-` |
| 7        | JavaScript 성능               | LOW-MEDIUM  | `js-`        |
| 8        | 고급 패턴                     | LOW         | `advanced-`  |

## 빠른 참조

### 1. 워터폴 제거 (CRITICAL)

- `async-defer-await` - await를 실제로 사용되는 분기로 이동
- `async-parallel` - 독립적인 작업에는 Promise.all() 사용
- `async-dependencies` - 부분 의존성에는 better-all 사용
- `async-api-routes` - API 라우트에서 promise를 일찍 시작하고 늦게 await
- `async-suspense-boundaries` - Suspense를 사용하여 콘텐츠 스트리밍

### 2. 번들 사이즈 최적화 (CRITICAL)

- `bundle-barrel-imports` - 직접 import, barrel 파일 피하기
- `bundle-dynamic-imports` - 무거운 컴포넌트에는 next/dynamic 사용
- `bundle-defer-third-party` - 분석/로깅은 hydration 후 로드
- `bundle-conditional` - 기능이 활성화될 때만 모듈 로드
- `bundle-preload` - hover/focus 시 preload로 체감 속도 향상

### 3. 서버 사이드 성능 (HIGH)

- `server-auth-actions` - 서버 액션을 API 라우트처럼 인증
- `server-cache-react` - 요청별 중복 제거에 React.cache() 사용
- `server-cache-lru` - 요청 간 캐싱에 LRU 캐시 사용
- `server-dedup-props` - RSC props에서 중복 직렬화 방지
- `server-serialization` - 클라이언트 컴포넌트로 전달되는 데이터 최소화
- `server-parallel-fetching` - 컴포넌트를 재구조화하여 페칭 병렬화
- `server-after-nonblocking` - 블로킹하지 않는 작업에 after() 사용

### 4. 클라이언트 사이드 데이터 페칭 (MEDIUM-HIGH)

- `client-swr-dedup` - 자동 요청 중복 제거에 SWR 사용
- `client-event-listeners` - 전역 이벤트 리스너 중복 제거
- `client-passive-event-listeners` - 스크롤에는 passive 리스너 사용
- `client-localstorage-schema` - localStorage 데이터 버전 관리 및 최소화

### 5. 리렌더링 최적화 (MEDIUM)

- `rerender-defer-reads` - 콜백에서만 사용되는 상태는 구독하지 않기
- `rerender-memo` - 비용이 많이 드는 작업을 메모이제이션된 컴포넌트로 추출
- `rerender-memo-with-default-value` - 기본 비원시 props 호이스팅
- `rerender-dependencies` - effects에서 원시 의존성 사용
- `rerender-derived-state` - 원시 값이 아닌 파생된 boolean 구독
- `rerender-derived-state-no-effect` - effects가 아닌 렌더 중에 상태 파생
- `rerender-functional-setstate` - 안정적인 콜백을 위해 함수형 setState 사용
- `rerender-lazy-state-init` - 비용이 많이 드는 값에는 useState에 함수 전달
- `rerender-simple-expression-in-memo` - 단순 원시값에는 memo 피하기
- `rerender-move-effect-to-event` - 인터랙션 로직은 이벤트 핸들러에
- `rerender-transitions` - 긴급하지 않은 업데이트에 startTransition 사용
- `rerender-use-ref-transient-values` - 자주 변하는 일시적 값에는 refs 사용

### 6. 렌더링 성능 (MEDIUM)

- `rendering-animate-svg-wrapper` - SVG 요소가 아닌 div wrapper 애니메이션
- `rendering-content-visibility` - 긴 목록에 content-visibility 사용
- `rendering-hoist-jsx` - 정적 JSX를 컴포넌트 외부로 추출
- `rendering-svg-precision` - SVG 좌표 정밀도 줄이기
- `rendering-hydration-no-flicker` - 클라이언트 전용 데이터에 인라인 스크립트 사용
- `rendering-hydration-suppress-warning` - 예상된 mismatch 경고 억제
- `rendering-activity` - 보이기/숨기기에 Activity 컴포넌트 사용
- `rendering-conditional-render` - 조건부에 && 대신 삼항 연산자 사용
- `rendering-usetransition-loading` - 로딩 상태에 useTransition 선호

### 7. JavaScript 성능 (LOW-MEDIUM)

- `js-batch-dom-css` - classes나 cssText를 통해 CSS 변경 그룹화
- `js-index-maps` - 반복 조회를 위한 Map 구축
- `js-cache-property-access` - 루프에서 객체 속성 캐시
- `js-cache-function-results` - 함수 결과를 모듈 레벨 Map에 캐시
- `js-cache-storage` - localStorage/sessionStorage 읽기 캐시
- `js-combine-iterations` - 여러 filter/map을 하나의 루프로 결합
- `js-length-check-first` - 비용이 많이 드는 비교 전에 배열 길이 체크
- `js-early-exit` - 함수에서 일찍 반환
- `js-hoist-regexp` - RegExp 생성을 루프 밖으로 호이스팅
- `js-min-max-loop` - sort 대신 루프로 min/max 구하기
- `js-set-map-lookups` - O(1) 조회를 위해 Set/Map 사용
- `js-tosorted-immutable` - 불변성을 위해 toSorted() 사용

### 8. 고급 패턴 (LOW)

- `advanced-event-handler-refs` - 이벤트 핸들러를 refs에 저장
- `advanced-init-once` - 앱 로드당 한 번만 초기화
- `advanced-use-latest` - 안정적인 콜백 refs를 위한 useLatest

## 사용 방법

개별 규칙 파일에서 자세한 설명과 코드 예제를 확인하세요:

```
rules/async-parallel.md
rules/bundle-barrel-imports.md
```

각 규칙 파일에는 다음이 포함됩니다:

- 왜 중요한지에 대한 간략한 설명
- 설명이 포함된 잘못된 코드 예제
- 설명이 포함된 올바른 코드 예제
- 추가 컨텍스트 및 참조

## 전체 컴파일된 문서

모든 규칙이 펼쳐진 전체 가이드: `AGENTS.md`
