import { ChevronRightIcon, DatabaseIcon } from 'lucide-react'
import { Link } from 'react-router'

import { MyPermissionTableStatusBadge } from '@/app/routes/app/permissions/_components/my-permission-table-status-badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { paths } from '@/config/paths'
import { $dayjs } from '@/lib/dayjs'
import { cn } from '@/lib/utils'
import type { PermissionRequest } from '@/types/manual/permissions'

export function MyPermissionTableRow({ item }: { item: PermissionRequest }) {
  return (
    <TableRow className="group">
      <TableCell className="text-muted-foreground pl-4 font-mono text-xs">{item.id}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <DatabaseIcon className="text-muted-foreground size-3.5 shrink-0" />
          <span className="text-sm">{item.datasourceName}</span>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="text-muted-foreground text-sm">{item.schema}</span>
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
        <span
          className={cn('text-muted-foreground block max-w-[200px] truncate text-sm')}
          title={item.reason}
        >
          {item.reason}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm tabular-nums">
        {$dayjs(item.createdAt).format('YY.MM.DD')}
      </TableCell>
      <TableCell>
        <MyPermissionTableStatusBadge status={item.status} />
      </TableCell>
      <TableCell className="pr-4">
        <Link
          to={paths.app.permissions.detail.getHref(item.id)}
          className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100"
        >
          <ChevronRightIcon className="size-4" />
        </Link>
      </TableCell>
    </TableRow>
  )
}
