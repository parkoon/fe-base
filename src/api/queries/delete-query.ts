import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { MutationConfig } from '@/lib/react-query'

import { querypie } from '../querypie'
import { getQueriesQueryOptions } from './get-queries'

export const deleteQueryService = (id: number) => querypie.instance.delete(`/api/queries/${id}`)

type UseDeleteQueryMutationOptions = {
  mutationConfig?: MutationConfig<typeof deleteQueryService>
}

export function useDeleteQueryMutation({ mutationConfig }: UseDeleteQueryMutationOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteQueryService,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getQueriesQueryOptions().queryKey })
    },
    ...mutationConfig,
  })
}
