import { useQuery } from '@tanstack/react-query'
import { CheckIcon, ChevronDownIcon, LayersIcon } from 'lucide-react'

import { getSchemasQueryOptions } from '@/api/schemas/get-schemas'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useEditorConfigStore } from '@/stores/editor-config-store'

export function SchemaSelect() {
  const { selectedSchema, setSchema } = useEditorConfigStore()
  const schemasQuery = useQuery(getSchemasQueryOptions())

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:bg-accent flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors"
        >
          <LayersIcon className="text-muted-foreground size-3.5" />
          <span className="text-muted-foreground text-xs">Schema</span>
          <span className="max-w-[120px] truncate font-medium">
            {selectedSchema ?? '선택하세요'}
          </span>
          <ChevronDownIcon className="text-muted-foreground size-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {(schemasQuery.data ?? []).map((schema) => (
          <DropdownMenuItem
            key={schema.name}
            onClick={() => setSchema(schema.name)}
          >
            <LayersIcon className="text-muted-foreground size-3.5" />
            <span className="flex-1">{schema.name}</span>
            <span className="text-muted-foreground text-[10px]">{schema.tableCount}개</span>
            {schema.name === selectedSchema && <CheckIcon className="size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
