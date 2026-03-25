// 웹쿼리 관련 타입 (백엔드 OpenAPI 스펙 확정 전 수동 정의)

export type QueryResult = {
  columns: QueryColumn[]
  rows: Record<string, unknown>[]
  totalCount: number
  truncated: boolean
  executionTimeMs: number
}

export type QueryColumn = {
  name: string
  type: string
  isMasked: boolean
}

export type QueryHistoryItem = {
  id: string
  sql: string
  dataSourceId: number
  dataSourceName: string
  schema: string
  rowCount: number
  executionTimeMs: number
  status: 'success' | 'error'
  errorMessage?: string
  executedAt: string
}

export type QueryHistoryListResponse = {
  items: QueryHistoryItem[]
  total: number
  page: number
  size: number
}

export type ExecuteQueryRequest = {
  sql: string
  dataSourceId: number
  schema: string
  limitRows: number
}

export type ExecuteQueryResponse = {
  historyId: string
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  executionTimeMs: number
  truncated: boolean
}

export type TableMetadata = {
  schema: string
  tableName: string
  tableComment: string
  columns: {
    name: string
    type: string
    comment: string
    isMasked: boolean
  }[]
}
