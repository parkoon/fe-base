import { queryOptions } from '@tanstack/react-query'

import type { InferPathParams } from '@/lib/api'
import type { QueryConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const getTodosIdService = (params: InferPathParams<paths, '/todos/{id}', 'get'>) =>
  dummyjson.GET('/todos/{id}', { path: params })

export const getTodosIdQueryOptions = (
  id: InferPathParams<paths, '/todos/{id}', 'get'>[keyof InferPathParams<
    paths,
    '/todos/{id}',
    'get'
  >]
) =>
  queryOptions({
    queryKey: ['getTodosId', id],
    queryFn: () => getTodosIdService({ id }),
  })

export type GetTodosIdQueryConfig = QueryConfig<typeof getTodosIdQueryOptions>
