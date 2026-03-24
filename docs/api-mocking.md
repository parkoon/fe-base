# API Mocking (MSW)

> 백엔드 API가 준비되기 전까지 [MSW (Mock Service Worker)](https://mswjs.io/) 2.x를 사용하여 프론트엔드 독립 개발을 진행한다.

## 개요

MSW는 브라우저의 Service Worker를 통해 네트워크 레벨에서 HTTP 요청을 가로채고 mock 응답을 반환한다. 앱 코드 수정 없이 실제 API와 동일한 방식으로 동작하므로, mock → 실서버 전환 시 코드 변경이 불필요하다.

## ON/OFF 제어

`.env` 파일의 환경변수 한 줄로 제어한다:

```bash
# 모킹 ON
VITE_APP_ENABLE_API_MOCKING=true

# 모킹 OFF (실제 API 연동 시 — 주석 처리 또는 삭제)
# VITE_APP_ENABLE_API_MOCKING=true
```

- 환경변수 변경 후 `pnpm dev` 재시작 필요 (Vite 환경변수는 빌드 타임 주입)
- 프로덕션 빌드(`pnpm build`)에는 mock 코드가 번들에 포함되지 않음 (dynamic import)

## 동작 원리

```
main.tsx → initMocks() → ENABLE_API_MOCKING 체크
                            ├─ true  → import('./browser') → worker.start()
                            └─ false → 즉시 return (MSW 코드 로드 안 함)
                         → createRoot().render()
```

1. `src/mocks/index.ts`의 `initMocks()`가 환경변수를 확인
2. `true`일 때만 `src/mocks/browser.ts`를 dynamic import하여 Service Worker 시작
3. `false`이면 아무것도 로드하지 않고 즉시 앱 렌더링

## 파일 구조

```
src/mocks/
├── browser.ts              # setupWorker (MSW 브라우저 워커)
├── index.ts                # initMocks() — 조건부 초기화 진입점
├── data/                   # Mock 데이터 (fixtures)
│   ├── auth.ts             # 인증 mock 사용자
│   ├── datasources.ts      # DataSource 목록
│   ├── schemas.ts          # DataSource별 Schema 목록
│   ├── tables.ts           # Schema별 테이블/컬럼 목록
│   └── permissions.ts      # 권한 신청 목록 및 상세
└── handlers/               # MSW 요청 핸들러
    ├── index.ts            # 전체 핸들러 배열 export
    ├── auth.ts             # POST /auth/login, GET /auth/me, POST /auth/refresh
    ├── datasources.ts      # GET /api/datasources, .../schemas, .../tables, .../columns
    └── permissions.ts      # GET/POST /api/permissions/requests, GET .../requests/:id

public/
└── mockServiceWorker.js    # MSW Service Worker 파일 (npx msw init으로 생성)
```

## 핸들러 작성 규칙

### URL 패턴

API 클라이언트가 절대 URL(`http://localhost:8080/api/...`)로 요청하므로, 핸들러는 **와일드카드 프리픽스 `*/`**를 사용한다:

```typescript
// ✅ 올바른 패턴 — 모든 오리진 매칭
http.get('*/api/datasources', handler)

// ❌ 잘못된 패턴 — localhost:5173 오리진만 매칭
http.get('/api/datasources', handler)
```

### 핸들러 패턴

```typescript
import { delay, http, HttpResponse } from 'msw'

http.get('*/api/datasources', async () => {
  await delay(300) // 네트워크 지연 시뮬레이션
  return HttpResponse.json(mockDatasources) // JSON 응답
})

http.post('*/api/permissions/requests', async ({ request }) => {
  const body = await request.json() // 요청 body 파싱
  await delay(500)
  return HttpResponse.json(newRequest, { status: 201 })
})
```

### 새 핸들러 추가 절차

1. `src/mocks/data/`에 mock 데이터 파일 생성
2. `src/mocks/handlers/`에 핸들러 파일 생성 (기존 파일에 추가 가능)
3. `src/mocks/handlers/index.ts`에 핸들러 배열 등록
4. 브라우저 새로고침으로 확인

## 부분 모킹 (Partial Mocking)

`onUnhandledRequest: 'bypass'` 설정으로, **핸들러가 없는 API는 실제 서버로 통과**한다.

일부 API만 실서버 연동으로 전환할 때:

1. 해당 핸들러 파일에서 핸들러 제거 (또는 주석 처리)
2. 나머지 핸들러는 계속 mock 응답 반환

예시: auth API만 실서버 연동, 나머지는 mock 유지

```typescript
// src/mocks/handlers/index.ts
// import { authHandlers } from './auth'     ← 제거
import { datasourceHandlers } from './datasources'
import { permissionHandlers } from './permissions'

export const handlers = [
  // ...authHandlers,                        ← 제거 → 실서버로 통과
  ...datasourceHandlers,
  ...permissionHandlers,
]
```

## 실서버 전환 체크리스트

백엔드 API 준비 완료 시:

1. `.env`에서 `VITE_APP_ENABLE_API_MOCKING=true` 주석 처리
2. `VITE_APP_QUERYPIE_API_URL`을 실서버 URL로 설정
3. `pnpm dev` 재시작
4. 브라우저 콘솔에 `[MSW] Mocking enabled` 메시지가 **없는지** 확인
5. Network 탭에서 실서버 응답 확인

> `src/mocks/` 디렉토리와 `public/mockServiceWorker.js`는 삭제하지 않아도 된다. `ENABLE_API_MOCKING=false`이면 코드가 로드되지 않으므로 프로덕션에 영향 없음.
