import { PlusIcon } from 'lucide-react'
import { Link } from 'react-router'

import { AsyncBoundary } from '@/components/errors/query-error-boundary'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'

import { FilterTabsSkeleton, PermissionFilterTabs } from './_components/permission-filter-tabs'
import { PermissionTable } from './_components/permission-table'
import { PermissionTableSkeleton } from './_components/permission-table-skeleton'

function MyPermissionsPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">내 신청 목록</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            권한 신청 내역과 결재 진행 상태를 확인합니다.
          </p>
        </div>
        <Button
          asChild
          size="lg"
        >
          <Link to={paths.app.permissions.request.getHref()}>
            <PlusIcon className="size-4" />
            권한 신청
          </Link>
        </Button>
      </div>

      {/* Filter Tabs */}
      <AsyncBoundary loadingFallback={<FilterTabsSkeleton />}>
        <PermissionFilterTabs />
      </AsyncBoundary>

      {/* Table */}
      <AsyncBoundary loadingFallback={<PermissionTableSkeleton />}>
        <PermissionTable />
      </AsyncBoundary>
    </div>
  )
}

export default MyPermissionsPage
