import { queryOptions } from '@tanstack/react-query'

import type { SavedQuery } from '@/types/manual/saved-query'

import { querypie } from '../querypie'

export const getQueriesService = (): Promise<SavedQuery[]> =>
  querypie.instance.get<SavedQuery[]>('/api/queries').then((res) => res.data)

export const getQueriesQueryOptions = () =>
  queryOptions({
    queryKey: ['getQueries'],
    queryFn: getQueriesService,
  })
