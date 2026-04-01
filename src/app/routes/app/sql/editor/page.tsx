import { AsyncBoundary } from '@/components/errors'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { SQLEditor, useSQLEditor } from '@/lib/sql-editor'
import { useQueryTableStore } from '@/stores/query-table-store'

import { EditorToolbar } from './_components/editor-toolbar'
import { QuerySidebar } from './_components/query-sidebar'
import { ResultContent } from './_components/result-content'
import { useQueryExecution } from './_hooks/use-query-execution'

function QueryEditorPage() {
  const { limitRows } = useQueryTableStore()

  const editor = useSQLEditor()
  const { result, error, isRunning, execute } = useQueryExecution()

  const handleRun = () => {
    void execute(editor.value, limitRows)
  }

  return (
    <div className="-m-4 flex flex-1 overflow-hidden">
      <div className="w-52 shrink-0">
        <AsyncBoundary loadingFallback={<div className="h-full border-r" />}>
          <QuerySidebar onLoadQuery={(sql) => editor.setValue(sql)} />
        </AsyncBoundary>
      </div>

      {/* Main editor area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <AsyncBoundary loadingFallback={<div className="h-11 shrink-0 border-b" />}>
          <EditorToolbar
            sql={editor.value}
            onRun={handleRun}
            isRunning={isRunning}
          />
        </AsyncBoundary>

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
            <SQLEditor
              {...editor.editorProps}
              onRun={handleRun}
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
              <ResultContent
                isRunning={isRunning}
                error={error}
                result={result}
                onRetry={handleRun}
              />

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
