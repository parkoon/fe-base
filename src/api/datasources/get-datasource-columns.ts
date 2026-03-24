import { queryOptions } from '@tanstack/react-query'

import type { ColumnInfo } from '@/types/manual/datasource'

import { querypie } from '../querypie'

export const getDatasourceColumnsService = (
  datasourceId: number,
  schema: string,
  tableName: string
) =>
  querypie.instance
    .get<
      ColumnInfo[]
    >(`/api/datasources/${datasourceId}/schemas/${schema}/tables/${tableName}/columns`)
    .then((res) => res.data)

export const getDatasourceColumnsQueryOptions = (
  datasourceId: number,
  schema: string,
  tableName: string
) =>
  queryOptions({
    queryKey: ['getDatasourceColumns', datasourceId, schema, tableName],
    queryFn: () => getDatasourceColumnsService(datasourceId, schema, tableName),
    enabled: datasourceId > 0 && schema.length > 0 && tableName.length > 0,
  })
