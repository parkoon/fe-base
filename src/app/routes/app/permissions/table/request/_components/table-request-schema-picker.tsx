import { useSuspenseQuery } from '@tanstack/react-query'
import { ChevronsUpDownIcon, LayersIcon } from 'lucide-react'
import { useState } from 'react'

import { getSchemasQueryOptions } from '@/api/schemas/get-schemas'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { useTablePermissionRequest } from '../_context/table-request-context'

export function TableRequestSchemaPicker() {
  const { state, actions } = useTablePermissionRequest()
  const schemasQuery = useSuspenseQuery(getSchemasQueryOptions())
  const [open, setOpen] = useState(false)

  const selected = state.selectedSchema

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            'w-full justify-between gap-2 px-3 font-normal',
            !selected && 'text-muted-foreground'
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <LayersIcon className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate">{selected ? selected.name : 'Schema 선택'}</span>
          </span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] p-0"
        align="start"
      >
        <Command>
          <CommandList>
            <CommandEmpty>스키마가 없습니다</CommandEmpty>
            <CommandGroup>
              {schemasQuery.data.map((schema) => (
                <CommandItem
                  key={schema.name}
                  value={schema.name}
                  onSelect={() => {
                    actions.selectSchema(schema)
                    setOpen(false)
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-sm">{schema.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {schema.tableCount}개 테이블
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
