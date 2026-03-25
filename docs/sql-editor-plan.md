# SQL 에디터 구현 계획

> 기반 문서: `like-supabase.md`, `p0-implementation-plan.md` Phase 4

## 스펙 아웃 (MVP 제외)

| 기능                                              | 제외 이유                                     |
| ------------------------------------------------- | --------------------------------------------- |
| 연결 상태 실시간 표시                             | 백엔드 책임. 실행 실패 시 에러 메시지로 충분  |
| 탭 기반 작업환경 / 워크스페이스                   | 복잡도 대비 MVP 가치 낮음. 단일 에디터로 시작 |
| 탭 드래그 순서 변경                               | 탭 자체가 스펙 아웃                           |
| 쿼리 취소 (AbortController)                       | 백엔드 지원 필요. 타임아웃으로 대체           |
| 컨텍스트 인식 자동완성 (SELECT→컬럼, FROM→테이블) | SQL AST 파싱 필요, 오버엔지니어링             |
| alias / JOIN 기반 자동완성                        | 위와 동일                                     |
| 위험 쿼리 프론트 제한                             | 백엔드에서 처리. 프론트 검증은 우회 가능      |
| 쿼리 저장/불러오기                                | 백엔드 API 필요. 별도 phase                   |
| CSV 다운로드                                      | 있으면 좋지만 MVP 아님                        |

---

## P0: 동작하는 에디터 (Week 1)

### Step 1. CodeMirror 에디터 마운트

- [x] `pnpm add codemirror @codemirror/lang-sql`
- [x] `src/app/routes/app/query/editor.tsx` 페이지에 CodeMirror 마운트
- [x] SQL 언어 모드, 라이트 테마, 기본 옵션 설정

### Step 2. 에디터/결과 리사이즈 레이아웃

- [x] 상하 분할 레이아웃 (에디터 위, 결과 아래)
- [x] 드래그로 영역 비율 조절 가능
- [x] 결과 영역 빈 상태 UI

### Step 3. DataSource/Schema 선택기

- [x] 에디터 상단 툴바에 DataSource/Schema 선택 배치
- [x] Zustand store로 선택 상태 관리 + localStorage persist
- [x] 마지막 사용 DataSource/Schema 복원

### Step 4. 쿼리 실행

- [ ] 실행 API 연동 (`POST /api/query/execute`)
- [x] Ctrl/Cmd + Enter 단축키 바인딩
- [x] 실행 버튼 UI
- [x] LIMIT 옵션 (100/500/1000/no limit, 기본 100)

### Step 5. 결과 테이블

- [x] 동적 컬럼 생성 (API 응답 기반)
- [x] 기본 테이블 렌더링
- [x] 실행 시간 표시
- [x] 에러 상태 표시

### Step 6. 실행 상태 관리

- [x] 로딩 인디케이터
- [x] 에러 메시지 표시 (권한 부족 포함)
- [x] 결과 row 수 + 실행 시간 표시

---

## P1: 사용성 개선 (Week 2)

- [x] 선택 영역만 실행 (`view.state.selection`)
- [ ] SQL 키워드 + 테이블명 자동완성 (`@codemirror/autocomplete`)
- [x] 쿼리 내용 localStorage 자동저장 (Zustand persist)
- [ ] 가상 스크롤 (`@tanstack/react-virtual`) — 대용량 결과 대응
- [ ] 셀/행 복사 (클립보드 API)
- [ ] 결과 없음 / 빈 상태 UX 개선

---

## P2: 고도화 (Week 3+)

- [ ] 컬럼 자동완성 (메타데이터 기반)
- [ ] 쿼리 히스토리 (최근 실행 목록)
- [ ] 쿼리 저장/불러오기 (백엔드 API 필요)
- [ ] CSV 다운로드
- [ ] 탭 기반 멀티 쿼리

---

## 기술 스택

| 영역        | 선택                                  | 비고                               |
| ----------- | ------------------------------------- | ---------------------------------- |
| 에디터      | `codemirror` + `@codemirror/lang-sql` | 경량 모듈러 에디터, SQL 지원       |
| 결과 그리드 | `@tanstack/react-table`               | 동적 컬럼, 헤드리스                |
| 가상 스크롤 | `@tanstack/react-virtual`             | P1에서 추가                        |
| 상태 관리   | Zustand store                         | DS/Schema 선택 + 쿼리 내용 persist |
| 리사이즈    | `react-resizable-panels`              | 에디터/결과 분할                   |

## 파일 구조 (예상)

```
src/app/routes/app/query/
  editor.tsx                     ← 페이지
  _components/
    editor-toolbar.tsx           ← DS/Schema 선택 + 실행 버튼 + LIMIT
    sql-editor.tsx               ← CodeMirror 래퍼
    result-table.tsx             ← 결과 테이블
    result-empty.tsx             ← 빈 상태
    result-error.tsx             ← 에러 상태
  _hooks/
    use-query-execution.ts       ← 쿼리 실행 로직
src/stores/
  query-store.ts                 ← Zustand (DS/Schema + 쿼리 내용)
```
