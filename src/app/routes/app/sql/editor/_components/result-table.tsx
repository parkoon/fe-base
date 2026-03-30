import type { Row } from '@tanstack/react-table'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ClockIcon, LockIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditorConfigStore } from '@/stores/editor-config-store'
import type { MaskingPermissionStatus } from '@/types/manual/masking'
import { MASKING_STATUS_MAP } from '@/types/manual/masking'
import type { ColumnMaskingInfo } from '@/types/manual/query'

import type { QueryResult } from '../_hooks/use-query-execution'
import { MaskingRequestDialog } from './masking-request-dialog'

const ROW_HEIGHT = 32
const OVERSCAN = 10

const columnHelper = createColumnHelper<Record<string, unknown>>()

function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text)
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value as string | number | boolean)
}

function rowsToTsv(selectedRows: Row<Record<string, unknown>>[], columnIds: string[]) {
  const header = columnIds.join('\t')
  const body = selectedRows
    .map((row) => columnIds.map((col) => stringifyValue(row.original[col])).join('\t'))
    .join('\n')
  return `${header}\n${body}`
}

export function ResultTable({ result }: { result: QueryResult }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set())
  const [dialogColumn, setDialogColumn] = useState<string | null>(null)
  const selectedSchema = useEditorConfigStore((s) => s.selectedSchema)

  const maskingMap = useMemo(() => {
    const map = new Map<string, MaskingPermissionStatus>()
    const items: ColumnMaskingInfo[] = result.maskingInfo ?? []
    for (const info of items) {
      map.set(info.columnName, info.maskingStatus)
    }
    return map
  }, [result.maskingInfo])

  const handleMaskingClick = useCallback((columnName: string) => {
    setDialogColumn(columnName)
  }, [])

  const columns = useMemo(
    () =>
      result.columns.map((col) => {
        const maskingStatus = maskingMap.get(col)
        const isMasked = maskingStatus !== undefined
        const isPending = maskingStatus === 'PENDING'

        return columnHelper.accessor((row) => row[col], {
          id: col,
          header: isMasked
            ? () => (
                <div className="flex items-center gap-1">
                  <span>{col}</span>
                  {isPending ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-yellow-500">
                          <ClockIcon className="size-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {MASKING_STATUS_MAP.PENDING.label} — 권한 신청이 검토 중입니다
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-amber-500 hover:text-amber-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMaskingClick(col)
                          }}
                        >
                          <LockIcon className="size-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {maskingStatus === 'REJECTED'
                          ? `${MASKING_STATUS_MAP.REJECTED.label} — 클릭하여 재신청`
                          : '마스킹 정책 적용 중 — 클릭하여 권한 신청'}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )
            : col,
          cell: (info) => {
            const value = info.getValue<string | number | boolean | null>()
            if (value === null) return <span className="text-muted-foreground italic">NULL</span>
            return String(value)
          },
        })
      }),
    [result.columns, maskingMap, handleMaskingClick]
  )

  const table = useReactTable({
    data: result.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const { rows } = table.getRowModel()

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  })

  const handleCellClick = useCallback((value: unknown) => {
    const text = value === null ? 'NULL' : stringifyValue(value)
    void copyToClipboard(text).then(() => toast.success('셀 값이 복사되었습니다'))
  }, [])

  const handleRowClick = useCallback((index: number, e: React.MouseEvent) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev)
      if (e.shiftKey && prev.size > 0) {
        // Shift+클릭: 범위 선택
        const lastSelected = Math.max(...prev)
        const [start, end] = index > lastSelected ? [lastSelected, index] : [index, lastSelected]
        for (let i = start; i <= end; i++) next.add(i)
      } else if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd+클릭: 토글
        if (next.has(index)) next.delete(index)
        else next.add(index)
      } else {
        // 일반 클릭: 단일 선택
        if (next.size === 1 && next.has(index)) {
          next.clear()
        } else {
          next.clear()
          next.add(index)
        }
      }
      return next
    })
  }, [])

  // Ctrl+C: 선택된 행을 TSV로 복사
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedRowIds.size > 0) {
        e.preventDefault()
        const selectedRows = rows.filter((_, i) => selectedRowIds.has(i))
        const tsv = rowsToTsv(selectedRows, result.columns)
        void copyToClipboard(tsv).then(() =>
          toast.success(`${selectedRows.length}개 행이 복사되었습니다`)
        )
      }
    }

    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [selectedRowIds, rows, result.columns])

  return (
    <>
      {dialogColumn && (
        <MaskingRequestDialog
          open={dialogColumn !== null}
          onOpenChange={(open) => {
            if (!open) setDialogColumn(null)
          }}
          schema={selectedSchema ?? ''}
          tableName={result.tableName ?? ''}
          columnName={dialogColumn}
        />
      )}
      <div
        ref={scrollRef}
        className="h-full overflow-auto focus:outline-none"
        tabIndex={0}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-neutral-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-10 text-center text-xs font-semibold">#</TableHead>
                {headerGroup.headers.map((header) => {
                  const isMasked = maskingMap.has(header.id)
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        isMasked ? 'text-xs font-semibold text-amber-700' : 'text-xs font-semibold'
                      }
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {virtualizer.getVirtualItems().length > 0 && (
              <tr style={{ height: virtualizer.getVirtualItems()[0].start }} />
            )}
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              const isSelected = selectedRowIds.has(virtualRow.index)
              return (
                <TableRow
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className={isSelected ? 'bg-blue-50' : undefined}
                  onClick={(e) => handleRowClick(virtualRow.index, e)}
                >
                  <TableCell className="text-muted-foreground w-10 text-center text-xs">
                    {virtualRow.index + 1}
                  </TableCell>
                  {row.getVisibleCells().map((cell) => {
                    const isMasked = maskingMap.has(cell.column.id)
                    return (
                      <TableCell
                        key={cell.id}
                        className={`cursor-pointer text-xs hover:bg-blue-100/50${isMasked ? 'bg-amber-50/30' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCellClick(cell.getValue())
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
            {virtualizer.getVirtualItems().length > 0 && (
              <tr
                style={{
                  height:
                    virtualizer.getTotalSize() - (virtualizer.getVirtualItems().at(-1)?.end ?? 0),
                }}
              />
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
