import type { editor } from 'monaco-editor'

export type SQLEditorSchema = Record<string, string[]>

export type SQLEditorProps = {
  /** 현재 SQL 값 (controlled) */
  value: string
  /** SQL 변경 콜백 */
  onChange: (value: string) => void
  /** DB 스키마 — autocomplete에 사용 */
  schema?: SQLEditorSchema
  /** Cmd/Ctrl+Enter 실행 콜백 */
  onRun?: () => void
  /** 선택 영역만 실행 (Cmd+Shift+Enter) */
  onRunSelection?: (selectedSQL: string) => void
  /** 읽기 전용 모드 */
  readOnly?: boolean
  /** 에디터 높이 (기본: '100%') */
  height?: string | number
  /** 에디터 마운트 완료 콜백 */
  onMount?: (editor: editor.IStandaloneCodeEditor) => void
}
