import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const COLUMN_WIDTHS = [
  'w-[130px] pl-4',
  'w-[200px]',
  '',
  'w-[220px]',
  'w-[100px]',
  'w-[90px]',
  'w-[50px] pr-4',
]

export function MyPermissionTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="ring-foreground/5 rounded-xl border ring-1">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[130px] pl-4">신청번호</TableHead>
            <TableHead className="w-[200px]">DataSource / Schema</TableHead>
            <TableHead>테이블</TableHead>
            <TableHead className="w-[220px]">사유</TableHead>
            <TableHead className="w-[100px]">신청일</TableHead>
            <TableHead className="w-[90px]">상태</TableHead>
            <TableHead className="w-[50px] pr-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              {COLUMN_WIDTHS.map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
