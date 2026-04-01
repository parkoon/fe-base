import type { editor } from 'monaco-editor'

const THEME_NAME = 'sql-editor-light'

const themeData: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
    { token: 'string', foreground: '16a34a' },
    { token: 'number', foreground: '2563eb' },
    { token: 'comment', foreground: '9ca3af', fontStyle: 'italic' },
    { token: 'operator', foreground: 'c2410c' },
    { token: 'type', foreground: '0891b2' },
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#1f2937',
    'editor.lineHighlightBackground': '#f9fafb',
    'editorLineNumber.foreground': '#d1d5db',
    'editorLineNumber.activeForeground': '#6b7280',
    'editor.selectionBackground': '#dbeafe',
    'editorCursor.foreground': '#1f2937',
  },
}

export function registerSQLEditorTheme(monaco: {
  editor: { defineTheme: (name: string, data: editor.IStandaloneThemeData) => void }
}) {
  monaco.editor.defineTheme(THEME_NAME, themeData)
}

export { THEME_NAME }
