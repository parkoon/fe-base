import { queryOptions } from '@tanstack/react-query'

import type { PermissionRequestDetail } from '@/types/manual/permissions'

import { querypie } from '../querypie'

export const getPermissionsRequestDetailService = (id: string) =>
  querypie.instance
    .get<PermissionRequestDetail>(`/api/permissions/requests/${id}`)
    .then((res) => res.data)

export const getPermissionsRequestDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['getPermissionsRequestDetail', id],
    queryFn: () => getPermissionsRequestDetailService(id),
    enabled: id.length > 0,
  })
