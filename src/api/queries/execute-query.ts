import type { ExecuteQueryRequest, ExecuteQueryResponse } from '@/types/manual/query'

import { querypie } from '../querypie'

export const executeQueryService = (body: ExecuteQueryRequest): Promise<ExecuteQueryResponse> =>
  querypie.instance.post<ExecuteQueryResponse>('/api/queries/execute', body).then((res) => res.data)
