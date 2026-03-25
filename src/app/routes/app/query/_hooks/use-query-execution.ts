import { useCallback, useState } from 'react'

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

// Mock 실행 — 실제 API 연동 시 교체
async function mockExecuteQuery(sql: string, _limitRows: number): Promise<QueryResult> {
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

  const trimmed = sql.trim().toLowerCase()

  if (!trimmed) {
    throw new Error('쿼리를 입력해주세요.')
  }

  if (trimmed.startsWith('select')) {
    const rows = Array.from({ length: Math.min(_limitRows || 20, 50) }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      created_at: '2024-01-15T09:30:00Z',
      status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'inactive' : 'pending',
    }))

    return {
      columns: ['id', 'name', 'email', 'created_at', 'status'],
      rows,
      rowCount: rows.length,
      executionTimeMs: Math.floor(50 + Math.random() * 200),
    }
  }

  // Non-SELECT queries
  return {
    columns: ['affected_rows'],
    rows: [{ affected_rows: Math.floor(Math.random() * 10) + 1 }],
    rowCount: 1,
    executionTimeMs: Math.floor(10 + Math.random() * 50),
  }
}

export function useQueryExecution() {
  const [state, setState] = useState<QueryExecutionState>({
    result: null,
    error: null,
    isRunning: false,
  })

  const execute = useCallback(async (sql: string, limitRows: number) => {
    setState({ result: null, error: null, isRunning: true })

    try {
      const result = await mockExecuteQuery(sql, limitRows)
      setState({ result, error: null, isRunning: false })
    } catch (err) {
      setState({
        result: null,
        error: err instanceof Error ? err.message : '쿼리 실행 중 오류가 발생했습니다.',
        isRunning: false,
      })
    }
  }, [])

  return { ...state, execute }
}
