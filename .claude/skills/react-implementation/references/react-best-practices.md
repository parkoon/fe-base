# React Best Practices

## 빠른 참조

| 규칙                                           | 카테고리  | 임팩트      |
| ---------------------------------------------- | --------- | ----------- |
| 독립적인 연산에 Promise.all() 사용             | async     | CRITICAL    |
| API 라우트에서 워터폴 체인 방지                | async     | CRITICAL    |
| 의존성 기반 병렬화                             | async     | CRITICAL    |
| 필요할 때까지 Await 지연                       | async     | HIGH        |
| 전략적 Suspense 바운더리                       | async     | HIGH        |
| 배럴 파일 임포트 피하기                        | bundle    | CRITICAL    |
| 무거운 컴포넌트를 위한 동적 임포트             | bundle    | CRITICAL    |
| 조건부 모듈 로딩                               | bundle    | HIGH        |
| 사용자 의도 기반 프리로드                      | bundle    | MEDIUM      |
| 중요하지 않은 서드파티 지연 로드               | bundle    | MEDIUM      |
| 배열 비교 시 길이 먼저 확인                    | js        | MEDIUM-HIGH |
| 불변성을 위해 toSorted() 사용                  | js        | MEDIUM-HIGH |
| 레이아웃 스래싱 방지                           | js        | MEDIUM      |
| 반복 함수 호출 결과 캐싱                       | js        | MEDIUM      |
| 여러 배열 반복 합치기                          | js        | LOW-MEDIUM  |
| 함수에서 조기 반환                             | js        | LOW-MEDIUM  |
| 반복 조회를 위한 인덱스 Map 구축               | js        | LOW-MEDIUM  |
| O(1) 조회를 위한 Set/Map 사용                  | js        | LOW-MEDIUM  |
| RegExp 생성 호이스팅                           | js        | LOW-MEDIUM  |
| 루프에서 속성 접근 캐싱                        | js        | LOW-MEDIUM  |
| Storage API 호출 캐싱                          | js        | LOW-MEDIUM  |
| 정렬 대신 루프로 최솟값/최댓값 찾기            | js        | LOW         |
| CSS content-visibility (긴 리스트)             | rendering | HIGH        |
| 표시/숨김에 Activity 컴포넌트 사용             | rendering | MEDIUM      |
| 깜빡임 없이 하이드레이션 불일치 방지           | rendering | MEDIUM      |
| useTransition으로 로딩 상태 관리               | rendering | LOW         |
| 명시적 조건부 렌더링 (&&→삼항)                 | rendering | LOW         |
| 정적 JSX 엘리먼트 호이스팅                     | rendering | LOW         |
| SVG 엘리먼트 대신 래퍼에 애니메이션            | rendering | LOW         |
| 예상되는 하이드레이션 불일치 억제              | rendering | LOW-MEDIUM  |
| SVG 정밀도 최적화                              | rendering | LOW         |
| 함수형 setState 업데이트 사용                  | rerender  | MEDIUM      |
| 사용 시점까지 상태 읽기 지연                   | rerender  | MEDIUM      |
| 렌더링 중에 파생 상태 계산                     | rerender  | MEDIUM      |
| 파생 상태 구독하기                             | rerender  | MEDIUM      |
| 지연 상태 초기화 사용                          | rerender  | MEDIUM      |
| 일시적인 값에 useRef 사용                      | rerender  | MEDIUM      |
| 긴급하지 않은 업데이트에 Transition 사용       | rerender  | MEDIUM      |
| 인터랙션 로직을 이벤트 핸들러에 넣기           | rerender  | MEDIUM      |
| 메모이제이션된 컴포넌트로 추출하기             | rerender  | MEDIUM      |
| 메모이제이션된 컴포넌트의 기본값을 상수로 추출 | rerender  | MEDIUM      |
| Effect 의존성 좁히기                           | rerender  | LOW         |
| 단순 표현식에 useMemo 감싸지 않기              | rerender  | LOW-MEDIUM  |
| 스크롤 성능을 위한 패시브 이벤트 리스너        | client    | MEDIUM      |
| localStorage 데이터 버전 관리                  | client    | MEDIUM      |
| 전역 이벤트 리스너 중복 제거                   | client    | LOW         |
| 이벤트 핸들러를 Ref에 저장                     | advanced  | LOW         |
| 안정적인 콜백 Ref를 위한 useEffectEvent        | advanced  | LOW         |
| 마운트가 아닌 앱 단위로 한 번만 초기화         | advanced  | LOW-MEDIUM  |

---

## Async

### 독립적인 연산에 Promise.all() 사용 `[CRITICAL]`

서로 의존성이 없는 비동기 연산은 `Promise.all()`로 병렬 실행합니다.

```typescript
// ❌ 순차 실행 (3번 라운드 트립)
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()

// ✅ 병렬 실행 (1번 라운드 트립)
const [user, posts, comments] = await Promise.all([fetchUser(), fetchPosts(), fetchComments()])
```

---

### API 라우트에서 워터폴 체인 방지 `[CRITICAL]`

독립적인 연산을 await 전에 즉시 시작합니다.

```typescript
// ❌ 순차 실행
export async function GET() {
  const session = await auth()
  const config = await fetchConfig()
  const data = await fetchData(session.user.id)
  return Response.json({ data, config })
}

// ✅ 병렬 시작
export async function GET() {
  const sessionPromise = auth()
  const configPromise = fetchConfig()
  const session = await sessionPromise
  const [config, data] = await Promise.all([configPromise, fetchData(session.user.id)])
  return Response.json({ data, config })
}
```

---

### 의존성 기반 병렬화 `[CRITICAL]`

부분적 의존성이 있을 때 `better-all`로 병렬성을 극대화합니다.

```typescript
// ❌ profile이 config를 불필요하게 기다림
const [user, config] = await Promise.all([fetchUser(), fetchConfig()])
const profile = await fetchProfile(user.id)

// ✅ config와 profile이 병렬로 실행
import { all } from 'better-all'
const { user, config, profile } = await all({
  async user() {
    return fetchUser()
  },
  async config() {
    return fetchConfig()
  },
  async profile() {
    return fetchProfile((await this.$.user).id)
  },
})
```

---

### 필요할 때까지 Await 지연 `[HIGH]`

해당 값이 필요한 분기 안으로 `await`를 이동시킵니다.

```typescript
// ❌ 모든 분기를 블로킹
async function handle(userId: string, skip: boolean) {
  const userData = await fetchUserData(userId)
  if (skip) return { skipped: true }
  return processUserData(userData)
}

// ✅ 필요한 경우에만 블로킹
async function handle(userId: string, skip: boolean) {
  if (skip) return { skipped: true }
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

---

### 전략적 Suspense 바운더리 `[HIGH]`

데이터 의존 컴포넌트만 Suspense로 감싸 래퍼 UI를 즉시 표시합니다.

```tsx
// ❌ 전체 페이지 블로킹
async function Page() {
  const data = await fetchData()
  return (
    <div>
      <Sidebar />
      <DataDisplay data={data} />
    </div>
  )
}

// ✅ 필요한 부분만 대기
function Page() {
  return (
    <div>
      <Sidebar />
      <Suspense fallback={<Skeleton />}>
        <DataDisplay />
      </Suspense>
    </div>
  )
}
async function DataDisplay() {
  const data = await fetchData()
  return <div>{data.content}</div>
}
```

---

## Bundle

### 배럴 파일 임포트 피하기 `[CRITICAL]`

배럴 파일 대신 소스 파일에서 직접 임포트합니다. (lucide-react 전체 임포트 = ~1,583개 모듈 로드)

```tsx
// ❌ 전체 라이브러리 로드
import { Check, X, Menu } from 'lucide-react'

// ✅ 필요한 것만 로드
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
import Menu from 'lucide-react/dist/esm/icons/menu'
```

---

### 무거운 컴포넌트를 위한 동적 임포트 `[CRITICAL]`

초기 렌더에 불필요한 대용량 컴포넌트는 `lazy`/`dynamic`으로 지연 로드합니다.

```tsx
// ❌ 메인 번들에 포함 (~300KB)
import { MonacoEditor } from './monaco-editor'

// ✅ 필요 시 로드
const MonacoEditor = lazy(() =>
  import('./monaco-editor').then((m) => ({ default: m.MonacoEditor }))
)
```

---

### 조건부 모듈 로딩 `[HIGH]`

기능이 활성화될 때만 대용량 모듈을 로드합니다.

```tsx
// ✅ 활성화 시에만 로드
useEffect(() => {
  if (enabled && !frames) {
    import('./animation-frames.js').then((mod) => setFrames(mod.frames))
  }
}, [enabled, frames])
```

---

### 사용자 의도 기반 프리로드 `[MEDIUM]`

호버/포커스 시 미리 로드해 체감 지연을 줄입니다.

```tsx
// ✅ 호버 시 프리로드
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => void import('./monaco-editor')
  return (
    <button
      onMouseEnter={preload}
      onFocus={preload}
      onClick={onClick}
    >
      Open Editor
    </button>
  )
}
```

---

### 중요하지 않은 서드파티 지연 로드 `[MEDIUM]`

애널리틱스, 로깅 등은 하이드레이션 후 로드합니다.

```tsx
// ❌ 초기 번들 포함
import { Analytics } from '@vercel/analytics/react'

// ✅ 하이드레이션 후 로드
const Analytics = dynamic(() => import('@vercel/analytics/react').then((m) => m.Analytics), {
  ssr: false,
})
```

---

## Rerender

### 함수형 setState 업데이트 사용 `[MEDIUM]`

현재 상태 기반 업데이트에는 콜백 형태로 작성해 스테일 클로저와 불필요한 재생성을 방지합니다.

```tsx
// ❌ items 의존성으로 콜백 재생성
const addItems = useCallback(
  (newItems) => {
    setItems([...items, ...newItems])
  },
  [items]
)

// ✅ 안정적인 콜백, 의존성 불필요
const addItems = useCallback((newItems) => {
  setItems((curr) => [...curr, ...newItems])
}, [])
```

---

### 사용 시점까지 상태 읽기 지연 `[MEDIUM]`

콜백 내부에서만 사용하는 동적 상태는 구독하지 말고 사용 시점에 직접 읽습니다.

```tsx
// ❌ 모든 searchParams 변경에 구독
function ShareButton({ chatId }) {
  const searchParams = useSearchParams()
  const handleShare = () => shareChat(chatId, { ref: searchParams.get('ref') })
  return <button onClick={handleShare}>Share</button>
}

// ✅ 필요 시 읽기, 구독 없음
function ShareButton({ chatId }) {
  const handleShare = () => {
    const ref = new URLSearchParams(window.location.search).get('ref')
    shareChat(chatId, { ref })
  }
  return <button onClick={handleShare}>Share</button>
}
```

---

### 렌더링 중에 파생 상태 계산 `[MEDIUM]`

현재 state/props에서 계산 가능한 값은 상태로 저장하거나 Effect에서 업데이트하지 않습니다.

```tsx
// ❌ 불필요한 상태와 Effect
const [fullName, setFullName] = useState('')
useEffect(() => setFullName(firstName + ' ' + lastName), [firstName, lastName])

// ✅ 렌더 중에 파생
const fullName = firstName + ' ' + lastName
```

---

### 파생 상태 구독하기 `[MEDIUM]`

연속적인 값 대신 파생된 불리언에 구독해 리렌더 빈도를 줄입니다.

```tsx
// ❌ 픽셀 변경마다 리렌더
const width = useWindowWidth()
const isMobile = width < 768

// ✅ 불리언 전환 시에만 리렌더
const isMobile = useMediaQuery('(max-width: 767px)')
```

---

### 지연 상태 초기화 사용 `[MEDIUM]`

비용이 큰 초기값은 `useState`에 함수로 전달해 최초 렌더에만 실행합니다.

```tsx
// ❌ 매 렌더마다 실행
const [settings, setSettings] = useState(JSON.parse(localStorage.getItem('settings') || '{}'))

// ✅ 최초 렌더에만 실행
const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('settings') || '{}'))
```

---

### 일시적인 값에 useRef 사용 `[MEDIUM]`

자주 변경되지만 렌더가 필요 없는 값(마우스 위치, 타이머 등)은 `useRef`에 저장합니다.

```tsx
// ❌ 매 mousemove마다 리렌더
const [lastX, setLastX] = useState(0)
const onMove = (e) => setLastX(e.clientX)

// ✅ ref에 저장, 리렌더 없음 - DOM 직접 업데이트
const lastXRef = useRef(0)
const dotRef = useRef<HTMLDivElement>(null)
const onMove = (e) => {
  lastXRef.current = e.clientX
  if (dotRef.current) dotRef.current.style.transform = `translateX(${e.clientX}px)`
}
```

---

### 긴급하지 않은 업데이트에 Transition 사용 `[MEDIUM]`

빈번하지만 긴급하지 않은 업데이트를 `startTransition`으로 표시해 UI 반응성을 유지합니다.

```tsx
// ❌ 매 스크롤마다 UI 블로킹
const handler = () => setScrollY(window.scrollY)

// ✅ 논블로킹 업데이트
const handler = () => startTransition(() => setScrollY(window.scrollY))
```

---

### 인터랙션 로직을 이벤트 핸들러에 넣기 `[MEDIUM]`

사용자 액션에 의한 사이드 이펙트는 이벤트 핸들러에서 직접 실행합니다. 상태+Effect 패턴을 피합니다.

```tsx
// ❌ Effect로 모델링
const [submitted, setSubmitted] = useState(false)
useEffect(() => {
  if (submitted) {
    post('/api/register')
    showToast()
  }
}, [submitted])

// ✅ 핸들러에서 직접 실행
function handleSubmit() {
  post('/api/register')
  showToast()
}
```

---

### 메모이제이션된 컴포넌트로 추출하기 `[MEDIUM]`

비용이 큰 작업을 `memo` 컴포넌트로 추출하면 조기 반환으로 연산을 건너뜁니다.

```tsx
// ❌ 로딩 중에도 아바타 계산
function Profile({ user, loading }) {
  const avatar = useMemo(() => <Avatar id={computeAvatarId(user)} />, [user])
  if (loading) return <Skeleton />
  return <div>{avatar}</div>
}

// ✅ 로딩 시 계산 건너뜀
const UserAvatar = memo(({ user }) => <Avatar id={useMemo(() => computeAvatarId(user), [user])} />)
function Profile({ user, loading }) {
  if (loading) return <Skeleton />
  return (
    <div>
      <UserAvatar user={user} />
    </div>
  )
}
```

> React Compiler가 활성화된 프로젝트에서는 수동 메모이제이션 불필요.

---

### 메모이제이션된 컴포넌트의 기본값을 상수로 추출 `[MEDIUM]`

비원시 타입 기본값을 인라인으로 쓰면 매 렌더마다 새 인스턴스가 생성되어 `memo`가 깨집니다.

```tsx
// ❌ 매 렌더마다 새 함수 인스턴스
const UserAvatar = memo(({ onClick = () => {} }) => { ... })

// ✅ 안정적인 기본값 상수
const NOOP = () => {}
const UserAvatar = memo(({ onClick = NOOP }) => { ... })
```

---

### Effect 의존성 좁히기 `[LOW]`

객체 대신 원시 타입 의존성을 지정해 Effect 재실행을 최소화합니다.

```tsx
// ❌ user 필드가 하나라도 변경되면 재실행
useEffect(() => {
  console.log(user.id)
}, [user])

// ✅ id가 변경될 때만 재실행
useEffect(() => {
  console.log(user.id)
}, [user.id])
```

---

### 단순 표현식에 useMemo 감싸지 않기 `[LOW-MEDIUM]`

간단한 논리/산술 연산은 `useMemo` 오버헤드가 표현식 자체보다 클 수 있습니다.

```tsx
// ❌ 과도한 메모이제이션
const isLoading = useMemo(
  () => user.isLoading || notifications.isLoading,
  [user.isLoading, notifications.isLoading]
)

// ✅ 그냥 계산
const isLoading = user.isLoading || notifications.isLoading
```

---

## Rendering

### CSS content-visibility (긴 리스트) `[HIGH]`

`content-visibility: auto`로 화면 밖 항목의 렌더링을 지연시킵니다.

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

```tsx
// 1000개 메시지에서 ~990개 항목의 레이아웃/페인트를 건너뜁니다 (10배 빠른 초기 렌더)
function MessageList({ messages }) {
  return messages.map((msg) => (
    <div
      key={msg.id}
      className="message-item"
    >
      <Avatar user={msg.author} />
      <div>{msg.content}</div>
    </div>
  ))
}
```

---

### 표시/숨김에 Activity 컴포넌트 사용 `[MEDIUM]`

자주 토글되는 비용이 큰 컴포넌트에 `<Activity>`를 사용해 상태/DOM을 보존합니다.

```tsx
import { Activity } from 'react'

function Dropdown({ isOpen }) {
  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <ExpensiveMenu />
    </Activity>
  )
}
```

---

### 깜빡임 없이 하이드레이션 불일치 방지 `[MEDIUM]`

localStorage 기반 값을 React 하이드레이션 전에 DOM에 반영하려면 인라인 스크립트를 사용합니다.

```tsx
// ❌ 하이드레이션 후 업데이트 → 깜빡임
const [theme, setTheme] = useState('light')
useEffect(() => setTheme(localStorage.getItem('theme') ?? 'light'), [])

// ✅ 하이드레이션 전에 DOM 업데이트
function ThemeWrapper({ children }) {
  return (
    <>
      <div id="theme-wrapper">{children}</div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
        (function() {
          var theme = localStorage.getItem('theme') || 'light';
          var el = document.getElementById('theme-wrapper');
          if (el) el.className = theme;
        })();
      `,
        }}
      />
    </>
  )
}
```

---

### useTransition으로 로딩 상태 관리 `[LOW]`

수동 `isLoading` 상태 대신 `useTransition`의 `isPending`을 사용합니다.

```tsx
// ❌ 수동 관리
const [isLoading, setIsLoading] = useState(false)
const handleSearch = async (value) => {
  setIsLoading(true)
  const data = await fetchResults(value)
  setResults(data)
  setIsLoading(false)
}

// ✅ 내장 pending 상태
const [isPending, startTransition] = useTransition()
const handleSearch = (value) => {
  startTransition(async () => {
    const data = await fetchResults(value)
    setResults(data)
  })
}
```

---

### 명시적 조건부 렌더링 `[LOW]`

조건이 `0`이나 `NaN`일 수 있을 때 `&&` 대신 삼항 연산자를 사용합니다.

```tsx
// ❌ count=0이면 "0"을 렌더링
{
  count && <span>{count}</span>
}

// ✅ count=0이면 아무것도 렌더링 안 함
{
  count > 0 ? <span>{count}</span> : null
}
```

---

### 정적 JSX 엘리먼트 호이스팅 `[LOW]`

변하지 않는 JSX를 컴포넌트 외부로 추출해 재생성을 방지합니다.

```tsx
// ❌ 매 렌더마다 재생성
function Container() {
  return <div>{loading && <div className="h-20 animate-pulse bg-gray-200" />}</div>
}

// ✅ 같은 엘리먼트 재사용
const loadingSkeleton = <div className="h-20 animate-pulse bg-gray-200" />
function Container() {
  return <div>{loading && loadingSkeleton}</div>
}
```

> React Compiler가 활성화된 프로젝트에서는 자동으로 최적화됨.

---

### SVG 엘리먼트 대신 래퍼에 애니메이션 `[LOW]`

많은 브라우저에서 SVG에 CSS 애니메이션 하드웨어 가속이 없습니다. div 래퍼에 적용합니다.

```tsx
// ❌ SVG에 직접 (하드웨어 가속 없음)
<svg className="animate-spin">...</svg>

// ✅ 래퍼에 적용 (GPU 가속)
<div className="animate-spin"><svg>...</svg></div>
```

---

### 예상되는 하이드레이션 불일치 억제 `[LOW-MEDIUM]`

날짜, 랜덤 ID 등 의도적으로 서버/클라이언트 값이 다른 경우에만 사용합니다.

```tsx
// ❌ 하이드레이션 경고
<span>{new Date().toLocaleString()}</span>

// ✅ 예상된 불일치 억제 (남용 금지)
<span suppressHydrationWarning>{new Date().toLocaleString()}</span>
```

---

### SVG 정밀도 최적화 `[LOW]`

SVG 좌표 정밀도를 줄여 파일 크기를 감소시킵니다.

```bash
npx svgo --precision=1 --multipass icon.svg
```

```svg
<!-- ❌ 과도한 정밀도 -->
<path d="M 10.293847 20.847362 L 30.938472 40.192837" />

<!-- ✅ 소수점 1자리 -->
<path d="M 10.3 20.8 L 30.9 40.2" />
```

---

## JavaScript

### 배열 비교 시 길이 먼저 확인 `[MEDIUM-HIGH]`

길이가 다르면 배열은 같을 수 없습니다. 비용이 큰 비교 전에 O(1) 길이 확인으로 조기 반환합니다.

```typescript
// ❌ 항상 O(n log n) 정렬 실행
function hasChanges(a: string[], b: string[]) {
  return a.sort().join() !== b.sort().join()
}

// ✅ 길이 다르면 즉시 반환
function hasChanges(a: string[], b: string[]) {
  if (a.length !== b.length) return true
  const aSorted = a.toSorted()
  const bSorted = b.toSorted()
  for (let i = 0; i < aSorted.length; i++) {
    if (aSorted[i] !== bSorted[i]) return true
  }
  return false
}
```

---

### 불변성을 위해 toSorted() 사용 `[MEDIUM-HIGH]`

`.sort()`는 원본 배열을 변이시킵니다. React 상태/props 정렬에는 `.toSorted()`를 사용합니다.

```typescript
// ❌ users prop 배열 변이
const sorted = useMemo(() => users.sort((a, b) => a.name.localeCompare(b.name)), [users])

// ✅ 새 배열 생성, 원본 보존
const sorted = useMemo(() => users.toSorted((a, b) => a.name.localeCompare(b.name)), [users])
```

---

### 레이아웃 스래싱 방지 `[MEDIUM]`

스타일 쓰기와 레이아웃 읽기를 교차하면 강제 동기 리플로우가 발생합니다.

```typescript
// ❌ 교차된 읽기/쓰기 → 리플로우 강제
element.style.width = '100px'
const width = element.offsetWidth // 리플로우 강제!
element.style.height = '200px'

// ✅ 쓰기 배치 → 읽기
element.style.width = '100px'
element.style.height = '200px'
const { width, height } = element.getBoundingClientRect()
```

---

### 반복 함수 호출 결과 캐싱 `[MEDIUM]`

같은 입력으로 반복 호출되는 함수 결과를 모듈 레벨 Map으로 캐싱합니다.

```typescript
// ❌ 같은 이름으로 slugify()를 여러 번 호출
projects.map((p) => ({ ...p, slug: slugify(p.name) }))

// ✅ 캐시 후 재사용
const cache = new Map<string, string>()
function cachedSlugify(text: string) {
  if (!cache.has(text)) cache.set(text, slugify(text))
  return cache.get(text)!
}
projects.map((p) => ({ ...p, slug: cachedSlugify(p.name) }))
```

---

### 여러 배열 반복 합치기 `[LOW-MEDIUM]`

여러 번의 `.filter()`/`.map()` 대신 하나의 루프로 처리합니다.

```typescript
// ❌ 3번 반복
const admins = users.filter((u) => u.isAdmin)
const testers = users.filter((u) => u.isTester)
const inactive = users.filter((u) => !u.isActive)

// ✅ 1번 반복
const admins: User[] = [],
  testers: User[] = [],
  inactive: User[] = []
for (const user of users) {
  if (user.isAdmin) admins.push(user)
  if (user.isTester) testers.push(user)
  if (!user.isActive) inactive.push(user)
}
```

---

### 함수에서 조기 반환 `[LOW-MEDIUM]`

결과가 확정되면 즉시 반환해 불필요한 처리를 건너뜁니다.

```typescript
// ❌ 에러를 찾은 후에도 계속 반복
function validate(users: User[]) {
  let hasError = false
  for (const user of users) {
    if (!user.email) hasError = true
  }
  return hasError ? { valid: false } : { valid: true }
}

// ✅ 첫 번째 에러에서 즉시 반환
function validate(users: User[]) {
  for (const user of users) {
    if (!user.email) return { valid: false, error: 'Email required' }
  }
  return { valid: true }
}
```

---

### 반복 조회를 위한 인덱스 Map 구축 `[LOW-MEDIUM]`

같은 키로 `.find()`를 반복 호출하면 O(n²). Map으로 O(n) + O(1)로 최적화합니다.

```typescript
// ❌ 조회당 O(n) — 1000 orders × 1000 users = 100만 연산
orders.map((order) => ({ ...order, user: users.find((u) => u.id === order.userId) }))

// ✅ 조회당 O(1) — 2천 연산
const userById = new Map(users.map((u) => [u.id, u]))
orders.map((order) => ({ ...order, user: userById.get(order.userId) }))
```

---

### O(1) 조회를 위한 Set/Map 사용 `[LOW-MEDIUM]`

반복적인 멤버십 체크는 Set으로 O(n)→O(1)로 줄입니다.

```typescript
// ❌ 체크당 O(n)
const allowed = ['a', 'b', 'c']
items.filter((item) => allowed.includes(item.id))

// ✅ 체크당 O(1)
const allowed = new Set(['a', 'b', 'c'])
items.filter((item) => allowed.has(item.id))
```

---

### RegExp 생성 호이스팅 `[LOW-MEDIUM]`

렌더 내부에서 RegExp를 생성하지 않습니다. 모듈 스코프 상수나 `useMemo`로 처리합니다.

```tsx
// ❌ 매 렌더마다 새 RegExp
const regex = new RegExp(`(${query})`, 'gi')

// ✅ 정적이면 모듈 상수로, 동적이면 useMemo로
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const regex = useMemo(() => new RegExp(`(${escapeRegex(query)})`, 'gi'), [query])
```

---

### 루프에서 속성 접근 캐싱 `[LOW-MEDIUM]`

핫 패스에서 중첩 객체 속성 조회를 반복하지 않습니다.

```typescript
// ❌ N번 반복 × 3번 조회
for (let i = 0; i < arr.length; i++) {
  process(obj.config.settings.value)
}

// ✅ 1번 조회
const value = obj.config.settings.value
const len = arr.length
for (let i = 0; i < len; i++) {
  process(value)
}
```

---

### Storage API 호출 캐싱 `[LOW-MEDIUM]`

`localStorage`, `sessionStorage`는 동기 I/O입니다. 읽기를 메모리에 캐싱합니다.

```typescript
// ❌ 호출마다 스토리지 읽기
function getTheme() {
  return localStorage.getItem('theme') ?? 'light'
}

// ✅ 캐시 후 재사용
const storageCache = new Map<string, string | null>()
function getLocalStorage(key: string) {
  if (!storageCache.has(key)) storageCache.set(key, localStorage.getItem(key))
  return storageCache.get(key)
}
function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value)
  storageCache.set(key, value)
}
```

---

### 정렬 대신 루프로 최솟값/최댓값 찾기 `[LOW]`

최솟값/최댓값을 찾을 때 정렬(O(n log n)) 대신 단일 순회(O(n))를 사용합니다.

```typescript
// ❌ 전체 배열 정렬
const latest = [...projects].sort((a, b) => b.updatedAt - a.updatedAt)[0]

// ✅ 단일 루프
function getLatest(projects: Project[]) {
  let latest = projects[0]
  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt > latest.updatedAt) latest = projects[i]
  }
  return latest
}
```

---

## Client

### 스크롤 성능을 위한 패시브 이벤트 리스너 `[MEDIUM]`

`preventDefault()`를 호출하지 않는 터치/휠 리스너에 `{ passive: true }`를 추가해 스크롤 지연을 제거합니다.

```typescript
// ❌ 브라우저가 preventDefault 확인을 위해 대기
document.addEventListener('touchstart', handler)
document.addEventListener('wheel', handler)

// ✅ 브라우저가 즉시 스크롤
document.addEventListener('touchstart', handler, { passive: true })
document.addEventListener('wheel', handler, { passive: true })
```

---

### localStorage 데이터 버전 관리 `[MEDIUM]`

키에 버전 접두사를 추가하고 필요한 필드만 저장합니다. 스키마 충돌과 민감한 데이터 저장을 방지합니다.

```typescript
// ❌ 버전 없음, 전체 객체 저장
localStorage.setItem('userConfig', JSON.stringify(fullUserObject))

// ✅ 버전 접두사, 필요한 필드만, try-catch
const VERSION = 'v2'
function saveConfig(config: { theme: string; language: string }) {
  try {
    localStorage.setItem(`userConfig:${VERSION}`, JSON.stringify(config))
  } catch {} // 시크릿 모드, 할당량 초과 시 throw
}
function loadConfig() {
  try {
    const data = localStorage.getItem(`userConfig:${VERSION}`)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}
```

---

### 전역 이벤트 리스너 중복 제거 `[LOW]`

컴포넌트가 여러 인스턴스일 때 `useSWRSubscription`으로 전역 리스너를 공유합니다.

```tsx
// ❌ 인스턴스마다 별도 리스너 등록
useEffect(() => {
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [handler])

// ✅ 모든 인스턴스가 단일 리스너 공유 (useSWRSubscription 활용)
useSWRSubscription('global-keydown', () => {
  const handler = (e: KeyboardEvent) => {
    /* ... */
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
})
```

---

## Advanced

### 이벤트 핸들러를 Ref에 저장 `[LOW]`

콜백 변경 시 재구독하지 않아야 하는 Effect에서 사용되는 콜백은 ref에 저장합니다.

```tsx
// ❌ handler 변경마다 재구독
function useWindowEvent(event, handler) {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => window.removeEventListener(event, handler)
  }, [event, handler])
}

// ✅ 안정적인 구독 (최신 React: useEffectEvent 사용)
function useWindowEvent(event, handler) {
  const onEvent = useEffectEvent(handler)
  useEffect(() => {
    window.addEventListener(event, onEvent)
    return () => window.removeEventListener(event, onEvent)
  }, [event])
}
```

---

### 안정적인 콜백 Ref를 위한 useEffectEvent `[LOW]`

의존성 배열에 추가하지 않고 콜백에서 항상 최신 값에 접근합니다.

```tsx
// ❌ onSearch 변경마다 Effect 재실행
useEffect(() => {
  const timeout = setTimeout(() => onSearch(query), 300)
  return () => clearTimeout(timeout)
}, [query, onSearch])

// ✅ query 변경 시에만 Effect 실행, 최신 onSearch 참조
const onSearchEvent = useEffectEvent(onSearch)
useEffect(() => {
  const timeout = setTimeout(() => onSearchEvent(query), 300)
  return () => clearTimeout(timeout)
}, [query])
```

---

### 마운트가 아닌 앱 단위로 한 번만 초기화 `[LOW-MEDIUM]`

앱 전체 초기화는 `useEffect([])`가 아닌 모듈 레벨 가드를 사용합니다. (Strict Mode에서 두 번 실행 방지)

```tsx
// ❌ 개발 환경에서 두 번 실행, 리마운트 시 재실행
function App() {
  useEffect(() => {
    loadFromStorage()
    checkAuthToken()
  }, [])
}

// ✅ 앱 로드당 한 번
let didInit = false
function App() {
  useEffect(() => {
    if (didInit) return
    didInit = true
    loadFromStorage()
    checkAuthToken()
  }, [])
}
```
