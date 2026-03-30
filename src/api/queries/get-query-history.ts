import { queryOptions } from '@tanstack/react-query'

import type { QueryHistoryListResponse } from '@/types/manual/query'

import { querypie } from '../querypie'

type GetQueryHistoryParams = {
  page: number
  size: number
}

export const getQueryHistoryService = (
  params: GetQueryHistoryParams
): Promise<QueryHistoryListResponse> =>
  querypie.instance
    .get<QueryHistoryListResponse>('/api/queries/history', { params })
    .then((res) => res.data)

export const getQueryHistoryQueryOptions = (params: GetQueryHistoryParams) =>
  queryOptions({
    queryKey: ['queryHistory', params],
    queryFn: () => getQueryHistoryService(params),
  })
