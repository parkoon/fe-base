import { InboxIcon, PlusIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { paths } from '@/config/paths'

export function MyTableEmpty() {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={7}
        className="h-48"
      >
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
          <InboxIcon className="size-10 stroke-1" />
          <p className="text-sm font-medium">신청 내역이 없습니다</p>
          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <Link to={paths.app.permissions.request.getHref()}>
              <PlusIcon className="size-3.5" />
              권한 신청하기
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
