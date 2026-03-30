import { delay, http, HttpResponse } from 'msw'

import { mockSchemas } from '../data/schemas'
import { mockColumns, mockTables } from '../data/tables'

export const datasourceHandlers = [
  // GET /api/schemas (전체 스키마 목록)
  http.get('*/api/schemas', async () => {
    await delay(300)
    return HttpResponse.json(mockSchemas)
  }),

  // GET /api/schemas/:schema/tables
  http.get('*/api/schemas/:schema/tables', async ({ params }) => {
    await delay(300)
    const tables = mockTables[params.schema as string] ?? []
    return HttpResponse.json(tables)
  }),

  // GET /api/schemas/:schema/tables/:table/columns
  http.get('*/api/schemas/:schema/tables/:table/columns', async ({ params }) => {
    await delay(200)
    const columns = mockColumns[params.table as string] ?? []
    return HttpResponse.json(columns)
  }),
]
