import { useMutation } from '@tanstack/react-query'

import type { InferBody } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const postAuthRefreshService = (data: InferBody<paths, '/auth/refresh', 'post'>) =>
  dummyjson.POST('/auth/refresh', data)

interface UsePostAuthRefreshMutationOptions {
  mutationConfig?: MutationConfig<typeof postAuthRefreshService>
}

export function usePostAuthRefreshMutation({
  mutationConfig,
}: UsePostAuthRefreshMutationOptions = {}) {
  return useMutation({
    mutationFn: postAuthRefreshService,
    ...mutationConfig,
  })
}
