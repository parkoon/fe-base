# Clean Code Principles (React / TypeScript)

React 코드 설계 시 따르는 구조적 원칙입니다. 성능이나 스타일이 아닌, **코드가 올바른 단위로 나뉘어 있는지**, **각 단위가 적절한 책임만 갖는지**, **추상화 수준이 일관되는지**를 다룹니다.

---

## 1. 추상화 레벨 일관성

하나의 함수/컴포넌트 안에서 추상화 수준이 섞이면 읽는 사람이 계속 컨텍스트를 전환해야 합니다. 높은 수준의 비즈니스 로직과 낮은 수준의 구현 디테일이 같은 레벨에 있으면 안 됩니다.

**문제 징후:**

- JSX 안에 인라인 데이터 변환 로직(`.filter().map().sort()`)이 있음
- 이벤트 핸들러 안에서 API 호출, 상태 업데이트, UI 로직이 한꺼번에 처리됨
- 고수준 오케스트레이션과 저수준 구현(DOM 조작, 포맷팅)이 같은 함수에 존재

**개선 방향:**

- 데이터 변환은 커스텀 훅이나 유틸 함수로 추출
- 복잡한 인라인 로직은 의미 있는 이름의 변수나 함수로 추출
- 한 함수 안의 모든 코드가 같은 "높이"에서 읽히도록 구성

```tsx
// ❌ 추상화 레벨 혼재
function OrderPage() {
  const { data } = useQuery(...)
  return (
    <div>
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

// ✅ 추상화 레벨 일관
function OrderPage() {
  const { data } = useQuery(...)
  const activeOrders = useActiveOrders(data) // 필터 + 정렬 캡슐화
  return (
    <div>
      {activeOrders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}
```

---

## 2. 단일 책임 원칙 (SRP)

컴포넌트, 훅, 함수는 각각 하나의 명확한 이유로만 변경되어야 합니다. "이 컴포넌트는 왜 바뀔 수 있는가?"에 대한 답이 2개 이상이면 분리를 고려합니다.

**문제 징후:**

- 컴포넌트가 데이터 페칭 + UI 렌더링 + 비즈니스 로직을 모두 직접 수행
- 하나의 커스텀 훅이 서로 관련 없는 여러 상태를 관리
- 파일이 200줄 이상이면서 여러 관심사를 포함
- props가 7개 이상이면서 서로 다른 관심사에 속함

**컴포넌트 역할 분류:**

| 역할           | 책임                             | 예시                            |
| -------------- | -------------------------------- | ------------------------------- |
| Container      | 데이터 페칭, 상태 오케스트레이션 | `OrderListPage`                 |
| Presentational | UI 렌더링, 스타일링              | `OrderCard`, `StatusBadge`      |
| Behavior       | 재사용 가능한 인터랙션 로직      | `useDebounce`, `usePagination`  |
| Connector      | 외부 시스템 연결                 | `useOrderQuery`, `useAuthStore` |

```tsx
// ❌ 여러 책임이 혼재된 훅
function useOrderManagement() {
  const ordersQuery = useQuery(...)       // 책임 1: 데이터 페칭
  const [statusFilter, setStatusFilter] = useState('ALL') // 책임 2: 필터 상태
  const createMutation = useMutation(...) // 책임 3: 주문 생성
  const [page, setPage] = useState(1)    // 책임 4: 페이지네이션
  return { ordersQuery, statusFilter, createMutation, page, ... }
}

// ✅ 각 훅이 하나의 책임만 가짐
function useOrderListQuery(filters) { ... }
function useOrderFilters() { ... }
function useCreateOrderMutation() { ... }
function usePagination(initialPage) { ... }
```

---

## 3. 관심사 분리

서로 다른 관심사는 서로 다른 모듈에 위치해야 합니다. React에서는 **UI**, **데이터**, **비즈니스 로직** 관심사가 명확히 분리되어야 합니다.

**문제 징후:**

- 컴포넌트 내부에서 API URL/엔드포인트를 직접 구성
- 날짜/숫자 포맷팅 같은 유틸 로직이 컴포넌트에 인라인
- 비즈니스 규칙(유효성 검증, 권한 체크)이 UI 코드와 혼재
- 같은 데이터 변환 로직이 여러 컴포넌트에서 반복

**관심사별 위치:**

| 관심사        | 위치                | 패턴                        |
| ------------- | ------------------- | --------------------------- |
| API 통신      | `src/api/`          | queryOptions + service 함수 |
| 비즈니스 로직 | 커스텀 훅 또는 유틸 | 순수 함수 선호              |
| UI 상태       | 컴포넌트 또는 훅    | useState, useReducer        |
| 전역 UI 상태  | store               | Zustand store               |
| 포맷팅/변환   | `src/lib/` 유틸     | 순수 함수                   |

```tsx
// ❌ 관심사가 혼재된 컴포넌트
function PermissionRequestForm() {
  const handleSubmit = async () => {
    // API 통신 관심사가 컴포넌트에 직접 존재
    const res = await fetch('/api/permissions/requests', {
      method: 'POST',
      body: JSON.stringify({ ... }),
    })
    if (res.ok) navigate('/permissions/my')
  }
  return (/* step별 UI + form + 테이블 + 날짜 선택 모두 하나의 JSX */)
}

// ✅ 관심사별 분리
// API → src/api/permissions/
const usePostPermissionRequest = () => useMutation({ mutationFn: postPermissionRequest })

// UI 상태 → 커스텀 훅
const usePermissionFormSteps = () => { /* step 관리 */ }

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

---

## 과도한 분리 경계

모든 코드를 잘게 쪼개는 것이 목표가 아닙니다. 분리가 오히려 해로운 경우:

- 10줄짜리 간단한 컴포넌트를 container/presentational로 분리할 필요 없음
- 한 곳에서만 쓰이는 로직을 별도 파일로 추출하면 탐색이 어려워짐
- 아직 반복되지 않는 코드를 "나중에 재사용할 수 있으니까" 미리 추상화하지 않기
- 컴포넌트가 100줄 이내이고 하나의 명확한 목적이 있다면, 인라인 로직이 있어도 무방

핵심은 **복잡성이 실제로 문제를 일으키는 지점**에서만 분리하는 것입니다.
