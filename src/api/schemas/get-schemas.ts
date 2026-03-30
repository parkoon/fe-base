import { queryOptions } from '@tanstack/react-query'

import type { SchemaWithDatasource } from '@/types/manual/datasource'

import { querypie } from '../querypie'

export const getSchemasService = () =>
  querypie.instance.get<SchemaWithDatasource[]>('/api/schemas').then((res) => res.data)

export const getSchemasQueryOptions = () =>
  queryOptions({
    queryKey: ['getSchemas'],
    queryFn: getSchemasService,
  })
