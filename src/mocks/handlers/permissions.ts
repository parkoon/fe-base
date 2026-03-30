import { delay, http, HttpResponse } from 'msw'

import { mockPermissionRequestDetails, mockPermissionRequests } from '../data/permissions'

export const permissionHandlers = [
  // GET /api/permissions/requests
  http.get('*/api/permissions/requests', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    let items = mockPermissionRequests
    if (status && status !== 'ALL') {
      items = items.filter((r) => r.status === status)
    }

    return HttpResponse.json({
      items,
      total: items.length,
    })
  }),

  // GET /api/permissions/requests/:id
  http.get('*/api/permissions/requests/:id', async ({ params }) => {
    await delay(250)
    const detail = mockPermissionRequestDetails[params.id as string]
    if (!detail) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json(detail)
  }),

  // POST /api/permissions/requests
  http.post('*/api/permissions/requests', async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as Record<string, unknown>

    // 새 신청 생성 시뮬레이션
    const newId = `PR-2026-${String(mockPermissionRequests.length + 1).padStart(3, '0')}`
    const tables = body.tables as { tableName: string; tableComment: string }[]

    const newRequests = tables.map((table) => ({
      id: newId,
      schema: body.schema as string,
      tableName: table.tableName,
      tableComment: table.tableComment,
      reason: body.reason as string,
      startDate: body.startDate as string,
      endDate: body.endDate as string,
      status: 'PENDING_FIRST' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    return HttpResponse.json(newRequests, { status: 201 })
  }),
]
