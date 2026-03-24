import { queryOptions } from '@tanstack/react-query'

import type { PermissionRequest } from '@/types/manual/permissions'

import { querypie } from '../querypie'

export type PermissionsRequestsParams = {
  status?: string
  page?: number
  size?: number
}

export const getPermissionsRequestsService = (params?: PermissionsRequestsParams) =>
  querypie.instance
    .get<{ items: PermissionRequest[]; total: number }>('/api/permissions/requests', { params })
    .then((res) => res.data)

export const getPermissionsRequestsQueryOptions = (params?: PermissionsRequestsParams) =>
  queryOptions({
    queryKey: ['getPermissionsRequests', params],
    queryFn: () => getPermissionsRequestsService(params),
  })
