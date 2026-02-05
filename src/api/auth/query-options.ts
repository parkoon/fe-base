import { queryOptions } from '@tanstack/react-query'

import type { QueryConfig } from '@/lib/react-query'

import { getAuthMeService } from './services'

// GET /auth/me
export const getAuthMeQueryOptions = () =>
  queryOptions({
    queryKey: ['getAuthMe'],
    queryFn: getAuthMeService,
  })

// Query Config Type
export type GetAuthMeQueryConfig = QueryConfig<typeof getAuthMeQueryOptions>
