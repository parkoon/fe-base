import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { getPermissionsRequestsQueryOptions } from '@/api/permissions/get-permissions-requests'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { usePermissionFilter } from '../_hooks/use-permission-filter'
import { MyPermissionTableEmpty } from './my-permission-table-empty'
import { MyPermissionTableRow } from './my-permission-table-row'
import { matchesFilter } from './types'

export function MyPermissionTable() {
  const { currentFilter } = usePermissionFilter()
  const { data } = useSuspenseQuery(getPermissionsRequestsQueryOptions())

  const filteredItems = useMemo(
    () => data.items.filter((item) => matchesFilter(item.status, currentFilter)),
    [data.items, currentFilter]
  )

  return (
    <>
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
            {filteredItems.length === 0 ? (
              <MyPermissionTableEmpty />
            ) : (
              filteredItems.map((item) => (
                <MyPermissionTableRow
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
