import { queryOptions } from '@tanstack/react-query'

import type { QueryConfig } from '@/lib/react-query'

import { dummyjson } from '../dummyjson'

export const getTodosRandomService = () => dummyjson.GET('/todos/random')

export const getTodosRandomQueryOptions = () =>
  queryOptions({
    queryKey: ['getTodosRandom'],
    queryFn: getTodosRandomService,
  })

export type GetTodosRandomQueryConfig = QueryConfig<typeof getTodosRandomQueryOptions>
