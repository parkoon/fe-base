import { queryOptions } from '@tanstack/react-query'

import type { MaskingPermissionStatus, MaskingRequest } from '@/types/manual/masking'

import { querypie } from '../../querypie'

export type MaskingRequestsParams = {
  status?: MaskingPermissionStatus | 'ALL'
  page?: number
  size?: number
}

export const getMaskingRequestsService = (params?: MaskingRequestsParams) =>
  querypie.instance
    .get<{ items: MaskingRequest[]; total: number }>('/api/permissions/masking/requests', {
      params,
    })
    .then((res) => res.data)

export const getMaskingRequestsQueryOptions = (params?: MaskingRequestsParams) =>
  queryOptions({
    queryKey: ['getMaskingRequests', params],
    queryFn: () => getMaskingRequestsService(params),
  })
