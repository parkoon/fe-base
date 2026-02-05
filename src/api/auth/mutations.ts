import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { MutationConfig } from '@/lib/react-query'

import type { LoginRequest } from './services'
import { postAuthLoginService, postAuthRefreshService } from './services'

// POST /auth/login
interface UsePostAuthLoginMutationOptions {
  mutationConfig?: MutationConfig<typeof postAuthLoginService>
}

export function usePostAuthLoginMutation({ mutationConfig }: UsePostAuthLoginMutationOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginRequest) => postAuthLoginService(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['getAuthMe'] })
    },
    ...mutationConfig,
  })
}

// POST /auth/refresh
interface UsePostAuthRefreshMutationOptions {
  mutationConfig?: MutationConfig<typeof postAuthRefreshService>
}

export function usePostAuthRefreshMutation({
  mutationConfig,
}: UsePostAuthRefreshMutationOptions = {}) {
  return useMutation({
    mutationFn: (data: { refreshToken: string; expiresInMins?: number }) =>
      postAuthRefreshService(data),
    ...mutationConfig,
  })
}
