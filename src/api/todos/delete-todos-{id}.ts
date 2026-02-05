import { useMutation } from '@tanstack/react-query'

import type { InferPathParams } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const deleteTodosIdService = (params: InferPathParams<paths, '/todos/{id}', 'delete'>) =>
  dummyjson.DELETE('/todos/{id}', { path: params })

type UseDeleteTodosIdMutationOptions = {
  mutationConfig?: MutationConfig<typeof deleteTodosIdService>
}

export function useDeleteTodosIdMutation({ mutationConfig }: UseDeleteTodosIdMutationOptions = {}) {
  return useMutation({
    mutationFn: deleteTodosIdService,
    ...mutationConfig,
  })
}
