import { PlusIcon } from 'lucide-react'
import { Link } from 'react-router'

import { AsyncBoundary } from '@/components/errors/query-error-boundary'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'

import { MaskingFilterTabs, MaskingFilterTabsSkeleton } from './_components/masking-filter-tabs'
import { MaskingTable, MaskingTableSkeleton } from './_components/masking-table'

function MaskingPermissionsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">마스킹 권한 신청 목록</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            마스킹 컬럼 접근 권한 신청 내역을 확인합니다.
          </p>
        </div>
        <Button
          asChild
          size="lg"
        >
          <Link to={paths.app.permissions.masking.request.getHref()}>
            <PlusIcon className="size-4" />
            신청하기
          </Link>
        </Button>
      </div>

      <AsyncBoundary loadingFallback={<MaskingFilterTabsSkeleton />}>
        <MaskingFilterTabs />
      </AsyncBoundary>

      <AsyncBoundary loadingFallback={<MaskingTableSkeleton />}>
        <MaskingTable />
      </AsyncBoundary>
    </div>
  )
}

export default MaskingPermissionsPage
