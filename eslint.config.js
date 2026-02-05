import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// defineConfig: ESLint v9.22.0부터 제공 (tseslint.config 대체)
export default defineConfig(
  // 린트 제외 경로
  // - dist: 빌드 결과물
  // - ref, .ref: 참고용 코드 (bulletproof-react 등)
  // - src/types: openapi-typescript로 자동 생성된 타입 (수정 불가)
  { ignores: ['dist', 'ref', '.ref', 'src/types'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      // 타입 정보를 활용한 린트 규칙 (tsconfig 연동 필요)
      ...tseslint.configs.recommendedTypeChecked,
      // 코드 스타일 관련 규칙 (일관된 타입 정의 등)
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        // 타입 체크를 위해 tsconfig 연결
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // ==========================================
      // React
      // ==========================================
      // useEffect 의존성 배열 검사, hooks 규칙 검사
      ...reactHooks.configs.recommended.rules,
      // HMR(Hot Module Replacement)을 위해 컴포넌트만 export 권장
      // allowConstantExport: 상수 export는 허용 (예: export const loader)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // ==========================================
      // Import 정렬
      // ==========================================
      // import 문 자동 정렬 (그룹별: 외부 패키지 → 내부 모듈 → 상대 경로)
      'simple-import-sort/imports': 'error',
      // export 문 자동 정렬
      'simple-import-sort/exports': 'error',

      // ==========================================
      // TypeScript
      // ==========================================
      // 사용하지 않는 변수 에러, 단 _로 시작하는 인자는 무시
      // 예: function handler(_event) {} → OK
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // import type { Foo } 형태로 타입 import 강제
      // 번들 크기 최적화 (타입은 런타임에 제거됨)
      '@typescript-eslint/consistent-type-imports': 'error',
      // interface 대신 type 사용 강제
      // 이유: type이 더 유연함 (union, intersection, mapped types 등)
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },
  // Prettier와 충돌하는 ESLint 규칙 비활성화
  // 포매팅은 Prettier가, 코드 품질은 ESLint가 담당
  eslintConfigPrettier
)
