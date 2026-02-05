import { queryOptions } from '@tanstack/react-query'

import type { QueryConfig } from '@/lib/react-query'

import { dummyjson } from '../dummyjson'

export const getTodosService = () => dummyjson.GET('/todos')

export const getTodosQueryOptions = () =>
  queryOptions({
    queryKey: ['getTodos'],
    queryFn: getTodosService,
  })

export type GetTodosQueryConfig = QueryConfig<typeof getTodosQueryOptions>
