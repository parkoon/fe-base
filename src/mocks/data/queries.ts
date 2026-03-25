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
