import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import { executeQueryService } from '@/api/queries/execute-query'
import { useEditorConfigStore } from '@/stores/editor-config-store'

export type QueryResult = {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  executionTimeMs: number
}

type QueryExecutionState = {
  result: QueryResult | null
  error: string | null
  isRunning: boolean
}

export function useQueryExecution() {
  const queryClient = useQueryClient()
  const { selectedDataSourceId, selectedSchema } = useEditorConfigStore()

  const [state, setState] = useState<QueryExecutionState>({
    result: null,
    error: null,
    isRunning: false,
  })

  const execute = useCallback(
    async (sql: string, limitRows: number) => {
      if (!sql.trim()) {
        setState({ result: null, error: '쿼리를 입력해주세요.', isRunning: false })
        return
      }

      if (!selectedDataSourceId || !selectedSchema) {
        setState({
          result: null,
          error: 'DataSource와 Schema를 선택해주세요.',
          isRunning: false,
        })
        return
      }

      setState({ result: null, error: null, isRunning: true })

      try {
        const data = await executeQueryService({
          sql,
          dataSourceId: selectedDataSourceId,
          schema: selectedSchema,
          limitRows,
        })

        setState({
          result: {
            columns: data.columns,
            rows: data.rows,
            rowCount: data.rowCount,
            executionTimeMs: data.executionTimeMs,
          },
          error: null,
          isRunning: false,
        })

        void queryClient.invalidateQueries({ queryKey: ['queryHistory'] })
      } catch (err) {
        setState({
          result: null,
          error: err instanceof Error ? err.message : '쿼리 실행 중 오류가 발생했습니다.',
          isRunning: false,
        })
      }
    },
    [selectedDataSourceId, selectedSchema, queryClient]
  )

  return { ...state, execute }
}
