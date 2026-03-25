import { useSavedQueries } from '../_hooks/use-saved-queries'
import { QueryList } from './query-list'

export function QuerySidebar() {
  const { queries, isLoading, loadedQueryId, handleLoad, handleDelete } = useSavedQueries()

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
