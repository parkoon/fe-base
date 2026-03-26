import { CheckIcon, ChevronDownIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LIMIT_OPTIONS, useQueryTableStore } from '@/stores/query-table-store'

export function LimitSelect() {
  const { limitRows, setLimitRows } = useQueryTableStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:bg-accent flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors"
        >
          <span className="font-medium">{limitRows === 0 ? 'No limit' : `${limitRows} rows`}</span>
          <ChevronDownIcon className="text-muted-foreground size-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LIMIT_OPTIONS.map((limit) => (
          <DropdownMenuItem
            key={limit}
            onClick={() => setLimitRows(limit)}
          >
            <span className="flex-1">{limit === 0 ? 'No limit' : `${limit} rows`}</span>
            {limit === limitRows && <CheckIcon className="size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
