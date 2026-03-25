import { delay, http, HttpResponse } from 'msw'

import { addMockQuery, deleteMockQuery, getMockQueries } from '../data/queries'

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
]
