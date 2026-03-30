import { useSuspenseQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { getDatasourcesQueryOptions } from '@/api/datasources/get-datasources'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function DatasourceSelector() {
  const [searchParams, setSearchParams] = useSearchParams()
  const dataSourceId = searchParams.get('dataSourceId') ?? 'all'

  const datasourcesQuery = useSuspenseQuery(getDatasourcesQueryOptions())

  const handleChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === 'all') next.delete('dataSourceId')
      else next.set('dataSourceId', value)
      next.delete('page')
      return next
    })
  }

  return (
    <Select
      value={dataSourceId}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-52">
        <SelectValue placeholder="DataSource 전체" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">DataSource 전체</SelectItem>
        {datasourcesQuery.data.map((ds) => (
          <SelectItem
            key={ds.id}
            value={String(ds.id)}
          >
            {ds.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
