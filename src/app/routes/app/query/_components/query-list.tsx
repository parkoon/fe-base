import type { SavedQuery } from '@/types/manual/saved-query'

import { QueryItem } from './query-item'

type QueryListProps = {
  queries: SavedQuery[]
  loadedQueryId: number | null
  onLoad: (query: SavedQuery) => void
  onDelete: (query: SavedQuery) => void
}

export function QueryList({ queries, loadedQueryId, onLoad, onDelete }: QueryListProps) {
  if (queries.length === 0) {
    return (
      <p className="text-muted-foreground px-3 py-4 text-center text-xs">저장된 쿼리가 없습니다</p>
    )
  }

  return (
    <div className="space-y-0.5">
      {queries.map((query) => (
        <QueryItem
          key={query.id}
          query={query}
          isActive={query.id === loadedQueryId}
          onLoad={onLoad}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
