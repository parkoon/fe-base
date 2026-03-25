import type { QueryHistoryItem } from '@/types/manual/query'
import type { SavedQuery } from '@/types/manual/saved-query'

export const mockQueries: SavedQuery[] = [
  {
    id: 1,
    name: '전체 게시글 조회',
    sql: 'SELECT * FROM POSTS ORDER BY CREATED_AT DESC',
    createdAt: '2025-03-20T09:00:00',
  },
  {
    id: 2,
    name: '최근 사용자 목록',
    sql: 'SELECT ID, NAME, EMAIL, CREATED_AT FROM USERS WHERE CREATED_AT >= SYSDATE - 30 ORDER BY CREATED_AT DESC',
    createdAt: '2025-03-21T11:30:00',
  },
  {
    id: 3,
    name: '주문 통계',
    sql: "SELECT TO_CHAR(ORDER_DATE, 'YYYY-MM') AS MONTH, COUNT(*) AS ORDER_COUNT, SUM(AMOUNT) AS TOTAL FROM ORDERS GROUP BY TO_CHAR(ORDER_DATE, 'YYYY-MM') ORDER BY MONTH DESC",
    createdAt: '2025-03-22T14:00:00',
  },
]

let nextId = 4

export function getMockQueries() {
  return [...mockQueries]
}

export function addMockQuery(name: string, sql: string, memo?: string): SavedQuery {
  const query: SavedQuery = {
    id: nextId++,
    name,
    sql,
    ...(memo ? { memo } : {}),
    createdAt: new Date().toISOString(),
  }
  mockQueries.push(query)
  return query
}

export function deleteMockQuery(id: number): boolean {
  const index = mockQueries.findIndex((q) => q.id === id)
  if (index === -1) return false
  mockQueries.splice(index, 1)
  return true
}

// ───── 실행 이력 Mock 데이터 ─────

const dataSourceNames: Record<number, string> = {
  1: '정보계-Oracle',
  2: '분석계-PostgreSQL',
  3: '마케팅-MySQL',
}

const mockHistoryBase: QueryHistoryItem[] = [
  {
    id: 'h-001',
    sql: 'SELECT * FROM T_CUSTOMER ORDER BY CREATED_AT DESC',
    dataSourceId: 1,
    dataSourceName: '정보계-Oracle',
    schema: 'hdmf_prod',
    rowCount: 100,
    executionTimeMs: 124,
    status: 'success',
    executedAt: '2026-03-25T10:30:00Z',
  },
  {
    id: 'h-002',
    sql: 'SELECT ID, NAME, EMAIL FROM USERS WHERE DEPT_CODE = :dept',
    dataSourceId: 1,
    dataSourceName: '정보계-Oracle',
    schema: 'hdmf_prod',
    rowCount: 0,
    executionTimeMs: 89,
    status: 'error',
    errorMessage: 'ORA-00942: table or view does not exist',
    executedAt: '2026-03-25T10:15:00Z',
  },
  {
    id: 'h-003',
    sql: "SELECT TO_CHAR(ORDER_DATE, 'YYYY-MM') AS MONTH, COUNT(*) AS CNT FROM ORDERS GROUP BY TO_CHAR(ORDER_DATE, 'YYYY-MM')",
    dataSourceId: 2,
    dataSourceName: '분석계-PostgreSQL',
    schema: 'analytics',
    rowCount: 12,
    executionTimeMs: 231,
    status: 'success',
    executedAt: '2026-03-25T09:55:00Z',
  },
  {
    id: 'h-004',
    sql: 'SELECT * FROM T_CONTRACT WHERE CONTRACT_DATE >= SYSDATE - 90',
    dataSourceId: 1,
    dataSourceName: '정보계-Oracle',
    schema: 'hdmf_prod',
    rowCount: 500,
    executionTimeMs: 387,
    status: 'success',
    executedAt: '2026-03-24T16:40:00Z',
  },
  {
    id: 'h-005',
    sql: 'SELECT PRODUCT_ID, SUM(AMOUNT) AS TOTAL FROM T_SALES GROUP BY PRODUCT_ID ORDER BY TOTAL DESC',
    dataSourceId: 3,
    dataSourceName: '마케팅-MySQL',
    schema: 'marketing',
    rowCount: 88,
    executionTimeMs: 156,
    status: 'success',
    executedAt: '2026-03-24T14:20:00Z',
  },
]

const mockHistoryItems: QueryHistoryItem[] = [...mockHistoryBase]
let historyNextId = 100

export function getMockHistory(params: { page: number; size: number; dataSourceId?: number }): {
  items: QueryHistoryItem[]
  total: number
  page: number
  size: number
} {
  const filtered = params.dataSourceId
    ? mockHistoryItems.filter((h) => h.dataSourceId === params.dataSourceId)
    : mockHistoryItems

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
  )

  const start = params.page * params.size
  const items = sorted.slice(start, start + params.size)

  return { items, total: filtered.length, page: params.page, size: params.size }
}

export function addMockHistory(
  item: Omit<QueryHistoryItem, 'id' | 'executedAt'>
): QueryHistoryItem {
  const entry: QueryHistoryItem = {
    ...item,
    id: `h-${++historyNextId}`,
    executedAt: new Date().toISOString(),
    dataSourceName: dataSourceNames[item.dataSourceId] ?? `DataSource ${item.dataSourceId}`,
  }
  mockHistoryItems.unshift(entry)
  return entry
}
