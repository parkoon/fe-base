# React 모범 사례

**버전 1.0.0**
Vercel Engineering
2026년 1월

> **참고:**
> 이 문서는 주로 에이전트와 LLM이 React 및 Next.js 코드베이스를 유지보수,
> 생성 또는 리팩토링할 때 따라야 할 가이드입니다. 사람도 유용하게 활용할 수 있지만,
> 여기의 지침은 AI 지원 워크플로우에서의 자동화와 일관성을 위해 최적화되어 있습니다.

---

## 개요

AI 에이전트와 LLM을 위해 설계된 React 및 Next.js 애플리케이션의 종합 성능 최적화 가이드입니다. 8개 카테고리에 걸쳐 40개 이상의 규칙이 포함되어 있으며, 영향도에 따라 중요(워터폴 제거, 번들 사이즈 감소)부터 점진적(고급 패턴)까지 우선순위가 지정되어 있습니다. 각 규칙에는 자세한 설명, 잘못된 구현과 올바른 구현을 비교하는 실제 예제, 자동화된 리팩토링과 코드 생성을 안내하는 구체적인 영향 메트릭이 포함되어 있습니다.

---

## 목차

1. [워터폴 제거](#1-워터폴-제거) — **CRITICAL**
   - 1.1 [필요할 때까지 Await 지연](#11-필요할-때까지-await-지연)
   - 1.2 [의존성 기반 병렬화](#12-의존성-기반-병렬화)
   - 1.3 [API 라우트에서 워터폴 체인 방지](#13-api-라우트에서-워터폴-체인-방지)
   - 1.4 [독립적인 작업에 Promise.all()](#14-독립적인-작업에-promiseall)
   - 1.5 [전략적 Suspense 바운더리](#15-전략적-suspense-바운더리)
2. [번들 사이즈 최적화](#2-번들-사이즈-최적화) — **CRITICAL**
   - 2.1 [Barrel 파일 Import 피하기](#21-barrel-파일-import-피하기)
   - 2.2 [조건부 모듈 로딩](#22-조건부-모듈-로딩)
   - 2.3 [비필수 서드파티 라이브러리 지연](#23-비필수-서드파티-라이브러리-지연)
   - 2.4 [무거운 컴포넌트에 동적 Import](#24-무거운-컴포넌트에-동적-import)
   - 2.5 [사용자 의도에 따른 Preload](#25-사용자-의도에-따른-preload)
3. [서버 사이드 성능](#3-서버-사이드-성능) — **HIGH**
   - 3.1 [서버 액션을 API 라우트처럼 인증](#31-서버-액션을-api-라우트처럼-인증)
   - 3.2 [RSC Props에서 중복 직렬화 방지](#32-rsc-props에서-중복-직렬화-방지)
   - 3.3 [요청 간 LRU 캐싱](#33-요청-간-lru-캐싱)
   - 3.4 [RSC 바운더리에서 직렬화 최소화](#34-rsc-바운더리에서-직렬화-최소화)
   - 3.5 [컴포넌트 컴포지션을 통한 병렬 데이터 페칭](#35-컴포넌트-컴포지션을-통한-병렬-데이터-페칭)
   - 3.6 [React.cache()로 요청별 중복 제거](#36-reactcache로-요청별-중복-제거)
   - 3.7 [블로킹하지 않는 작업에 after() 사용](#37-블로킹하지-않는-작업에-after-사용)
4. [클라이언트 사이드 데이터 페칭](#4-클라이언트-사이드-데이터-페칭) — **MEDIUM-HIGH**
   - 4.1 [전역 이벤트 리스너 중복 제거](#41-전역-이벤트-리스너-중복-제거)
   - 4.2 [스크롤 성능을 위한 Passive 이벤트 리스너](#42-스크롤-성능을-위한-passive-이벤트-리스너)
   - 4.3 [자동 중복 제거를 위한 SWR 사용](#43-자동-중복-제거를-위한-swr-사용)
   - 4.4 [localStorage 데이터 버전 관리 및 최소화](#44-localstorage-데이터-버전-관리-및-최소화)
5. [리렌더링 최적화](#5-리렌더링-최적화) — **MEDIUM**
   - 5.1 [렌더링 중 파생 상태 계산](#51-렌더링-중-파생-상태-계산)
   - 5.2 [사용 시점까지 상태 읽기 지연](#52-사용-시점까지-상태-읽기-지연)
   - 5.3 [원시 결과의 단순 표현식을 useMemo로 감싸지 않기](#53-원시-결과의-단순-표현식을-usememo로-감싸지-않기)
   - 5.4 [메모이제이션된 컴포넌트의 기본 비원시 파라미터를 상수로 추출](#54-메모이제이션된-컴포넌트의-기본-비원시-파라미터를-상수로-추출)
   - 5.5 [메모이제이션된 컴포넌트로 추출](#55-메모이제이션된-컴포넌트로-추출)
   - 5.6 [Effect 의존성 좁히기](#56-effect-의존성-좁히기)
   - 5.7 [이벤트 핸들러에 인터랙션 로직 넣기](#57-이벤트-핸들러에-인터랙션-로직-넣기)
   - 5.8 [파생 상태 구독](#58-파생-상태-구독)
   - 5.9 [함수형 setState 업데이트 사용](#59-함수형-setstate-업데이트-사용)
   - 5.10 [지연 상태 초기화 사용](#510-지연-상태-초기화-사용)
   - 5.11 [긴급하지 않은 업데이트에 Transitions 사용](#511-긴급하지-않은-업데이트에-transitions-사용)
   - 5.12 [일시적 값에 useRef 사용](#512-일시적-값에-useref-사용)
6. [렌더링 성능](#6-렌더링-성능) — **MEDIUM**
   - 6.1 [SVG 요소 대신 Wrapper 애니메이션](#61-svg-요소-대신-wrapper-애니메이션)
   - 6.2 [긴 목록에 CSS content-visibility](#62-긴-목록에-css-content-visibility)
   - 6.3 [정적 JSX 요소 호이스팅](#63-정적-jsx-요소-호이스팅)
   - 6.4 [SVG 정밀도 최적화](#64-svg-정밀도-최적화)
   - 6.5 [깜빡임 없이 Hydration Mismatch 방지](#65-깜빡임-없이-hydration-mismatch-방지)
   - 6.6 [예상된 Hydration Mismatch 억제](#66-예상된-hydration-mismatch-억제)
   - 6.7 [보이기/숨기기에 Activity 컴포넌트 사용](#67-보이기숨기기에-activity-컴포넌트-사용)
   - 6.8 [명시적 조건부 렌더링 사용](#68-명시적-조건부-렌더링-사용)
   - 6.9 [수동 로딩 상태 대신 useTransition 사용](#69-수동-로딩-상태-대신-usetransition-사용)
7. [JavaScript 성능](#7-javascript-성능) — **LOW-MEDIUM**
   - 7.1 [레이아웃 스래싱 방지](#71-레이아웃-스래싱-방지)
   - 7.2 [반복 조회를 위한 인덱스 Map 구축](#72-반복-조회를-위한-인덱스-map-구축)
   - 7.3 [루프에서 속성 접근 캐시](#73-루프에서-속성-접근-캐시)
   - 7.4 [반복 함수 호출 캐시](#74-반복-함수-호출-캐시)
   - 7.5 [Storage API 호출 캐시](#75-storage-api-호출-캐시)
   - 7.6 [여러 배열 반복 결합](#76-여러-배열-반복-결합)
   - 7.7 [배열 비교 전 길이 체크](#77-배열-비교-전-길이-체크)
   - 7.8 [함수에서 조기 반환](#78-함수에서-조기-반환)
   - 7.9 [RegExp 생성 호이스팅](#79-regexp-생성-호이스팅)
   - 7.10 [Sort 대신 루프로 Min/Max 구하기](#710-sort-대신-루프로-minmax-구하기)
   - 7.11 [O(1) 조회를 위해 Set/Map 사용](#711-o1-조회를-위해-setmap-사용)
   - 7.12 [불변성을 위해 sort() 대신 toSorted() 사용](#712-불변성을-위해-sort-대신-tosorted-사용)
8. [고급 패턴](#8-고급-패턴) — **LOW**
   - 8.1 [마운트가 아닌 앱당 한 번 초기화](#81-마운트가-아닌-앱당-한-번-초기화)
   - 8.2 [이벤트 핸들러를 Refs에 저장](#82-이벤트-핸들러를-refs에-저장)
   - 8.3 [안정적인 콜백 Refs를 위한 useEffectEvent](#83-안정적인-콜백-refs를-위한-useeffectevent)

---

## 1. 워터폴 제거

**영향도: CRITICAL**

워터폴은 성능의 1순위 킬러입니다. 각 순차적 await는 전체 네트워크 지연을 추가합니다. 이를 제거하면 가장 큰 성능 향상을 얻을 수 있습니다.

### 1.1 필요할 때까지 Await 지연

**영향도: HIGH (사용되지 않는 코드 경로 차단 방지)**

`await` 작업을 실제로 사용되는 분기로 이동하여 필요하지 않은 코드 경로를 차단하지 마세요.

**잘못된 예: 두 분기 모두 차단**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)

  if (skipProcessing) {
    // 즉시 반환하지만 userData를 기다렸음
    return { skipped: true }
  }

  // 이 분기만 userData를 사용
  return processUserData(userData)
}
```

**올바른 예: 필요할 때만 차단**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    // 기다리지 않고 즉시 반환
    return { skipped: true }
  }

  // 필요할 때만 페칭
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

### 1.2 의존성 기반 병렬화

**영향도: CRITICAL (2-10배 향상)**

부분적인 의존성이 있는 작업에는 `better-all`을 사용하여 병렬성을 극대화하세요. 각 작업을 가능한 가장 이른 시점에 자동으로 시작합니다.

**잘못된 예: profile이 config를 불필요하게 기다림**

```typescript
const [user, config] = await Promise.all([fetchUser(), fetchConfig()])
const profile = await fetchProfile(user.id)
```

**올바른 예: config와 profile이 병렬로 실행**

```typescript
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

참고: [https://github.com/shuding/better-all](https://github.com/shuding/better-all)

### 1.3 API 라우트에서 워터폴 체인 방지

**영향도: CRITICAL (2-10배 향상)**

API 라우트와 서버 액션에서 독립적인 작업을 await하지 않더라도 즉시 시작하세요.

**잘못된 예: config가 auth를 기다리고, data가 둘 다 기다림**

```typescript
export async function GET(request: Request) {
  const session = await auth()
  const config = await fetchConfig()
  const data = await fetchData(session.user.id)
  return Response.json({ data, config })
}
```

**올바른 예: auth와 config가 즉시 시작**

```typescript
export async function GET(request: Request) {
  const sessionPromise = auth()
  const configPromise = fetchConfig()
  const session = await sessionPromise
  const [config, data] = await Promise.all([configPromise, fetchData(session.user.id)])
  return Response.json({ data, config })
}
```

### 1.4 독립적인 작업에 Promise.all()

**영향도: CRITICAL (2-10배 향상)**

비동기 작업이 서로 의존성이 없을 때 `Promise.all()`을 사용하여 동시에 실행하세요.

**잘못된 예: 순차 실행, 3번의 라운드 트립**

```typescript
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

**올바른 예: 병렬 실행, 1번의 라운드 트립**

```typescript
const [user, posts, comments] = await Promise.all([fetchUser(), fetchPosts(), fetchComments()])
```

### 1.5 전략적 Suspense 바운더리

**영향도: HIGH (더 빠른 초기 페인트)**

비동기 컴포넌트에서 JSX를 반환하기 전에 데이터를 await하는 대신, Suspense 바운더리를 사용하여 데이터가 로드되는 동안 wrapper UI를 더 빨리 보여주세요.

**잘못된 예: wrapper가 데이터 페칭으로 차단됨**

```tsx
async function Page() {
  const data = await fetchData() // 전체 페이지 차단

  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <DataDisplay data={data} />
      </div>
      <div>Footer</div>
    </div>
  )
}
```

**올바른 예: wrapper가 즉시 표시되고 데이터가 스트리밍됨**

```tsx
function Page() {
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <Suspense fallback={<Skeleton />}>
          <DataDisplay />
        </Suspense>
      </div>
      <div>Footer</div>
    </div>
  )
}

async function DataDisplay() {
  const data = await fetchData() // 이 컴포넌트만 차단
  return <div>{data.content}</div>
}
```

Sidebar, Header, Footer가 즉시 렌더링됩니다. DataDisplay만 데이터를 기다립니다.

---

## 2. 번들 사이즈 최적화

**영향도: CRITICAL**

초기 번들 사이즈를 줄이면 Time to Interactive와 Largest Contentful Paint가 개선됩니다.

### 2.1 Barrel 파일 Import 피하기

**영향도: CRITICAL (200-800ms import 비용, 느린 빌드)**

barrel 파일 대신 소스 파일에서 직접 import하여 사용하지 않는 수천 개의 모듈 로딩을 피하세요.

**잘못된 예: 전체 라이브러리 import**

```tsx
import { Check, X, Menu } from 'lucide-react'
// 1,583개 모듈 로드, dev에서 ~2.8초 추가

import { Button, TextField } from '@mui/material'
// 2,225개 모듈 로드, dev에서 ~4.2초 추가
```

**올바른 예: 필요한 것만 import**

```tsx
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
import Menu from 'lucide-react/dist/esm/icons/menu'
// 3개 모듈만 로드 (~2KB vs ~1MB)

import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
// 사용하는 것만 로드
```

**대안: Next.js 13.5+**

```js
// next.config.js - optimizePackageImports 사용
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@mui/material'],
  },
}
```

참고: [https://vercel.com/blog/how-we-optimized-package-imports-in-next-js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)

### 2.2 조건부 모듈 로딩

**영향도: HIGH (필요할 때만 큰 데이터 로드)**

기능이 활성화될 때만 큰 데이터나 모듈을 로드하세요.

**예: 애니메이션 프레임 지연 로드**

```tsx
function AnimationPlayer({ enabled, setEnabled }: Props) {
  const [frames, setFrames] = useState<Frame[] | null>(null)

  useEffect(() => {
    if (enabled && !frames && typeof window !== 'undefined') {
      import('./animation-frames.js')
        .then((mod) => setFrames(mod.frames))
        .catch(() => setEnabled(false))
    }
  }, [enabled, frames, setEnabled])

  if (!frames) return <Skeleton />
  return <Canvas frames={frames} />
}
```

### 2.3 비필수 서드파티 라이브러리 지연

**영향도: MEDIUM (hydration 후 로드)**

분석, 로깅, 에러 추적은 사용자 인터랙션을 차단하지 않습니다. hydration 후에 로드하세요.

**잘못된 예: 초기 번들 차단**

```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**올바른 예: hydration 후 로드**

```tsx
import dynamic from 'next/dynamic'

const Analytics = dynamic(() => import('@vercel/analytics/react').then((m) => m.Analytics), {
  ssr: false,
})

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2.4 무거운 컴포넌트에 동적 Import

**영향도: CRITICAL (TTI와 LCP에 직접 영향)**

`next/dynamic`을 사용하여 초기 렌더에 필요하지 않은 큰 컴포넌트를 지연 로드하세요.

**잘못된 예: Monaco가 메인 청크와 함께 번들 ~300KB**

```tsx
import { MonacoEditor } from './monaco-editor'

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```

**올바른 예: Monaco가 필요 시 로드**

```tsx
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('./monaco-editor').then((m) => m.MonacoEditor), {
  ssr: false,
})

function CodePanel({ code }: { code: string }) {
  return <MonacoEditor value={code} />
}
```

### 2.5 사용자 의도에 따른 Preload

**영향도: MEDIUM (체감 지연 감소)**

무거운 번들을 필요하기 전에 preload하여 체감 지연을 줄이세요.

**예: hover/focus 시 preload**

```tsx
function EditorButton({ onClick }: { onClick: () => void }) {
  const preload = () => {
    if (typeof window !== 'undefined') {
      void import('./monaco-editor')
    }
  }

  return (
    <button
      onMouseEnter={preload}
      onFocus={preload}
      onClick={onClick}
    >
      에디터 열기
    </button>
  )
}
```

---

## 3. 서버 사이드 성능

**영향도: HIGH**

서버 사이드 렌더링과 데이터 페칭을 최적화하면 서버 사이드 워터폴을 제거하고 응답 시간을 줄일 수 있습니다.

### 3.1 서버 액션을 API 라우트처럼 인증

**영향도: CRITICAL (서버 뮤테이션에 대한 무단 접근 방지)**

서버 액션(`"use server"` 함수)은 API 라우트처럼 공개 엔드포인트로 노출됩니다. 항상 각 서버 액션 **내부**에서 인증과 권한을 검증하세요.

**잘못된 예: 인증 체크 없음**

```typescript
'use server'

export async function deleteUser(userId: string) {
  // 누구나 호출 가능! 인증 체크 없음
  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

**올바른 예: 액션 내부에서 인증**

```typescript
'use server'

import { verifySession } from '@/lib/auth'
import { unauthorized } from '@/lib/errors'

export async function deleteUser(userId: string) {
  // 항상 액션 내부에서 인증 체크
  const session = await verifySession()

  if (!session) {
    throw unauthorized('로그인이 필요합니다')
  }

  // 권한도 체크
  if (session.user.role !== 'admin' && session.user.id !== userId) {
    throw unauthorized('다른 사용자를 삭제할 수 없습니다')
  }

  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

참고: [https://nextjs.org/docs/app/guides/authentication](https://nextjs.org/docs/app/guides/authentication)

### 3.2 RSC Props에서 중복 직렬화 방지

**영향도: LOW (중복 직렬화 방지로 네트워크 페이로드 감소)**

RSC→클라이언트 직렬화는 값이 아닌 객체 참조로 중복을 제거합니다. 같은 참조 = 한 번 직렬화; 새 참조 = 다시 직렬화. 변환(`.toSorted()`, `.filter()`, `.map()`)은 서버가 아닌 클라이언트에서 수행하세요.

**잘못된 예: 배열 중복**

```tsx
// RSC: 6개 문자열 전송 (2 배열 × 3 항목)
<ClientList
  usernames={usernames}
  usernamesOrdered={usernames.toSorted()}
/>
```

**올바른 예: 3개 문자열 전송**

```tsx
// RSC: 한 번 전송
;<ClientList usernames={usernames} />

// 클라이언트: 거기서 변환
;('use client')
const sorted = useMemo(() => [...usernames].sort(), [usernames])
```

### 3.3 요청 간 LRU 캐싱

**영향도: HIGH (요청 간 캐시)**

`React.cache()`는 하나의 요청 내에서만 작동합니다. 순차적 요청 간에 공유되는 데이터(사용자가 버튼 A를 클릭한 다음 버튼 B를 클릭)에는 LRU 캐시를 사용하세요.

**구현:**

```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5분
})

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached

  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}
```

참고: [https://github.com/isaacs/node-lru-cache](https://github.com/isaacs/node-lru-cache)

### 3.4 RSC 바운더리에서 직렬화 최소화

**영향도: HIGH (데이터 전송 사이즈 감소)**

React 서버/클라이언트 바운더리는 모든 객체 속성을 문자열로 직렬화합니다. 클라이언트가 실제로 사용하는 필드만 전달하세요.

**잘못된 예: 50개 필드 모두 직렬화**

```tsx
async function Page() {
  const user = await fetchUser() // 50개 필드
  return <Profile user={user} />
}

;('use client')
function Profile({ user }: { user: User }) {
  return <div>{user.name}</div> // 1개 필드만 사용
}
```

**올바른 예: 1개 필드만 직렬화**

```tsx
async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} />
}

;('use client')
function Profile({ name }: { name: string }) {
  return <div>{name}</div>
}
```

### 3.5 컴포넌트 컴포지션을 통한 병렬 데이터 페칭

**영향도: CRITICAL (서버 사이드 워터폴 제거)**

React 서버 컴포넌트는 트리 내에서 순차적으로 실행됩니다. 컴포지션으로 재구조화하여 데이터 페칭을 병렬화하세요.

**잘못된 예: Sidebar가 Page의 페칭 완료를 기다림**

```tsx
export default async function Page() {
  const header = await fetchHeader()
  return (
    <div>
      <div>{header}</div>
      <Sidebar />
    </div>
  )
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}
```

**올바른 예: 둘 다 동시에 페칭**

```tsx
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

async function Sidebar() {
  const items = await fetchSidebarItems()
  return <nav>{items.map(renderItem)}</nav>
}

export default function Page() {
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  )
}
```

### 3.6 React.cache()로 요청별 중복 제거

**영향도: MEDIUM (요청 내 중복 제거)**

`React.cache()`를 서버 사이드 요청 중복 제거에 사용하세요. 인증과 데이터베이스 쿼리가 가장 많은 이점을 얻습니다.

**사용법:**

```typescript
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return await db.user.findUnique({
    where: { id: session.user.id },
  })
})
```

단일 요청 내에서 `getCurrentUser()`의 여러 호출은 쿼리를 한 번만 실행합니다.

참고: [https://react.dev/reference/react/cache](https://react.dev/reference/react/cache)

### 3.7 블로킹하지 않는 작업에 after() 사용

**영향도: MEDIUM (더 빠른 응답 시간)**

Next.js의 `after()`를 사용하여 응답이 전송된 후 실행해야 할 작업을 예약하세요. 로깅, 분석 및 기타 부작용이 응답을 차단하는 것을 방지합니다.

**잘못된 예: 응답 차단**

```tsx
export async function POST(request: Request) {
  await updateDatabase(request)

  // 로깅이 응답을 차단
  const userAgent = request.headers.get('user-agent') || 'unknown'
  await logUserAction({ userAgent })

  return new Response(JSON.stringify({ status: 'success' }))
}
```

**올바른 예: 블로킹하지 않음**

```tsx
import { after } from 'next/server'

export async function POST(request: Request) {
  await updateDatabase(request)

  // 응답이 전송된 후 로그
  after(async () => {
    const userAgent = (await headers()).get('user-agent') || 'unknown'
    logUserAction({ userAgent })
  })

  return new Response(JSON.stringify({ status: 'success' }))
}
```

참고: [https://nextjs.org/docs/app/api-reference/functions/after](https://nextjs.org/docs/app/api-reference/functions/after)

---

## 4. 클라이언트 사이드 데이터 페칭

**영향도: MEDIUM-HIGH**

자동 중복 제거와 효율적인 데이터 페칭 패턴은 중복 네트워크 요청을 줄입니다.

### 4.1 전역 이벤트 리스너 중복 제거

**영향도: LOW (N개 컴포넌트에 1개 리스너)**

`useSWRSubscription()`을 사용하여 컴포넌트 인스턴스 간에 전역 이벤트 리스너를 공유하세요.

### 4.2 스크롤 성능을 위한 Passive 이벤트 리스너

**영향도: MEDIUM (이벤트 리스너로 인한 스크롤 지연 제거)**

touch와 wheel 이벤트 리스너에 `{ passive: true }`를 추가하여 즉각적인 스크롤을 활성화하세요.

**올바른 예:**

```typescript
useEffect(() => {
  const handleTouch = (e: TouchEvent) => console.log(e.touches[0].clientX)
  const handleWheel = (e: WheelEvent) => console.log(e.deltaY)

  document.addEventListener('touchstart', handleTouch, { passive: true })
  document.addEventListener('wheel', handleWheel, { passive: true })

  return () => {
    document.removeEventListener('touchstart', handleTouch)
    document.removeEventListener('wheel', handleWheel)
  }
}, [])
```

### 4.3 자동 중복 제거를 위한 SWR 사용

**영향도: MEDIUM-HIGH (자동 중복 제거)**

SWR은 컴포넌트 인스턴스 간에 요청 중복 제거, 캐싱 및 재검증을 활성화합니다.

**잘못된 예: 중복 제거 없음, 각 인스턴스가 페칭**

```tsx
function UserList() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then(setUsers)
  }, [])
}
```

**올바른 예: 여러 인스턴스가 하나의 요청 공유**

```tsx
import useSWR from 'swr'

function UserList() {
  const { data: users } = useSWR('/api/users', fetcher)
}
```

참고: [https://swr.vercel.app](https://swr.vercel.app)

### 4.4 localStorage 데이터 버전 관리 및 최소화

**영향도: MEDIUM (스키마 충돌 방지, 저장 사이즈 감소)**

키에 버전 접두사를 추가하고 필요한 필드만 저장하세요.

**올바른 예:**

```typescript
const VERSION = 'v2'

function saveConfig(config: { theme: string; language: string }) {
  try {
    localStorage.setItem(`userConfig:${VERSION}`, JSON.stringify(config))
  } catch {
    // incognito/private 브라우징, 할당량 초과 또는 비활성화 시 throw
  }
}
```

---

## 5. 리렌더링 최적화

**영향도: MEDIUM**

불필요한 리렌더링을 줄이면 낭비되는 계산을 최소화하고 UI 반응성을 개선합니다.

### 5.1 렌더링 중 파생 상태 계산

**영향도: MEDIUM (중복 렌더와 상태 드리프트 방지)**

값이 현재 props/state에서 계산될 수 있으면 상태에 저장하거나 effect에서 업데이트하지 마세요. 렌더 중에 파생하여 추가 렌더와 상태 드리프트를 피하세요.

**잘못된 예: 중복 상태와 effect**

```tsx
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    setFullName(firstName + ' ' + lastName)
  }, [firstName, lastName])

  return <p>{fullName}</p>
}
```

**올바른 예: 렌더 중 파생**

```tsx
function Form() {
  const [firstName, setFirstName] = useState('First')
  const [lastName, setLastName] = useState('Last')
  const fullName = firstName + ' ' + lastName

  return <p>{fullName}</p>
}
```

참고: [https://react.dev/learn/you-might-not-need-an-effect](https://react.dev/learn/you-might-not-need-an-effect)

### 5.2 사용 시점까지 상태 읽기 지연

**영향도: MEDIUM (불필요한 구독 방지)**

콜백 내부에서만 읽는다면 동적 상태(searchParams, localStorage)를 구독하지 마세요.

**잘못된 예: 모든 searchParams 변경 구독**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
  const searchParams = useSearchParams()

  const handleShare = () => {
    const ref = searchParams.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>공유</button>
}
```

**올바른 예: 필요 시 읽기, 구독 없음**

```tsx
function ShareButton({ chatId }: { chatId: string }) {
  const handleShare = () => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    shareChat(chatId, { ref })
  }

  return <button onClick={handleShare}>공유</button>
}
```

### 5.3 원시 결과의 단순 표현식을 useMemo로 감싸지 않기

**영향도: LOW-MEDIUM (매 렌더마다 낭비되는 계산)**

표현식이 단순하고(몇 개의 논리 또는 산술 연산자) 원시 결과 타입(boolean, number, string)을 가지면 `useMemo`로 감싸지 마세요.

**올바른 예:**

```tsx
function Header({ user, notifications }: Props) {
  const isLoading = user.isLoading || notifications.isLoading

  if (isLoading) return <Skeleton />
  // ...
}
```

### 5.4 메모이제이션된 컴포넌트의 기본 비원시 파라미터를 상수로 추출

**영향도: MEDIUM (기본값에 상수를 사용하여 메모이제이션 복원)**

**잘못된 예: `onClick`이 매 렌더마다 다른 값**

```tsx
const UserAvatar = memo(function UserAvatar({ onClick = () => {} }: Props) {
  // ...
})
```

**올바른 예: 안정적인 기본값**

```tsx
const NOOP = () => {}

const UserAvatar = memo(function UserAvatar({ onClick = NOOP }: Props) {
  // ...
})
```

### 5.5 메모이제이션된 컴포넌트로 추출

**영향도: MEDIUM (조기 반환 활성화)**

비용이 많이 드는 작업을 메모이제이션된 컴포넌트로 추출하여 계산 전에 조기 반환을 활성화하세요.

### 5.6 Effect 의존성 좁히기

**영향도: LOW (effect 재실행 최소화)**

객체 대신 원시 의존성을 지정하여 effect 재실행을 최소화하세요.

**잘못된 예: 모든 user 필드 변경 시 재실행**

```tsx
useEffect(() => {
  console.log(user.id)
}, [user])
```

**올바른 예: id 변경 시에만 재실행**

```tsx
useEffect(() => {
  console.log(user.id)
}, [user.id])
```

### 5.7 이벤트 핸들러에 인터랙션 로직 넣기

**영향도: MEDIUM (effect 재실행과 중복 부작용 방지)**

부작용이 특정 사용자 액션(제출, 클릭, 드래그)에 의해 트리거되면 해당 이벤트 핸들러에서 실행하세요.

**올바른 예: 핸들러에서 수행**

```tsx
function Form() {
  const theme = useContext(ThemeContext)

  function handleSubmit() {
    post('/api/register')
    showToast('등록됨', theme)
  }

  return <button onClick={handleSubmit}>제출</button>
}
```

### 5.8 파생 상태 구독

**영향도: MEDIUM (리렌더 빈도 감소)**

연속적인 값 대신 파생된 boolean 상태를 구독하여 리렌더 빈도를 줄이세요.

**올바른 예: boolean 변경 시에만 리렌더**

```tsx
function Sidebar() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  return <nav className={isMobile ? 'mobile' : 'desktop'} />
}
```

### 5.9 함수형 setState 업데이트 사용

**영향도: MEDIUM (stale 클로저 방지와 불필요한 콜백 재생성 방지)**

현재 상태 값을 기반으로 상태를 업데이트할 때 상태 변수를 직접 참조하는 대신 setState의 함수형 업데이트 형식을 사용하세요.

**올바른 예: 안정적인 콜백, stale 클로저 없음**

```tsx
function TodoList() {
  const [items, setItems] = useState(initialItems)

  const addItems = useCallback((newItems: Item[]) => {
    setItems((curr) => [...curr, ...newItems])
  }, []) // 의존성 필요 없음

  return (
    <ItemsEditor
      items={items}
      onAdd={addItems}
    />
  )
}
```

### 5.10 지연 상태 초기화 사용

**영향도: MEDIUM (매 렌더마다 낭비되는 계산)**

비용이 많이 드는 초기 값에는 `useState`에 함수를 전달하세요.

**올바른 예: 한 번만 실행**

```tsx
function FilteredList({ items }: { items: Item[] }) {
  const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(items))
  const [query, setQuery] = useState('')

  return (
    <SearchResults
      index={searchIndex}
      query={query}
    />
  )
}
```

### 5.11 긴급하지 않은 업데이트에 Transitions 사용

**영향도: MEDIUM (UI 반응성 유지)**

빈번한 비긴급 상태 업데이트를 transitions로 표시하여 UI 반응성을 유지하세요.

**올바른 예: 블로킹하지 않는 업데이트**

```tsx
import { startTransition } from 'react'

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => {
      startTransition(() => setScrollY(window.scrollY))
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
```

### 5.12 일시적 값에 useRef 사용

**영향도: MEDIUM (빈번한 업데이트에서 불필요한 리렌더 방지)**

값이 자주 변경되고 매 업데이트마다 리렌더를 원하지 않을 때(예: 마우스 트래커, 인터벌, 일시적 플래그) `useState` 대신 `useRef`에 저장하세요.

---

## 6. 렌더링 성능

**영향도: MEDIUM**

렌더링 프로세스를 최적화하면 브라우저가 해야 할 작업이 줄어듭니다.

### 6.1 SVG 요소 대신 Wrapper 애니메이션

**영향도: LOW (하드웨어 가속 활성화)**

많은 브라우저가 SVG 요소에 대한 CSS3 애니메이션의 하드웨어 가속을 지원하지 않습니다. SVG를 `<div>`로 감싸고 wrapper를 애니메이션하세요.

**올바른 예: wrapper div 애니메이션 - 하드웨어 가속**

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

### 6.2 긴 목록에 CSS content-visibility

**영향도: HIGH (더 빠른 초기 렌더)**

`content-visibility: auto`를 적용하여 화면 밖 렌더링을 지연하세요.

**CSS:**

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

1000개 메시지의 경우, 브라우저가 화면 밖 ~990개 항목의 레이아웃/페인트를 건너뜁니다(10배 빠른 초기 렌더).

### 6.3 정적 JSX 요소 호이스팅

**영향도: LOW (재생성 방지)**

정적 JSX를 컴포넌트 외부로 추출하여 재생성을 피하세요.

**올바른 예: 같은 요소 재사용**

```tsx
const loadingSkeleton = <div className="h-20 animate-pulse bg-gray-200" />

function Container() {
  return <div>{loading && loadingSkeleton}</div>
}
```

### 6.4 SVG 정밀도 최적화

**영향도: LOW (파일 사이즈 감소)**

SVG 좌표 정밀도를 줄여 파일 사이즈를 감소시키세요.

**올바른 예: 1자리 소수점**

```svg
<path d="M 10.3 20.8 L 30.9 40.2" />
```

### 6.5 깜빡임 없이 Hydration Mismatch 방지

**영향도: MEDIUM (시각적 깜빡임과 hydration 에러 방지)**

클라이언트 사이드 스토리지(localStorage, 쿠키)에 의존하는 콘텐츠를 렌더링할 때, React가 hydrate하기 전에 DOM을 업데이트하는 동기 스크립트를 주입하여 SSR 중단과 hydration 후 깜빡임을 모두 방지하세요.

### 6.6 예상된 Hydration Mismatch 억제

**영향도: LOW-MEDIUM (알려진 차이에 대한 시끄러운 hydration 경고 방지)**

일부 값은 서버와 클라이언트에서 의도적으로 다릅니다(랜덤 ID, 날짜, 로케일/타임존 포맷팅). 이러한 _예상된_ mismatch에는 `suppressHydrationWarning`이 있는 요소로 동적 텍스트를 감싸세요.

### 6.7 보이기/숨기기에 Activity 컴포넌트 사용

**영향도: MEDIUM (상태/DOM 보존)**

React의 `<Activity>`를 사용하여 자주 토글되는 비용이 많이 드는 컴포넌트의 상태/DOM을 보존하세요.

```tsx
import { Activity } from 'react'

function Dropdown({ isOpen }: Props) {
  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <ExpensiveMenu />
    </Activity>
  )
}
```

### 6.8 명시적 조건부 렌더링 사용

**영향도: LOW (0이나 NaN 렌더링 방지)**

조건이 `0`, `NaN` 또는 렌더링되는 다른 falsy 값이 될 수 있을 때 `&&` 대신 명시적 삼항 연산자(`? :`)를 사용하세요.

**올바른 예: count가 0일 때 아무것도 렌더링하지 않음**

```tsx
function Badge({ count }: { count: number }) {
  return <div>{count > 0 ? <span className="badge">{count}</span> : null}</div>
}
```

### 6.9 수동 로딩 상태 대신 useTransition 사용

**영향도: LOW (리렌더 감소와 코드 명확성 향상)**

로딩 상태에 수동 `useState` 대신 `useTransition`을 사용하세요. 내장 `isPending` 상태를 제공하고 자동으로 transitions를 관리합니다.

참고: [https://react.dev/reference/react/useTransition](https://react.dev/reference/react/useTransition)

---

## 7. JavaScript 성능

**영향도: LOW-MEDIUM**

핫 패스에 대한 마이크로 최적화가 의미 있는 개선으로 축적될 수 있습니다.

### 7.1 레이아웃 스래싱 방지

**영향도: MEDIUM (강제 동기 레이아웃 방지와 성능 병목 감소)**

스타일 쓰기와 레이아웃 읽기를 인터리빙하지 마세요. 스타일 변경 사이에 레이아웃 속성(`offsetWidth`, `getBoundingClientRect()`, `getComputedStyle()`)을 읽으면 브라우저가 동기 reflow를 트리거해야 합니다.

**올바른 예: 쓰기를 배치한 다음 한 번 읽기**

```typescript
function updateElementStyles(element: HTMLElement) {
  element.style.width = '100px'
  element.style.height = '200px'
  element.style.backgroundColor = 'blue'

  // 모든 쓰기가 끝난 후 읽기 (단일 reflow)
  const { width, height } = element.getBoundingClientRect()
}
```

### 7.2 반복 조회를 위한 인덱스 Map 구축

**영향도: LOW-MEDIUM (1M ops에서 2K ops로)**

동일한 키로 여러 `.find()` 호출을 하면 Map을 사용해야 합니다.

**올바른 예 (조회당 O(1)):**

```typescript
function processOrders(orders: Order[], users: User[]) {
  const userById = new Map(users.map((u) => [u.id, u]))

  return orders.map((order) => ({
    ...order,
    user: userById.get(order.userId),
  }))
}
```

### 7.3 루프에서 속성 접근 캐시

**영향도: LOW-MEDIUM (조회 감소)**

핫 패스에서 객체 속성 조회를 캐시하세요.

**올바른 예: 총 1번 조회**

```typescript
const value = obj.config.settings.value
const len = arr.length
for (let i = 0; i < len; i++) {
  process(value)
}
```

### 7.4 반복 함수 호출 캐시

**영향도: MEDIUM (중복 계산 방지)**

렌더 중에 동일한 입력으로 같은 함수가 반복 호출될 때 모듈 레벨 Map을 사용하여 함수 결과를 캐시하세요.

### 7.5 Storage API 호출 캐시

**영향도: LOW-MEDIUM (비용이 많이 드는 I/O 감소)**

`localStorage`, `sessionStorage`, `document.cookie`는 동기적이고 비용이 많이 듭니다. 메모리에 읽기를 캐시하세요.

### 7.6 여러 배열 반복 결합

**영향도: LOW-MEDIUM (반복 감소)**

여러 `.filter()` 또는 `.map()` 호출은 배열을 여러 번 반복합니다. 하나의 루프로 결합하세요.

**올바른 예: 1번 반복**

```typescript
const admins: User[] = []
const testers: User[] = []
const inactive: User[] = []

for (const user of users) {
  if (user.isAdmin) admins.push(user)
  if (user.isTester) testers.push(user)
  if (!user.isActive) inactive.push(user)
}
```

### 7.7 배열 비교 전 길이 체크

**영향도: MEDIUM-HIGH (길이가 다를 때 비용이 많이 드는 작업 방지)**

비용이 많이 드는 작업(정렬, 깊은 동등성, 직렬화)으로 배열을 비교할 때 먼저 길이를 확인하세요. 길이가 다르면 배열은 같을 수 없습니다.

### 7.8 함수에서 조기 반환

**영향도: LOW-MEDIUM (불필요한 계산 방지)**

결과가 결정되면 불필요한 처리를 건너뛰기 위해 일찍 반환하세요.

### 7.9 RegExp 생성 호이스팅

**영향도: LOW-MEDIUM (재생성 방지)**

렌더 내부에서 RegExp를 생성하지 마세요. 모듈 스코프로 호이스팅하거나 `useMemo()`로 메모이제이션하세요.

### 7.10 Sort 대신 루프로 Min/Max 구하기

**영향도: LOW (O(n log n) 대신 O(n))**

가장 작거나 가장 큰 요소를 찾는 것은 배열을 한 번만 통과하면 됩니다. 정렬은 낭비적이고 더 느립니다.

**올바른 예 (O(n) - 단일 루프):**

```typescript
function getLatestProject(projects: Project[]) {
  if (projects.length === 0) return null

  let latest = projects[0]

  for (let i = 1; i < projects.length; i++) {
    if (projects[i].updatedAt > latest.updatedAt) {
      latest = projects[i]
    }
  }

  return latest
}
```

### 7.11 O(1) 조회를 위해 Set/Map 사용

**영향도: LOW-MEDIUM (O(n)에서 O(1)로)**

반복 멤버십 체크를 위해 배열을 Set/Map으로 변환하세요.

**올바른 예 (체크당 O(1)):**

```typescript
const allowedIds = new Set(['a', 'b', 'c', ...])
items.filter(item => allowedIds.has(item.id))
```

### 7.12 불변성을 위해 sort() 대신 toSorted() 사용

**영향도: MEDIUM-HIGH (React 상태에서 뮤테이션 버그 방지)**

`.sort()`는 배열을 제자리에서 뮤테이션하여 React 상태와 props에서 버그를 일으킬 수 있습니다. `.toSorted()`를 사용하여 뮤테이션 없이 새로 정렬된 배열을 생성하세요.

**올바른 예: 새 배열 생성**

```typescript
function UserList({ users }: { users: User[] }) {
  const sorted = useMemo(
    () => users.toSorted((a, b) => a.name.localeCompare(b.name)),
    [users]
  )
  return <div>{sorted.map(renderUser)}</div>
}
```

---

## 8. 고급 패턴

**영향도: LOW**

신중한 구현이 필요한 특정 케이스를 위한 고급 패턴입니다.

### 8.1 마운트가 아닌 앱당 한 번 초기화

**영향도: LOW-MEDIUM (개발 중 중복 init 방지)**

앱 로드당 한 번 실행해야 하는 앱 전체 초기화를 컴포넌트의 `useEffect([])` 안에 넣지 마세요. 컴포넌트는 리마운트될 수 있고 effects는 다시 실행됩니다. 대신 모듈 레벨 가드나 엔트리 모듈의 최상위 init을 사용하세요.

**올바른 예: 앱 로드당 한 번**

```tsx
let didInit = false

function Comp() {
  useEffect(() => {
    if (didInit) return
    didInit = true
    loadFromStorage()
    checkAuthToken()
  }, [])

  // ...
}
```

참고: [https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application](https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application)

### 8.2 이벤트 핸들러를 Refs에 저장

**영향도: LOW (안정적인 구독)**

콜백 변경 시 재구독하지 않아야 하는 effects에서 사용할 때 콜백을 refs에 저장하세요.

### 8.3 안정적인 콜백 Refs를 위한 useEffectEvent

**영향도: LOW (effect 재실행 방지)**

의존성 배열에 추가하지 않고 콜백에서 최신 값에 접근하세요. stale 클로저를 피하면서 effect 재실행을 방지합니다.

**올바른 예: React의 useEffectEvent 사용**

```tsx
import { useEffectEvent } from 'react'

function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  const onSearchEvent = useEffectEvent(onSearch)

  useEffect(() => {
    const timeout = setTimeout(() => onSearchEvent(query), 300)
    return () => clearTimeout(timeout)
  }, [query])
}
```

---

## 참고 자료

1. [https://react.dev](https://react.dev)
2. [https://nextjs.org](https://nextjs.org)
3. [https://swr.vercel.app](https://swr.vercel.app)
4. [https://github.com/shuding/better-all](https://github.com/shuding/better-all)
5. [https://github.com/isaacs/node-lru-cache](https://github.com/isaacs/node-lru-cache)
6. [https://vercel.com/blog/how-we-optimized-package-imports-in-next-js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
7. [https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)
