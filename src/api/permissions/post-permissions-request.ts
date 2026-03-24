import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { MutationConfig } from '@/lib/react-query'
import type { PermissionRequest, PermissionRequestForm } from '@/types/manual/permissions'

import { querypie } from '../querypie'

export const postPermissionsRequestService = (data: PermissionRequestForm) =>
  querypie.instance
    .post<PermissionRequest[]>('/api/permissions/requests', data)
    .then((res) => res.data)

type UsePostPermissionsRequestMutationOptions = {
  mutationConfig?: MutationConfig<typeof postPermissionsRequestService>
}

export function usePostPermissionsRequestMutation({
  mutationConfig,
}: UsePostPermissionsRequestMutationOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postPermissionsRequestService,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['getPermissionsRequests'] })
    },
    ...mutationConfig,
  })
}
