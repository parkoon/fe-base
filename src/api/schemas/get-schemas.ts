import { queryOptions } from '@tanstack/react-query'

import type { SchemaInfo } from '@/types/manual/query'

import { querypie } from '../querypie'

export const getSchemasService = () =>
  querypie.instance.get<SchemaInfo[]>('/api/schemas').then((res) => res.data)

export const getSchemasQueryOptions = () =>
  queryOptions({
    queryKey: ['getSchemas'],
    queryFn: getSchemasService,
  })
