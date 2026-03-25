import type { CreateQueryBody, SavedQuery } from '@/types/manual/saved-query'

import { querypie } from '../querypie'

export const createQueryService = (body: CreateQueryBody): Promise<SavedQuery> =>
  querypie.instance.post<SavedQuery>('/api/queries', body).then((res) => res.data)
