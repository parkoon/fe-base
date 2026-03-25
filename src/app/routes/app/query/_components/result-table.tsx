import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { QueryResult } from '../_hooks/use-query-execution'

const columnHelper = createColumnHelper<Record<string, unknown>>()

export function ResultTable({ result }: { result: QueryResult }) {
  const columns = useMemo(
    () =>
      result.columns.map((col) =>
        columnHelper.accessor((row) => row[col], {
          id: col,
          header: col,
          cell: (info) => {
            const value = info.getValue<string | number | boolean | null>()
            if (value === null) return <span className="text-muted-foreground italic">NULL</span>
            return String(value)
          },
        })
      ),
    [result.columns]
  )

  const table = useReactTable({
    data: result.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="h-full overflow-auto">
      <Table>
        <TableHeader className="bg-neutral-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-xs font-semibold"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="text-xs"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
