# 시작하기

이 문서에서는 프로젝트를 로컬에서 실행하고 개발을 시작하는 방법을 안내합니다.

---

## 사전 요구사항

- **Node.js**: v18 이상
- **pnpm**: v8 이상 (권장)
- **IDE**: VSCode 권장 (설정 파일 포함)

```bash
# Node.js 버전 확인
node -v

# pnpm 설치 (없는 경우)
npm install -g pnpm
```

---

## 설치

```bash
# 1. 저장소 클론
git clone <repository-url>
cd fe-base

# 2. 의존성 설치
pnpm install

# 3. 환경 변수 설정
cp .env.example .env
```

### 환경 변수

`.env` 파일:

```bash
VITE_API_URL=https://dummyjson.com
```

환경 변수는 `src/config/env.ts`에서 Zod로 검증됩니다:

```typescript
// src/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
})

export const env = envSchema.parse(import.meta.env)
```

---

## 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:5173`을 열어 확인하세요.

### 테스트 계정

DummyJSON API 테스트용 계정:

| 필드     | 값           |
| -------- | ------------ |
| Username | `emilys`     |
| Password | `emilyspass` |

---

## 프로젝트 스크립트

### 개발

```bash
pnpm dev          # 개발 서버 실행
pnpm build        # 프로덕션 빌드
pnpm preview      # 빌드 결과물 미리보기
```

### 코드 품질

```bash
pnpm lint         # ESLint 검사
pnpm lint:fix     # ESLint 자동 수정
pnpm format       # Prettier 포맷팅
pnpm format:check # Prettier 검사만
```

### 코드 생성

```bash
pnpm codegen      # OpenAPI → TypeScript 타입 생성
pnpm api:gen      # API 엔드포인트 코드 생성 (대화형)
```

---

## VSCode 설정

프로젝트에 포함된 VSCode 설정:

### .vscode/extensions.json

권장 확장 프로그램:

- ESLint
- Prettier
- Tailwind CSS IntelliSense

### .vscode/settings.json

저장 시 자동 포맷팅이 설정되어 있습니다:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

---

## Git Hooks

Husky + lint-staged로 커밋 전 자동 검사:

```bash
# 커밋 시 자동 실행
- TypeScript 파일: ESLint + Prettier
- 기타 파일: Prettier
```

### 수동으로 Husky 설정

```bash
pnpm prepare  # .husky 폴더 초기화
```

---

## 폴더 구조 미리보기

```
src/
├── api/          # API 호출 함수 (자동 생성 가능)
├── app/          # 앱 진입점, 라우터, 프로바이더
├── components/   # 공유 컴포넌트
├── config/       # 환경 설정
├── hooks/        # 공유 훅
├── lib/          # 라이브러리 설정
├── types/        # 타입 정의
└── utils/        # 유틸리티 함수
```

자세한 내용은 [프로젝트 구조](./project-structure.md)를 참고하세요.

---

## 다음 단계

1. **[프로젝트 구조](./project-structure.md)** - 폴더 구조 이해하기
2. **[API 레이어](./api-layer.md)** - API 호출 방법 배우기
3. **[라우팅](./routing.md)** - 페이지 추가 방법 배우기
