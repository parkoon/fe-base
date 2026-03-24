import { useQuery } from '@tanstack/react-query'
import { ChevronsUpDownIcon, DatabaseIcon, LayersIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'

import { getDatasourceSchemasQueryOptions } from '@/api/datasources/get-datasource-schemas'
import { getDatasourcesQueryOptions } from '@/api/datasources/get-datasources'
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

type DataSourceSchemaPickerProps = {
  datasourceId: number | null
  schema: string | null
  onDatasourceChange: (id: number, name: string) => void
  onSchemaChange: (schema: string) => void
  disabled?: boolean
}

export function RequestDatasourcePicker({
  datasourceId,
  schema,
  onDatasourceChange,
  onSchemaChange,
  disabled,
}: DataSourceSchemaPickerProps) {
  const { data: datasources, isLoading: dsLoading } = useQuery(getDatasourcesQueryOptions())
  const { data: schemas, isLoading: schemaLoading } = useQuery(
    getDatasourceSchemasQueryOptions(datasourceId ?? 0)
  )

  const selectedDs = datasources?.find((ds) => ds.id === datasourceId)

  return (
    <div className="flex items-center gap-3">
      {/* DataSource 선택 */}
      <ComboboxSelect
        icon={<DatabaseIcon className="text-muted-foreground size-4" />}
        placeholder="DataSource 선택"
        value={selectedDs?.name ?? null}
        loading={dsLoading}
        disabled={disabled}
        items={(datasources ?? []).map((ds) => ({
          value: String(ds.id),
          label: ds.name,
          description: `${ds.host}:${ds.port} (${ds.driver})`,
        }))}
        onSelect={(value) => {
          const ds = datasources?.find((d) => String(d.id) === value)
          if (ds) {
            onDatasourceChange(ds.id, ds.name)
            onSchemaChange('')
          }
        }}
      />

      {/* Schema 선택 */}
      <ComboboxSelect
        icon={<LayersIcon className="text-muted-foreground size-4" />}
        placeholder="Schema 선택"
        value={schema}
        loading={schemaLoading}
        disabled={disabled ?? !datasourceId}
        items={(schemas ?? []).map((s) => ({
          value: s.name,
          label: s.name,
          description: `${s.tableCount}개 테이블`,
        }))}
        onSelect={(value) => onSchemaChange(value)}
      />
    </div>
  )
}

type ComboboxItem = {
  value: string
  label: string
  description?: string
}

type ComboboxSelectProps = {
  icon: React.ReactNode
  placeholder: string
  value: string | null
  loading?: boolean
  disabled?: boolean
  items: ComboboxItem[]
  onSelect: (value: string) => void
}

function ComboboxSelect({
  icon,
  placeholder,
  value,
  loading,
  disabled,
  items,
  onSelect,
}: ComboboxSelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            'h-9 min-w-[200px] justify-between gap-2 px-3 font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {icon}
            {loading ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <span className="truncate">{value ?? placeholder}</span>
            )}
          </span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-0"
        align="start"
      >
        <Command>
          <CommandList>
            <CommandEmpty>결과가 없습니다</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(v) => {
                    onSelect(v)
                    setOpen(false)
                  }}
                  keywords={[item.label, item.description ?? '']}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">{item.label}</span>
                    {item.description && (
                      <span className="text-muted-foreground text-xs">{item.description}</span>
                    )}
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
