import { queryOptions } from '@tanstack/react-query'

import type { InferPathParams } from '@/lib/api'
import type { QueryConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const getTodosRandomLengthService = (
  params: InferPathParams<paths, '/todos/random/{length}', 'get'>
) => dummyjson.GET('/todos/random/{length}', { path: params })

export const getTodosRandomLengthQueryOptions = (
  length: InferPathParams<paths, '/todos/random/{length}', 'get'>[keyof InferPathParams<
    paths,
    '/todos/random/{length}',
    'get'
  >]
) =>
  queryOptions({
    queryKey: ['getTodosRandomLength', length],
    queryFn: () => getTodosRandomLengthService({ length }),
  })

export type GetTodosRandomLengthQueryConfig = QueryConfig<typeof getTodosRandomLengthQueryOptions>
