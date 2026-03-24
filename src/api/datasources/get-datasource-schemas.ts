import { queryOptions } from '@tanstack/react-query'

import type { SchemaInfo } from '@/types/manual/datasource'

import { querypie } from '../querypie'

export const getDatasourceSchemasService = (datasourceId: number) =>
  querypie.instance
    .get<SchemaInfo[]>(`/api/datasources/${datasourceId}/schemas`)
    .then((res) => res.data)

export const getDatasourceSchemasQueryOptions = (datasourceId: number) =>
  queryOptions({
    queryKey: ['getDatasourceSchemas', datasourceId],
    queryFn: () => getDatasourceSchemasService(datasourceId),
    enabled: datasourceId > 0,
  })
