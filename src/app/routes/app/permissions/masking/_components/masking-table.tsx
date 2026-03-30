import { useSuspenseQuery } from '@tanstack/react-query'
import { LayersIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { getMaskingRequestsQueryOptions } from '@/api/permissions/masking/get-masking-requests'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { $dayjs } from '@/lib/dayjs'
import type { MaskingPermissionStatus, MaskingRequest } from '@/types/manual/masking'
import { MASKING_STATUS_MAP } from '@/types/manual/masking'

type StatusFilter = 'ALL' | MaskingPermissionStatus

function MaskingStatusBadge({ status }: { status: MaskingPermissionStatus }) {
  const { label, color } = MASKING_STATUS_MAP[status]
  return (
    <Badge
      variant="outline"
      className={`text-xs ${color}`}
    >
      {label}
    </Badge>
  )
}

function MaskingTableRow({ item }: { item: MaskingRequest }) {
  return (
    <TableRow>
      <TableCell className="text-muted-foreground pl-4 font-mono text-xs">{item.id}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <LayersIcon className="text-muted-foreground size-3.5 shrink-0" />
          <span className="text-sm">{item.schema}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-sm">{item.tableName}</span>
          {item.tableComment && (
            <span className="text-muted-foreground text-xs">{item.tableComment}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {item.columns.map((col) => (
            <Badge
              key={col}
              variant="secondary"
              className="font-mono text-xs"
            >
              {col}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <span
          className="text-muted-foreground block max-w-[200px] truncate text-sm"
          title={item.reason}
        >
          {item.reason}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm tabular-nums">
        {$dayjs(item.createdAt).format('YY.MM.DD')}
      </TableCell>
      <TableCell className="pr-4">
        <MaskingStatusBadge status={item.status} />
      </TableCell>
    </TableRow>
  )
}

export function MaskingTable() {
  const [searchParams] = useSearchParams()
  const currentFilter = (searchParams.get('status') ?? 'ALL') as StatusFilter

  const maskingRequestsQuery = useSuspenseQuery(getMaskingRequestsQueryOptions())

  const filteredItems = useMemo(
    () =>
      currentFilter === 'ALL'
        ? maskingRequestsQuery.data.items
        : maskingRequestsQuery.data.items.filter((item) => item.status === currentFilter),
    [maskingRequestsQuery.data.items, currentFilter]
  )

  return (
    <>
      <div className="ring-foreground/5 rounded-xl border ring-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[130px] pl-4">신청번호</TableHead>
              <TableHead className="w-[160px]">Schema</TableHead>
              <TableHead className="w-[180px]">테이블</TableHead>
              <TableHead className="w-[200px]">컬럼</TableHead>
              <TableHead className="w-[200px]">사유</TableHead>
              <TableHead className="w-[90px]">신청일</TableHead>
              <TableHead className="w-[90px] pr-4">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-12 text-center text-sm"
                >
                  신청 내역이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <MaskingTableRow
                  key={item.id}
                  item={item}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredItems.length > 0 && (
        <p className="text-muted-foreground text-xs">총 {filteredItems.length}건</p>
      )}
    </>
  )
}

export function MaskingTableSkeleton() {
  return (
    <div className="ring-foreground/5 rounded-xl border ring-1">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[130px] pl-4">신청번호</TableHead>
            <TableHead className="w-[160px]">Schema</TableHead>
            <TableHead className="w-[180px]">테이블</TableHead>
            <TableHead className="w-[200px]">컬럼</TableHead>
            <TableHead className="w-[200px]">사유</TableHead>
            <TableHead className="w-[90px]">신청일</TableHead>
            <TableHead className="w-[90px] pr-4">상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="pl-4">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell className="pr-4">
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
