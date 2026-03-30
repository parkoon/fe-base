import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { MaskingRequest, MaskingRequestForm } from '@/types/manual/masking'

import { querypie } from '../../querypie'

export const postMaskingRequestService = (data: MaskingRequestForm) =>
  querypie.instance
    .post<MaskingRequest>('/api/permissions/masking/requests', data)
    .then((res) => res.data)

export function usePostMaskingRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postMaskingRequestService,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['getMaskingRequests'] })
    },
  })
}
