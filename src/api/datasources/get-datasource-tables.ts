import { queryOptions } from '@tanstack/react-query'

import type { TableInfo } from '@/types/manual/datasource'

import { querypie } from '../querypie'

export const getDatasourceTablesService = (datasourceId: number, schema: string) =>
  querypie.instance
    .get<TableInfo[]>(`/api/datasources/${datasourceId}/schemas/${schema}/tables`)
    .then((res) => res.data)

export const getDatasourceTablesQueryOptions = (datasourceId: number, schema: string) =>
  queryOptions({
    queryKey: ['getDatasourceTables', datasourceId, schema],
    queryFn: () => getDatasourceTablesService(datasourceId, schema),
    enabled: datasourceId > 0 && schema.length > 0,
  })
