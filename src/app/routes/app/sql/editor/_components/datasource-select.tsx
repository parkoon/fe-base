import { useSuspenseQuery } from '@tanstack/react-query'
import { CheckIcon, ChevronDownIcon, DatabaseIcon } from 'lucide-react'

import { getDatasourcesQueryOptions } from '@/api/datasources/get-datasources'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useEditorConfigStore } from '@/stores/editor-config-store'

export function DataSourceSelect() {
  const { selectedDataSourceId, setDataSource } = useEditorConfigStore()
  const datasourcesQuery = useSuspenseQuery(getDatasourcesQueryOptions())
  const selectedDs = datasourcesQuery.data.find((ds) => ds.id === selectedDataSourceId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:bg-accent flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors"
        >
          <DatabaseIcon className="text-muted-foreground size-3.5" />
          <span className="text-muted-foreground text-xs">DataSource</span>
          <span className="max-w-[120px] truncate font-medium">
            {selectedDs?.name ?? '선택하세요'}
          </span>
          <ChevronDownIcon className="text-muted-foreground size-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {datasourcesQuery.data.map((ds) => (
          <DropdownMenuItem
            key={ds.id}
            onClick={() => setDataSource(ds.id)}
            disabled={ds.status === 'INACTIVE'}
          >
            <DatabaseIcon className="text-muted-foreground size-3.5" />
            <span className="flex-1">{ds.name}</span>
            {ds.status === 'INACTIVE' && (
              <span className="text-muted-foreground text-[10px]">비활성</span>
            )}
            {ds.id === selectedDataSourceId && <CheckIcon className="size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
