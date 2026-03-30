import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { getMaskingRequestsQueryOptions } from '@/api/permissions/masking/get-masking-requests'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MaskingPermissionStatus } from '@/types/manual/masking'

type StatusFilter = 'ALL' | MaskingPermissionStatus

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '대기중' },
  { value: 'APPROVED', label: '승인' },
  { value: 'REJECTED', label: '거절' },
]

function useMaskingFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentFilter = (searchParams.get('status') ?? 'ALL') as StatusFilter

  const setFilter = (value: StatusFilter) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'ALL') {
      next.delete('status')
    } else {
      next.set('status', value)
    }
    setSearchParams(next)
  }

  return { currentFilter, setFilter }
}

export function MaskingFilterTabs() {
  const { currentFilter, setFilter } = useMaskingFilter()
  const maskingRequestsQuery = useSuspenseQuery(getMaskingRequestsQueryOptions())

  const filterCounts = useMemo(
    () =>
      Object.fromEntries(
        STATUS_FILTERS.map(({ value: v }) => [
          v,
          v === 'ALL'
            ? maskingRequestsQuery.data.items.length
            : maskingRequestsQuery.data.items.filter((item) => item.status === v).length,
        ])
      ) as Record<StatusFilter, number>,
    [maskingRequestsQuery.data.items]
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

export function MaskingFilterTabsSkeleton() {
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
