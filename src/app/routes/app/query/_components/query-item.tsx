import { FileTextIcon, Trash2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { SavedQuery } from '@/types/manual/saved-query'

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
