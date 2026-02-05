import { queryOptions } from '@tanstack/react-query'

import type { QueryConfig } from '@/lib/react-query'

import { dummyjson } from '../dummyjson'

export const getAuthMeService = () => dummyjson.GET('/auth/me')

export const getAuthMeQueryOptions = () =>
  queryOptions({
    queryKey: ['getAuthMe'],
    queryFn: getAuthMeService,
  })

export type GetAuthMeQueryConfig = QueryConfig<typeof getAuthMeQueryOptions>
