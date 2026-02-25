---
name: vercel-composition-patterns
description: 확장 가능한 React 컴포지션 패턴. Boolean prop 남발로 인한 컴포넌트 리팩토링,
  유연한 컴포넌트 라이브러리 구축, 재사용 가능한 API 설계 시 사용합니다.
  Compound components, render props, context providers, 컴포넌트 아키텍처와
  관련된 작업에서 활성화됩니다. React 19 API 변경 사항도 포함되어 있습니다.
license: MIT
metadata:
  author: vercel
  version: '1.0.0'
---

# React 컴포지션 패턴

유연하고 유지보수하기 쉬운 React 컴포넌트를 구축하기 위한 컴포지션 패턴입니다.
Compound components, 상태 끌어올리기, 내부 컴포넌트 조합을 사용하여 boolean prop
남발을 방지합니다. 이 패턴들은 코드베이스가 커질수록 사람과 AI 에이전트 모두가
작업하기 쉽게 만들어줍니다.

## 적용 시점

다음 상황에서 이 가이드라인을 참조하세요:

- 많은 boolean prop을 가진 컴포넌트를 리팩토링할 때
- 재사용 가능한 컴포넌트 라이브러리를 구축할 때
- 유연한 컴포넌트 API를 설계할 때
- 컴포넌트 아키텍처를 리뷰할 때
- Compound components나 context providers 작업 시

## 우선순위별 규칙 카테고리

| 우선순위 | 카테고리          | 영향도 | 접두사          |
| -------- | ----------------- | ------ | --------------- |
| 1        | 컴포넌트 아키텍처 | HIGH   | `architecture-` |
| 2        | 상태 관리         | MEDIUM | `state-`        |
| 3        | 구현 패턴         | MEDIUM | `patterns-`     |
| 4        | React 19 APIs     | MEDIUM | `react19-`      |

## 빠른 참조

### 1. 컴포넌트 아키텍처 (HIGH)

- `architecture-avoid-boolean-props` - 동작을 커스터마이징하기 위해 boolean prop을
  추가하지 마세요; 컴포지션을 사용하세요
- `architecture-compound-components` - 공유 context로 복잡한 컴포넌트를 구조화하세요

### 2. 상태 관리 (MEDIUM)

- `state-decouple-implementation` - Provider만이 상태 관리 방식을 알아야 합니다
- `state-context-interface` - 의존성 주입을 위해 state, actions, meta로 구성된
  제네릭 인터페이스를 정의하세요
- `state-lift-state` - 형제 컴포넌트 접근을 위해 상태를 provider 컴포넌트로
  끌어올리세요

### 3. 구현 패턴 (MEDIUM)

- `patterns-explicit-variants` - boolean 모드 대신 명시적인 variant 컴포넌트를
  만드세요
- `patterns-children-over-render-props` - renderX props 대신 children을 사용하여
  컴포지션하세요

### 4. React 19 APIs (MEDIUM)

> **⚠️ React 19 이상에서만 적용됩니다.** React 18 이하를 사용하는 경우 이 섹션을
> 건너뛰세요.

- `react19-no-forwardref` - `forwardRef`를 사용하지 마세요; `useContext()` 대신
  `use()`를 사용하세요

## 사용 방법

개별 규칙 파일에서 자세한 설명과 코드 예제를 확인하세요:

```
rules/architecture-avoid-boolean-props.md
rules/state-context-interface.md
```

각 규칙 파일에는 다음이 포함됩니다:

- 왜 중요한지에 대한 간략한 설명
- 설명이 포함된 잘못된 코드 예제
- 설명이 포함된 올바른 코드 예제
- 추가 컨텍스트 및 참조

## 전체 컴파일된 문서

모든 규칙이 펼쳐진 전체 가이드: `AGENTS.md`
