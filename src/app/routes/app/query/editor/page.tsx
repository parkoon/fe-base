import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { getQueriesQueryOptions } from '@/api/queries/get-queries'
import { AsyncBoundary } from '@/components/errors'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { SQLEditor, useSQLEditorAction, useSQLEditorValue } from '@/lib/sql-editor'
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
import { useQueryExecution } from './_hooks/use-query-execution'

function QueryEditorPage() {
  // const { selectedDataSourceId, selectedSchema } = useEditorConfigStore()
  const { limitRows } = useQueryTableStore()
  const { selectedQueryId } = useSelectedQueryStore()
  const { data: queries } = useSuspenseQuery(getQueriesQueryOptions())

  const { SQL } = useSQLEditorValue()
  const { setSQL } = useSQLEditorAction()
  const { result, error, isRunning, execute } = useQueryExecution()

  // 선택된 쿼리가 바뀌면 에디터 SQL을 해당 쿼리의 저장된 값으로 초기화
  useEffect(() => {
    const querySql = queries.find((q) => q.id === selectedQueryId)?.sql ?? ''
    setSQL(querySql)
  }, [selectedQueryId, setSQL, queries])

  // const dsId = selectedDataSourceId ?? 0
  // const schema = selectedSchema ?? ''
  // const tablesQuery = useQuery(getDatasourceTablesQueryOptions(dsId, schema))
  // const permittedTables = useMemo(
  //   () => (tablesQuery.data ?? []).filter((t) => t.hasPermission),
  //   [tablesQuery.data]
  // )
  // const columnQueries = useQueries({
  //   queries: permittedTables.map((t) =>
  //     getDatasourceColumnsQueryOptions(dsId, schema, t.tableName)
  //   ),
  // })
  // const schemaMap = useMemo(() => {
  //   const map: Record<string, string[]> = {}
  //   permittedTables.forEach((table, i) => {
  //     const columns = columnQueries[i]?.data
  //     map[table.tableName] = columns ? columns.map((c) => c.name) : []
  //   })
  //   return map
  // }, [permittedTables, columnQueries])

  // useEffect(() => {
  //   setSchema(schemaMap)
  // }, [schemaMap, setSchema])

  const handleRun = () => {
    void execute(SQL, limitRows)
  }

  return (
    <div className="-m-4 flex flex-1 overflow-hidden">
      <div className="w-52 shrink-0">
        <AsyncBoundary loadingFallback={<div className="h-full border-r" />}>
          <QuerySidebar />
        </AsyncBoundary>
      </div>

      {/* Main editor area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <AsyncBoundary loadingFallback={<div className="h-11 shrink-0 border-b" />}>
          <EditorToolbar
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
            <SQLEditor onRun={handleRun} />
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
