import type { QueryClient } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { getDatasourcesQueryOptions } from '@/api/datasources/get-datasources'
import { getQueryHistoryQueryOptions } from '@/api/queries/get-query-history'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { $dayjs } from '@/lib/dayjs'
import type { QueryHistoryItem } from '@/types/manual/query'

const PAGE_SIZE = 20

export const clientLoader = (queryClient: QueryClient) => async () => {
  await queryClient.ensureQueryData(getQueryHistoryQueryOptions({ page: 0, size: PAGE_SIZE }))
  return null
}

function StatusBadge({ item }: { item: QueryHistoryItem }) {
  if (item.status === 'error') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="destructive">오류</Badge>
        </TooltipTrigger>
        {item.errorMessage && (
          <TooltipContent>
            <p className="max-w-xs text-xs">{item.errorMessage}</p>
          </TooltipContent>
        )}
      </Tooltip>
    )
  }
  return <Badge variant="secondary">성공</Badge>
}

function SqlPreview({ sql }: { sql: string }) {
  const firstLine = sql.split('\n')[0]?.trim() ?? ''
  const preview = firstLine.length > 60 ? firstLine.slice(0, 60) + '…' : firstLine

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="font-mono text-xs">{preview}</span>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="max-w-lg"
      >
        <pre className="text-xs whitespace-pre-wrap">{sql}</pre>
      </TooltipContent>
    </Tooltip>
  )
}

function HistoryTableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-10 w-full"
        />
      ))}
    </div>
  )
}

function QueryHistoryPage() {
  const [page, setPage] = useState(0)
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<number | undefined>(undefined)

  const { data: datasources = [] } = useQuery(getDatasourcesQueryOptions())

  const { data, isLoading } = useQuery(
    getQueryHistoryQueryOptions({
      page,
      size: PAGE_SIZE,
      dataSourceId: selectedDataSourceId,
    })
  )

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handleDataSourceChange = (value: string) => {
    setSelectedDataSourceId(value === 'all' ? undefined : Number(value))
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">실행 이력</h1>
        <p className="text-muted-foreground mt-1">SQL 실행 이력을 조회합니다.</p>
      </div>

      {/* 필터 바 */}
      <div className="flex items-center gap-3">
        <Select
          value={selectedDataSourceId?.toString() ?? 'all'}
          onValueChange={handleDataSourceChange}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="DataSource 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">DataSource 전체</SelectItem>
            {datasources.map((ds) => (
              <SelectItem
                key={ds.id}
                value={String(ds.id)}
              >
                {ds.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground text-sm">총 {total.toLocaleString()}건</span>
      </div>

      {/* 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">실행 시각</TableHead>
              <TableHead>SQL</TableHead>
              <TableHead className="w-36">DataSource</TableHead>
              <TableHead className="w-28">Schema</TableHead>
              <TableHead className="w-20 text-right">건수</TableHead>
              <TableHead className="w-24 text-right">실행 시간</TableHead>
              <TableHead className="w-16 text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="p-0"
                >
                  <HistoryTableSkeleton />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-12 text-center text-sm"
                >
                  실행 이력이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground text-xs">
                    {$dayjs(item.executedAt).tz().format('MM-DD HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <SqlPreview sql={item.sql} />
                  </TableCell>
                  <TableCell className="text-xs">{item.dataSourceName}</TableCell>
                  <TableCell className="font-mono text-xs">{item.schema}</TableCell>
                  <TableCell className="text-right text-xs">
                    {item.status === 'success' ? item.rowCount.toLocaleString() : '-'}
                  </TableCell>
                  <TableCell className="text-right text-xs">{item.executionTimeMs}ms</TableCell>
                  <TableCell className="text-center">
                    <StatusBadge item={item} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            이전
          </Button>
          <span className="text-sm">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  )
}

export default QueryHistoryPage
