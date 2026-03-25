import type { EditorView } from '@codemirror/view'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useCreateQueryMutation } from '@/api/queries/create-query'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { useQueryStore } from '@/stores/query-store'

import { EditorToolbar } from './_components/editor-toolbar'
import { QuerySidebar } from './_components/query-sidebar'
import {
  ResultEmpty,
  ResultError,
  ResultInitial,
  ResultLoading,
} from './_components/result-empty-states'
import { ResultTable } from './_components/result-table'
import { SqlEditor } from './_components/sql-editor'
import { useQueryExecution } from './_hooks/use-query-execution'
import { useSchemaMetadata } from './_hooks/use-schema-metadata'

function QueryEditorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { sqlValue, setSqlValue, limitRows } = useQueryStore()
  const editorRef = useRef<EditorView | null>(null)
  const { result, error, isRunning, execute } = useQueryExecution()
  const schemaMap = useSchemaMetadata()
  const { mutate: saveQuery, isPending: isSaving } = useCreateQueryMutation()

  const handleSave = (name: string, memo?: string, onSuccess?: () => void) => {
    saveQuery(
      { name, sql: sqlValue, memo },
      {
        onSuccess: (saved) => {
          toast(`"${saved.name}" 쿼리가 저장되었습니다.`)
          onSuccess?.()
        },
      }
    )
  }

  const handleRun = useCallback(() => {
    const view = editorRef.current
    if (!view) return

    // 선택 영역이 있으면 선택된 텍스트만 실행
    const { from, to } = view.state.selection.main
    const selectedText = from !== to ? view.state.sliceDoc(from, to) : null
    const queryToRun = selectedText?.trim() ? selectedText : sqlValue

    void execute(queryToRun, limitRows)
  }, [sqlValue, limitRows, execute])

  return (
    <div className="-m-4 flex flex-1 overflow-hidden">
      {/* Query history sidebar */}
      {sidebarOpen && (
        <div className="w-64 shrink-0">
          <QuerySidebar />
        </div>
      )}

      {/* Main editor area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <EditorToolbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onRun={handleRun}
          isRunning={isRunning}
          onSave={handleSave}
          isSaving={isSaving}
        />

        {/* Editor + Results: vertical resizable split */}
        <ResizablePanelGroup
          orientation="vertical"
          className="flex-1"
        >
          {/* SQL Editor Area */}
          <ResizablePanel
            defaultSize={55}
            minSize={20}
          >
            <SqlEditor
              value={sqlValue}
              onChange={setSqlValue}
              onRun={handleRun}
              onEditorMount={(view) => {
                editorRef.current = view
              }}
              schema={schemaMap}
            />
          </ResizablePanel>

          <ResizableHandle />

          {/* Results Area */}
          <ResizablePanel
            defaultSize={45}
            minSize={15}
          >
            <div className="flex h-full flex-col">
              {/* Results toolbar */}
              <div className="flex h-10 shrink-0 items-center gap-4 border-t bg-neutral-50 px-3">
                <button
                  type="button"
                  className="text-foreground text-xs font-medium"
                >
                  Results
                </button>
                <button
                  type="button"
                  className="text-muted-foreground text-xs font-medium"
                >
                  Messages
                </button>
              </div>

              {/* Results content */}
              {isRunning ? (
                <ResultLoading />
              ) : error ? (
                <ResultError
                  message={error}
                  onRetry={handleRun}
                />
              ) : result && result.rowCount > 0 ? (
                <div className="flex-1 overflow-auto border-t">
                  <ResultTable result={result} />
                </div>
              ) : result ? (
                <ResultEmpty executionTimeMs={result.executionTimeMs} />
              ) : (
                <ResultInitial />
              )}

              {/* Status bar */}
              <div className="text-muted-foreground flex h-7 shrink-0 items-center justify-between border-t bg-neutral-50 px-3 text-[11px]">
                <span>
                  {isRunning
                    ? '실행 중...'
                    : result
                      ? `${result.rowCount} rows · ${result.executionTimeMs}ms`
                      : error
                        ? 'Error'
                        : 'Ready'}
                </span>
                <span>Limit: {limitRows === 0 ? 'No limit' : `${limitRows} rows`}</span>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

export default QueryEditorPage
