import { queryOptions } from '@tanstack/react-query'

import type { InferPathParams } from '@/lib/api'
import type { QueryConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const getTodosUserUserIdService = (
  params: InferPathParams<paths, '/todos/user/{userId}', 'get'>
) => dummyjson.GET('/todos/user/{userId}', { path: params })

export const getTodosUserUserIdQueryOptions = (
  userId: InferPathParams<paths, '/todos/user/{userId}', 'get'>[keyof InferPathParams<
    paths,
    '/todos/user/{userId}',
    'get'
  >]
) =>
  queryOptions({
    queryKey: ['getTodosUserUserId', userId],
    queryFn: () => getTodosUserUserIdService({ userId }),
  })

export type GetTodosUserUserIdQueryConfig = QueryConfig<typeof getTodosUserUserIdQueryOptions>
