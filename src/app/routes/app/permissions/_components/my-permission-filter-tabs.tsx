import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { getPermissionsRequestsQueryOptions } from '@/api/permissions/get-permissions-requests'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { usePermissionFilter } from '../_hooks/use-permission-filter'
import type { StatusFilter } from './types'
import { matchesFilter, STATUS_FILTERS } from './types'

export function MyPermissionFilterTabs() {
  const { currentFilter, setFilter } = usePermissionFilter()
  const { data } = useSuspenseQuery(getPermissionsRequestsQueryOptions())

  const filterCounts = useMemo(
    () =>
      Object.fromEntries(
        STATUS_FILTERS.map(({ value: v }) => [
          v,
          v === 'ALL'
            ? data.items.length
            : data.items.filter((item) => matchesFilter(item.status, v)).length,
        ])
      ) as Record<StatusFilter, number>,
    [data.items]
  )

  return (
    <Tabs
      value={currentFilter}
      onValueChange={(v) => setFilter(v as StatusFilter)}
    >
      <TabsList variant="line">
        {STATUS_FILTERS.map((f) => (
          <TabsTrigger
            key={f.value}
            value={f.value}
          >
            {f.label}
            <span className="text-muted-foreground ml-1 text-xs tabular-nums">
              {filterCounts[f.value]}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export function FilterTabsSkeleton() {
  return (
    <div className="flex gap-2">
      {STATUS_FILTERS.map((f) => (
        <Skeleton
          key={f.value}
          className="h-8 w-16"
        />
      ))}
    </div>
  )
}
