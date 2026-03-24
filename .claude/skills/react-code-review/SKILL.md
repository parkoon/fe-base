---
name: react-code-review
description: React 코드의 구조적 품질을 리뷰하는 스킬. 추상화 레벨, 단일책임원칙(SRP),
  관심사 분리를 중심으로 컴포넌트/훅/유틸의 설계를 분석합니다. 코드 리뷰 요청, PR 리뷰,
  "이 코드 봐줘", "구조가 맞는지 확인해줘", "리팩토링 포인트 찾아줘" 등의 요청에서
  활성화됩니다. staged 파일 리뷰, 특정 파일/디렉토리 리뷰 모두 지원합니다.
---

# React 구조적 코드 리뷰

React 코드의 **설계 품질**을 분석하는 리뷰 스킬입니다. 성능이나 스타일이 아닌, 코드가 올바른 단위로 나뉘어 있는지, 각 단위가 적절한 책임만 갖는지, 추상화 수준이 일관되는지를 봅니다.

## 리뷰 원칙

### 1. 추상화 레벨 일관성 (Abstraction Level Consistency)

하나의 함수나 컴포넌트 안에서 추상화 수준이 섞이면 읽는 사람이 계속 컨텍스트를 전환해야 합니다. 높은 수준의 비즈니스 로직과 낮은 수준의 구현 디테일이 같은 레벨에 있으면 안 됩니다.

**진단 기준:**

- 컴포넌트의 JSX 안에 인라인 데이터 변환 로직(`.filter().map().sort()`)이 있는가?
- 이벤트 핸들러 안에서 API 호출, 상태 업데이트, UI 로직이 한꺼번에 처리되는가?
- 고수준 오케스트레이션(워크플로우 단계 관리)과 저수준 구현(DOM 조작, 포맷팅)이 같은 함수에 있는가?

**개선 방향:**

- 데이터 변환은 커스텀 훅이나 유틸 함수로 추출
- 복잡한 인라인 로직은 의미 있는 이름의 변수나 함수로 추출
- 한 함수 안의 모든 코드가 같은 "높이"에서 읽히도록 구성

**예시 — 추상화 레벨이 섞인 코드:**

```tsx
function OrderPage() {
  const { data } = useQuery(...)

  return (
    <div>
      <h1>주문 목록</h1>
      {data
        ?.filter(order => order.status !== 'CANCELLED' && order.createdAt > cutoffDate)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(order => (
          <div key={order.id}>
            <span>{order.customerName}</span>
            <span>{new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(order.total)}</span>
          </div>
        ))}
    </div>
  )
}
```

**개선된 코드:**

```tsx
function OrderPage() {
  const { data } = useQuery(...)
  const activeOrders = useActiveOrders(data)  // 필터 + 정렬 로직 캡슐화

  return (
    <div>
      <h1>주문 목록</h1>
      {activeOrders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
```

### 2. 단일 책임 원칙 (Single Responsibility Principle)

컴포넌트, 훅, 함수는 각각 하나의 명확한 이유로만 변경되어야 합니다. "이 컴포넌트는 왜 바뀔 수 있는가?"를 물었을 때, 대답이 2개 이상이면 분리를 고려해야 합니다.

**진단 기준:**

- 컴포넌트가 데이터 페칭 + UI 렌더링 + 비즈니스 로직을 모두 직접 수행하는가?
- 하나의 커스텀 훅이 서로 관련 없는 여러 상태를 관리하는가?
- 파일이 200줄 이상이면서 여러 관심사를 포함하는가?
- 컴포넌트의 props가 7개 이상이면서 서로 다른 관심사에 속하는가?

**컴포넌트의 역할 분류:**

| 역할           | 책임                             | 예시                            |
| -------------- | -------------------------------- | ------------------------------- |
| Container      | 데이터 페칭, 상태 오케스트레이션 | `OrderListPage`                 |
| Presentational | UI 렌더링, 스타일링              | `OrderCard`, `StatusBadge`      |
| Behavior       | 재사용 가능한 인터랙션 로직      | `useDebounce`, `usePagination`  |
| Connector      | 외부 시스템 연결                 | `useOrderQuery`, `useAuthStore` |

하나의 컴포넌트가 여러 역할을 겸하면 변경 이유가 늘어납니다.

**예시 — 여러 책임이 혼재된 훅:**

```tsx
function useOrderManagement() {
  // 책임 1: 주문 목록 페칭
  const ordersQuery = useQuery(...)

  // 책임 2: 필터 상태 관리
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dateRange, setDateRange] = useState(...)

  // 책임 3: 주문 생성 뮤테이션
  const createMutation = useMutation(...)

  // 책임 4: 페이지네이션
  const [page, setPage] = useState(1)

  return { ordersQuery, statusFilter, setStatusFilter, dateRange, setDateRange, createMutation, page, setPage }
}
```

**개선된 코드:**

```tsx
// 각 훅이 하나의 책임만 가짐
function useOrderListQuery(filters) { ... }
function useOrderFilters() { ... }
function useCreateOrderMutation() { ... }
function usePagination(initialPage) { ... }
```

### 3. 관심사 분리 (Separation of Concerns)

서로 다른 관심사는 서로 다른 모듈에 있어야 합니다. 특히 React에서는 **UI 관심사**, **데이터 관심사**, **비즈니스 로직 관심사**가 명확히 분리되어야 합니다.

**진단 기준:**

- 컴포넌트 내부에서 API URL이나 엔드포인트를 직접 구성하는가?
- 날짜 포맷팅, 숫자 포맷팅 같은 유틸 로직이 컴포넌트에 인라인되어 있는가?
- 비즈니스 규칙(유효성 검증, 권한 체크)이 UI 코드와 섞여 있는가?
- 같은 데이터 변환 로직이 여러 컴포넌트에서 반복되는가?

**관심사별 위치:**

| 관심사        | 위치                | 패턴                        |
| ------------- | ------------------- | --------------------------- |
| API 통신      | `src/api/`          | queryOptions + service 함수 |
| 비즈니스 로직 | 커스텀 훅 또는 유틸 | 순수 함수 선호              |
| UI 상태       | 컴포넌트 또는 훅    | useState, useReducer        |
| 전역 상태     | store               | Zustand store               |
| 포맷팅/변환   | `src/lib/` 유틸     | 순수 함수                   |

**예시 — 관심사가 혼재된 코드:**

```tsx
function PermissionRequestForm() {
  const [step, setStep] = useState(1)
  const [datasourceId, setDatasourceId] = useState(0)
  const [tables, setTables] = useState([])

  // API 통신 관심사가 컴포넌트에 직접 존재
  const handleSubmit = async () => {
    const res = await fetch('/api/permissions/requests', {
      method: 'POST',
      body: JSON.stringify({
        datasourceId,
        tables: tables.map(t => ({ tableName: t.name, tableComment: t.comment })),
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        endDate: dayjs(endDate).format('YYYY-MM-DD'),
      })
    })
    if (res.ok) navigate('/permissions/my')
  }

  return (/* step별 UI + form + 테이블 선택 + 날짜 선택 모두 하나의 JSX */)
}
```

**개선된 코드:**

```tsx
// API 관심사 → src/api/permissions/
const usePostPermissionRequest = () => useMutation({ mutationFn: postPermissionRequest })

// UI 상태 관심사 → 커스텀 훅
const usePermissionFormSteps = () => {
  /* step 관리 로직 */
}

// 컴포넌트는 조합만 담당
function PermissionRequestForm() {
  const { step, next, prev } = usePermissionFormSteps()
  const mutation = usePostPermissionRequest()

  return (
    <StepContainer step={step}>
      <Step1_DatasourceSelect />
      <Step2_TableSelect />
      <Step3_FormSubmit onSubmit={mutation.mutate} />
    </StepContainer>
  )
}
```

## 리뷰 실행 방법

### 대상 파일 수집

1. **staged 파일 리뷰**: `git diff --cached --name-only`로 staged 파일 목록을 가져온 뒤, `.tsx`, `.ts` 파일만 필터링하여 리뷰
2. **특정 파일/디렉토리**: 사용자가 지정한 경로의 파일을 리뷰
3. **PR 리뷰**: `git diff main...HEAD --name-only`로 변경 파일을 가져와 리뷰

### 리뷰 출력 형식

각 파일에 대해 발견된 이슈를 아래 형식으로 보고합니다:

```
## 📋 파일명.tsx

### [카테고리] 이슈 제목
- **위치**: `파일:라인번호`
- **심각도**: 🔴 HIGH / 🟡 MEDIUM / 🟢 LOW
- **현재**: 무엇이 문제인지 간결하게
- **제안**: 어떻게 개선할 수 있는지 구체적으로
- **코드 예시** (필요한 경우): before/after 코드 스니펫
```

**카테고리 태그:**

- `[추상화]` — 추상화 레벨 불일치
- `[SRP]` — 단일 책임 원칙 위반
- `[관심사]` — 관심사 분리 미흡
- `[구조]` — 위 세 가지가 복합적으로 나타나는 구조적 문제

**심각도 기준:**

- 🔴 **HIGH**: 유지보수성에 직접 영향. 변경 시 여러 곳에 파급 효과. 즉시 개선 권장
- 🟡 **MEDIUM**: 코드 이해도를 낮추거나 향후 문제 가능성. 다음 리팩토링 시 개선 권장
- 🟢 **LOW**: 더 나은 패턴이 있지만 현재 동작에 문제 없음. 참고 수준

### 리뷰 마무리

모든 파일 리뷰 후, 전체 요약을 제공합니다:

```
## 📊 리뷰 요약

| 심각도 | 개수 |
|--------|------|
| 🔴 HIGH | N |
| 🟡 MEDIUM | N |
| 🟢 LOW | N |

### 핵심 개선 포인트
1. (가장 임팩트 있는 개선 사항)
2. ...
```

## 리뷰하지 않는 것

이 스킬은 **구조적 설계**에 집중합니다. 다음은 범위 밖입니다:

- 성능 최적화 (react-best-practices 스킬 영역)
- 컴포지션 패턴 (composition-patterns 스킬 영역)
- 코드 스타일/포맷팅 (ESLint/Prettier 영역)
- 타입 정의의 정확성 (TypeScript 컴파일러 영역)
- 테스트 커버리지
- 네이밍 컨벤션 (단, 추상화 레벨 표현과 관련된 네이밍은 리뷰)

## 판단의 균형

모든 코드를 잘게 쪼개라는 것이 아닙니다. 과도한 분리는 오히려 해롭습니다:

- **10줄짜리 간단한 컴포넌트**를 굳이 container/presentational로 분리할 필요 없음
- **한 곳에서만 쓰이는 로직**을 별도 파일로 추출하면 오히려 탐색이 어려워짐
- **아직 반복되지 않는 코드**를 "나중에 재사용할 수 있으니까" 미리 추상화하지 않기
- 컴포넌트가 100줄 이내이고 하나의 명확한 목적이 있다면, 내부에 인라인 로직이 있어도 괜찮음

핵심은 **복잡성이 실제로 문제를 일으키는 지점**에서 분리하는 것입니다. 리뷰 시 "이 분리가 실제로 코드를 더 이해하기 쉽게 만드는가?"를 항상 자문하세요.
