import type { EditorView } from '@codemirror/view'
import { useQueries, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { getDatasourceColumnsQueryOptions } from '@/api/datasources/get-datasource-columns'
import { getDatasourceTablesQueryOptions } from '@/api/datasources/get-datasource-tables'
import { useCreateQueryMutation } from '@/api/queries/create-query'
import { getQueriesQueryOptions } from '@/api/queries/get-queries'
import { AsyncBoundary } from '@/components/errors'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { useEditorConfigStore } from '@/stores/editor-config-store'
import { useQueryTableStore } from '@/stores/query-table-store'
import { useSelectedQueryStore } from '@/stores/selected-query-store'

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

function QueryEditorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { selectedDataSourceId, selectedSchema } = useEditorConfigStore()
  const { limitRows } = useQueryTableStore()
  const { selectedQueryId } = useSelectedQueryStore()
  const { data: queries } = useSuspenseQuery(getQueriesQueryOptions())

  const [editedSql, setEditedSql] = useState<{ forQueryId: number | null; sql: string }>(() => ({
    forQueryId: selectedQueryId,
    sql: queries.find((q) => q.id === selectedQueryId)?.sql ?? '',
  }))

  const sqlValue =
    editedSql.forQueryId === selectedQueryId
      ? editedSql.sql
      : (queries.find((q) => q.id === selectedQueryId)?.sql ?? '')

  const setSqlValue = (sql: string) => setEditedSql({ forQueryId: selectedQueryId, sql })

  const editorRef = useRef<EditorView | null>(null)
  const { result, error, isRunning, execute } = useQueryExecution()
  const createQueryMutation = useCreateQueryMutation()

  const dsId = selectedDataSourceId ?? 0
  const schema = selectedSchema ?? ''
  const tablesQuery = useQuery(getDatasourceTablesQueryOptions(dsId, schema))
  const permittedTables = useMemo(
    () => (tablesQuery.data ?? []).filter((t) => t.hasPermission),
    [tablesQuery.data]
  )
  const columnQueries = useQueries({
    queries: permittedTables.map((t) =>
      getDatasourceColumnsQueryOptions(dsId, schema, t.tableName)
    ),
  })
  const schemaMap = useMemo(() => {
    const map: Record<string, string[]> = {}
    permittedTables.forEach((table, i) => {
      const columns = columnQueries[i]?.data
      map[table.tableName] = columns ? columns.map((c) => c.name) : []
    })
    return map
  }, [permittedTables, columnQueries])

  const handleSave = (name: string, memo?: string, onSuccess?: () => void) => {
    createQueryMutation.mutate(
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
          <AsyncBoundary loadingFallback={<div className="h-full border-r" />}>
            <QuerySidebar />
          </AsyncBoundary>
        </div>
      )}

      {/* Main editor area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <AsyncBoundary loadingFallback={<div className="h-11 shrink-0 border-b" />}>
          <EditorToolbar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            onRun={handleRun}
            isRunning={isRunning}
            onSave={handleSave}
            isSaving={createQueryMutation.isPending}
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
