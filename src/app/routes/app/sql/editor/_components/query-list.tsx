import { useSuspenseQuery } from '@tanstack/react-query'
import { FileTextIcon, Trash2Icon } from 'lucide-react'

import { getQueriesQueryOptions } from '@/api/queries/get-queries'
import { cn } from '@/lib/utils'
import type { SavedQuery } from '@/types/manual/saved-query'

type QueryListProps = {
  loadedQueryId: number | null
  onLoad: (query: SavedQuery) => void
  onDelete: (query: SavedQuery) => void
}

export function QueryList({ loadedQueryId, onLoad, onDelete }: QueryListProps) {
  const { data: queries } = useSuspenseQuery(getQueriesQueryOptions())
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

type QueryItemProps = {
  query: SavedQuery
  isActive: boolean
  onLoad: (query: SavedQuery) => void
  onDelete: (query: SavedQuery) => void
}

export function QueryItem({ query, isActive, onLoad, onDelete }: QueryItemProps) {
  return (
    <div
      className={cn(
        'group flex w-full items-center gap-2 rounded-md px-2 py-1.5',
        isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'
      )}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
        onClick={() => onLoad(query)}
      >
        <FileTextIcon
          className={cn('size-3.5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
        />
        <span className="truncate text-xs">{query.name}</span>
      </button>

      <button
        type="button"
        className="text-muted-foreground hover:text-destructive invisible shrink-0 group-hover:visible"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(query)
        }}
        aria-label={`${query.name} 삭제`}
      >
        <Trash2Icon className="size-3.5" />
      </button>
    </div>
  )
}
