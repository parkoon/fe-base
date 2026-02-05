import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { InferBody } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const postAuthLoginService = (data: InferBody<paths, '/auth/login', 'post'>) =>
  dummyjson.POST('/auth/login', data)

type UsePostAuthLoginMutationOptions = {
  mutationConfig?: MutationConfig<typeof postAuthLoginService>
}

export function usePostAuthLoginMutation({ mutationConfig }: UsePostAuthLoginMutationOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postAuthLoginService,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['getAuthMe'] })
    },
    ...mutationConfig,
  })
}
