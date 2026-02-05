import { useMutation } from '@tanstack/react-query'

import type { InferBody } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const postTodosAddService = (data: InferBody<paths, '/todos/add', 'post'>) =>
  dummyjson.POST('/todos/add', data)

type UsePostTodosAddMutationOptions = {
  mutationConfig?: MutationConfig<typeof postTodosAddService>
}

export function usePostTodosAddMutation({ mutationConfig }: UsePostTodosAddMutationOptions = {}) {
  return useMutation({
    mutationFn: postTodosAddService,
    ...mutationConfig,
  })
}
