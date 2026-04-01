import MonacoEditor from '@monaco-editor/react'
import type { editor, IDisposable, IPosition, IRange } from 'monaco-editor'
import { useCallback, useEffect, useRef } from 'react'

import {
  buildColumnCompletionItems,
  buildCompletionItems,
  extractTableNameBeforeDot,
} from './sql-language'
import { registerSQLEditorTheme, THEME_NAME } from './theme'
import type { SQLEditorProps } from './types'

export function SQLEditor({
  value,
  onChange,
  schema = {},
  onRun,
  onRunSelection,
  readOnly = false,
  height = '100%',
  onMount: onMountProp,
}: SQLEditorProps) {
  const onRunRef = useRef(onRun)
  const onRunSelectionRef = useRef(onRunSelection)
  const schemaRef = useRef(schema)

  useEffect(() => {
    onRunRef.current = onRun
  }, [onRun])

  useEffect(() => {
    onRunSelectionRef.current = onRunSelection
  }, [onRunSelection])

  useEffect(() => {
    schemaRef.current = schema
  }, [schema])

  const handleMount = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (editorInstance: editor.IStandaloneCodeEditor, monaco: any) => {
      registerSQLEditorTheme(monaco as Parameters<typeof registerSQLEditorTheme>[0])
      ;(monaco as { editor: { setTheme: (name: string) => void } }).editor.setTheme(THEME_NAME)

      // Cmd/Ctrl+Enter → run query
      editorInstance.addAction({
        id: 'sql-run-query',
        label: 'Run Query',
        keybindings: [
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        ],
        run: () => {
          onRunRef.current?.()
        },
      })

      // Cmd/Ctrl+Shift+Enter → run selection
      editorInstance.addAction({
        id: 'sql-run-selection',
        label: 'Run Selection',
        keybindings: [
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
        ],
        run: (ed) => {
          const selection = ed.getSelection()
          const selectedText = selection ? (ed.getModel()?.getValueInRange(selection) ?? '') : ''
          const textToRun = selectedText.trim() || ed.getValue()
          onRunSelectionRef.current?.(textToRun)
        },
      })

      // Schema-aware autocomplete
      let completionDisposable: IDisposable | null = null

      const registerCompletion = () => {
        completionDisposable?.dispose()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        completionDisposable = monaco.languages.registerCompletionItemProvider('sql', {
          triggerCharacters: ['.', ' '],
          provideCompletionItems: (model: editor.ITextModel, position: IPosition) => {
            const range: IRange = {
              startLineNumber: position.lineNumber,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            }
            const textUntilPosition = model.getValueInRange(range)

            const tableName = extractTableNameBeforeDot(textUntilPosition)

            if (tableName && schemaRef.current[tableName]) {
              return {
                suggestions: buildColumnCompletionItems(tableName, schemaRef.current),
              }
            }

            return {
              suggestions: buildCompletionItems(schemaRef.current),
            }
          },
        }) as IDisposable

        return completionDisposable
      }

      registerCompletion()

      editorInstance.onDidDispose(() => {
        completionDisposable?.dispose()
      })

      onMountProp?.(editorInstance)
    },
    [onMountProp]
  )

  return (
    <MonacoEditor
      language="sql"
      value={value}
      onChange={(v) => onChange(v ?? '')}
      onMount={handleMount}
      height={height}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        tabSize: 2,
        wordWrap: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 8 },
        readOnly,
        lineNumbersMinChars: 3,
        folding: true,
        renderLineHighlight: 'line',
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
      }}
    />
  )
}
