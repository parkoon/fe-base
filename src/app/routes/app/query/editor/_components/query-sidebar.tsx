import { toast } from 'sonner'

import { useDeleteQueryMutation } from '@/api/queries/delete-query'
import { AsyncBoundary } from '@/components/errors/query-error-boundary'
import { useSelectedQueryStore } from '@/stores/selected-query-store'
import type { SavedQuery } from '@/types/manual/saved-query'

import { QueryList } from './query-list'

export function QuerySidebar() {
  const { selectedQueryId, setSelectedQueryId } = useSelectedQueryStore()
  const deleteQueryMutation = useDeleteQueryMutation()

  const handleLoad = (query: SavedQuery) => {
    setSelectedQueryId(query.id)
  }

  const handleDelete = (query: SavedQuery) => {
    deleteQueryMutation.mutate(query.id, {
      onSuccess: () => {
        if (selectedQueryId === query.id) {
          setSelectedQueryId(null)
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
        <AsyncBoundary>
          <QueryList
            loadedQueryId={selectedQueryId}
            onLoad={handleLoad}
            onDelete={handleDelete}
          />
        </AsyncBoundary>
      </div>
    </div>
  )
}
