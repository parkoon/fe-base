import { delay, http, HttpResponse } from 'msw'

import { mockDatasources } from '../data/datasources'
import { mockAllSchemas, mockSchemas } from '../data/schemas'
import { mockColumns, mockTables } from '../data/tables'

export const datasourceHandlers = [
  // GET /api/schemas (전체 스키마 목록)
  http.get('*/api/schemas', async () => {
    await delay(300)
    return HttpResponse.json(mockAllSchemas)
  }),

  // GET /api/datasources
  http.get('*/api/datasources', async () => {
    await delay(300)
    return HttpResponse.json(mockDatasources)
  }),

  // GET /api/datasources/:id/schemas
  http.get('*/api/datasources/:id/schemas', async ({ params }) => {
    await delay(250)
    const id = Number(params.id)
    const schemas = mockSchemas[id] ?? []
    return HttpResponse.json(schemas)
  }),

  // GET /api/datasources/:dsId/schemas/:schema/tables
  http.get('*/api/datasources/:dsId/schemas/:schema/tables', async ({ params }) => {
    await delay(300)
    const key = `${params.dsId as string}:${params.schema as string}`
    const tables = mockTables[key] ?? []
    return HttpResponse.json(tables)
  }),

  // GET /api/datasources/:dsId/schemas/:schema/tables/:table/columns
  http.get('*/api/datasources/:dsId/schemas/:schema/tables/:table/columns', async ({ params }) => {
    await delay(200)
    const columns = mockColumns[params.table as string] ?? []
    return HttpResponse.json(columns)
  }),
]
