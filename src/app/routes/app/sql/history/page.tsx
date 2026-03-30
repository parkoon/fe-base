import type { QueryClient } from '@tanstack/react-query'

import { getQueryHistoryQueryOptions } from '@/api/queries/get-query-history'
import { AsyncBoundary } from '@/components/errors'

import { HistoryTableSkeleton, QueryHistoryTable } from './_components/query-history-table'

export const clientLoader = (queryClient: QueryClient) => async () => {
  await queryClient.ensureQueryData(getQueryHistoryQueryOptions({ page: 0, size: 20 }))
  return null
}

function QueryHistoryPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">실행 이력</h1>
        <p className="text-muted-foreground mt-1">SQL 실행 이력을 조회합니다.</p>
      </div>

      <AsyncBoundary loadingFallback={<HistoryTableSkeleton />}>
        <QueryHistoryTable />
      </AsyncBoundary>
    </div>
  )
}

export default QueryHistoryPage
