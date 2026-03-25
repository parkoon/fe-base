import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useDeleteQueryMutation } from '@/api/queries/delete-query'
import { getQueriesQueryOptions } from '@/api/queries/get-queries'
import { useQueryStore } from '@/stores/query-store'
import type { SavedQuery } from '@/types/manual/saved-query'

import { QueryList } from './query-list'

export function QuerySidebar() {
  const { loadedQueryId, setLoadedQuery, clearLoadedQuery } = useQueryStore()
  const { data: queries = [], isLoading } = useQuery(getQueriesQueryOptions())
  const { mutate: deleteQuery } = useDeleteQueryMutation()

  const handleLoad = (query: SavedQuery) => {
    setLoadedQuery(query.id, query.sql)
  }

  const handleDelete = (query: SavedQuery) => {
    deleteQuery(query.id, {
      onSuccess: () => {
        if (loadedQueryId === query.id) {
          clearLoadedQuery()
        }
        toast(`"${query.name}" 쿼리가 삭제되었습니다.`)
      },
    })
  }

  return (
    <div className="flex h-full w-full flex-col border-r">
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-3">
        <span className="text-sm font-semibold">SQL Editor</span>
      </div>

      {/* Query list */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <p className="text-muted-foreground px-3 py-4 text-center text-xs">불러오는 중...</p>
        ) : (
          <QueryList
            queries={queries}
            loadedQueryId={loadedQueryId}
            onLoad={handleLoad}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )
}
