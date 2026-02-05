import { useMutation } from '@tanstack/react-query'

import type { InferBody, InferPathParams } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const patchTodosIdService = (
  data: InferBody<paths, '/todos/{id}', 'patch'> & InferPathParams<paths, '/todos/{id}', 'patch'>
) => dummyjson.PATCH('/todos/{id}', data, { path: { id: data.id } })

type UsePatchTodosIdMutationOptions = {
  mutationConfig?: MutationConfig<typeof patchTodosIdService>
}

export function usePatchTodosIdMutation({ mutationConfig }: UsePatchTodosIdMutationOptions = {}) {
  return useMutation({
    mutationFn: patchTodosIdService,
    ...mutationConfig,
  })
}
