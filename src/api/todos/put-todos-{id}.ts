import { useMutation } from '@tanstack/react-query'

import type { InferBody, InferPathParams } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const putTodosIdService = (
  data: InferBody<paths, '/todos/{id}', 'put'> & InferPathParams<paths, '/todos/{id}', 'put'>
) => dummyjson.PUT('/todos/{id}', data, { path: { id: data.id } })

type UsePutTodosIdMutationOptions = {
  mutationConfig?: MutationConfig<typeof putTodosIdService>
}

export function usePutTodosIdMutation({ mutationConfig }: UsePutTodosIdMutationOptions = {}) {
  return useMutation({
    mutationFn: putTodosIdService,
    ...mutationConfig,
  })
}
