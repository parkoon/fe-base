import { delay, http, HttpResponse } from 'msw'

import type { MaskingRequestForm } from '@/types/manual/masking'

import {
  addMockMaskingRequest,
  getMockMaskingRequests,
  mockMaskingColumnsByTable,
} from '../data/masking'

export const maskingHandlers = [
  // GET /api/permissions/masking/requests
  http.get('*/api/permissions/masking/requests', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const status = url.searchParams.get('status') ?? 'ALL'
    const items = getMockMaskingRequests(status)
    return HttpResponse.json({ items, total: items.length })
  }),

  // GET /api/permissions/masking/columns
  http.get('*/api/permissions/masking/columns', async ({ request }) => {
    await delay(250)
    const url = new URL(request.url)
    const tableName = url.searchParams.get('tableName') ?? ''
    const columns = mockMaskingColumnsByTable[tableName] ?? []
    return HttpResponse.json(columns)
  }),

  // POST /api/permissions/masking/requests
  http.post('*/api/permissions/masking/requests', async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as MaskingRequestForm
    const newRequest = addMockMaskingRequest({
      schema: body.schema,
      tableName: body.tableName,
      tableComment: '',
      columns: body.columns,
      reason: body.reason,
    })
    return HttpResponse.json(newRequest, { status: 201 })
  }),
]
