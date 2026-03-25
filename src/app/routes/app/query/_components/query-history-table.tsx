import { useSuspenseQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { getQueryHistoryQueryOptions } from '@/api/queries/get-query-history'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

export const PAGE_SIZE = 20

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

export function HistoryTableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-10 w-full"
          />
        ))}
      </div>
    </div>
  )
}

export function QueryHistoryTable() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? 0)
  const dataSourceId = searchParams.get('dataSourceId')
    ? Number(searchParams.get('dataSourceId'))
    : undefined

  const queryHistoryQuery = useSuspenseQuery(
    getQueryHistoryQueryOptions({ page, size: PAGE_SIZE, dataSourceId })
  )

  const items = queryHistoryQuery.data.items
  const total = queryHistoryQuery.data.total
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const setPage = (p: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (p === 0) next.delete('page')
      else next.set('page', String(p))
      return next
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-sm">총 {total.toLocaleString()}건</span>

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
            {items.length === 0 ? (
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
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
            onClick={() => setPage(page + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  )
}
