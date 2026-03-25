import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { MutationConfig } from '@/lib/react-query'
import type { CreateQueryBody, SavedQuery } from '@/types/manual/saved-query'

import { querypie } from '../querypie'
import { getQueriesQueryOptions } from './get-queries'

export const createQueryService = (body: CreateQueryBody): Promise<SavedQuery> =>
  querypie.instance.post<SavedQuery>('/api/queries', body).then((res) => res.data)

type UseCreateQueryMutationOptions = {
  mutationConfig?: MutationConfig<typeof createQueryService>
}

export function useCreateQueryMutation({ mutationConfig }: UseCreateQueryMutationOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createQueryService,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getQueriesQueryOptions().queryKey })
    },
    ...mutationConfig,
  })
}
