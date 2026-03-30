import { delay, http, HttpResponse } from 'msw'

import type { ExecuteQueryRequest } from '@/types/manual/query'

import { TB_MEMBER_MASKING_INFO } from '../data/masking'
import {
  addMockHistory,
  addMockQuery,
  deleteMockQuery,
  getMockHistory,
  getMockQueries,
} from '../data/queries'

export const queryHandlers = [
  // GET /api/queries
  http.get('*/api/queries', async () => {
    await delay(300)
    return HttpResponse.json(getMockQueries())
  }),

  // POST /api/queries
  http.post('*/api/queries', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as { name: string; sql: string; memo?: string }
    const created = addMockQuery(body.name, body.sql, body.memo)
    return HttpResponse.json(created, { status: 201 })
  }),

  // DELETE /api/queries/:id
  http.delete('*/api/queries/:id', async ({ params }) => {
    await delay(200)
    deleteMockQuery(Number(params.id))
    return new HttpResponse(null, { status: 204 })
  }),

  // POST /api/queries/execute
  http.post('*/api/queries/execute', async ({ request }) => {
    await delay(500 + Math.random() * 800)

    const body = (await request.json()) as ExecuteQueryRequest
    const { sql, schema, limitRows } = body

    if (!sql.trim()) {
      return HttpResponse.json({ message: '쿼리를 입력해주세요.' }, { status: 400 })
    }

    const trimmed = sql.trim().toLowerCase()
    const isSelect = trimmed.startsWith('select') || trimmed.startsWith('show')
    const executionTimeMs = Math.floor(50 + Math.random() * 300)

    if (isSelect) {
      const count = Math.min(limitRows || 100, 100)
      const isMemberQuery = trimmed.includes('tb_member') || trimmed.includes('member')
      const rows = isMemberQuery
        ? Array.from({ length: count }, (_, i) => ({
            MEMBER_ID: i + 1,
            MEMBER_NAME: '***',
            RESIDENT_NO: '******-*******',
            PHONE: '010-****-****',
            EMAIL: `user${i + 1}@example.com`,
            JOIN_DATE: new Date(Date.now() - i * 86400000 * 30).toISOString().slice(0, 10),
            STATUS: 'ACTIVE',
          }))
        : Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            name: `Row ${i + 1}`,
            value: Math.floor(Math.random() * 10000),
            created_at: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
          }))

      const columns = isMemberQuery
        ? ['MEMBER_ID', 'MEMBER_NAME', 'RESIDENT_NO', 'PHONE', 'EMAIL', 'JOIN_DATE', 'STATUS']
        : ['id', 'name', 'value', 'created_at']

      const historyEntry = addMockHistory({
        sql,
        schema,
        rowCount: rows.length,
        executionTimeMs,
        status: 'success',
      })

      return HttpResponse.json({
        historyId: historyEntry.id,
        columns,
        rows,
        rowCount: rows.length,
        executionTimeMs,
        truncated: count >= (limitRows || 100),
        ...(isMemberQuery && { maskingInfo: TB_MEMBER_MASKING_INFO }),
      })
    }

    addMockHistory({
      sql,
      schema,
      rowCount: 0,
      executionTimeMs,
      status: 'success',
    })

    return HttpResponse.json({
      historyId: `h-tmp`,
      columns: ['affected_rows'],
      rows: [{ affected_rows: Math.floor(Math.random() * 10) + 1 }],
      rowCount: 1,
      executionTimeMs,
      truncated: false,
    })
  }),

  // GET /api/queries/history
  http.get('*/api/queries/history', async ({ request }) => {
    await delay(300)

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '20')

    return HttpResponse.json(getMockHistory({ page, size }))
  }),
]
