import { queryOptions } from '@tanstack/react-query'

import type { TableInfo } from '@/types/manual/query'

import { querypie } from '../querypie'

export const getSchemaTablesService = (schema: string): Promise<TableInfo[]> =>
  querypie.instance.get<TableInfo[]>(`/api/schemas/${schema}/tables`).then((res) => res.data)

export const getSchemaTablesQueryOptions = (schema: string) =>
  queryOptions({
    queryKey: ['getSchemaTables', schema],
    queryFn: () => getSchemaTablesService(schema),
    enabled: schema.length > 0,
  })
