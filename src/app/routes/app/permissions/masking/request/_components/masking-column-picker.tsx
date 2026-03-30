import { useSuspenseQuery } from '@tanstack/react-query'
import { CheckIcon, ShieldOffIcon } from 'lucide-react'

import { getMaskingColumnsQueryOptions } from '@/api/permissions/masking/get-masking-columns'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MaskingColumn } from '@/types/manual/masking'

import { useMaskingRequest } from '../_context/masking-request-context'

export function MaskingColumnPicker() {
  const { state, actions } = useMaskingRequest()
  const columnsQuery = useSuspenseQuery(
    getMaskingColumnsQueryOptions(state.selectedSchema ?? '', state.selectedTable ?? '')
  )

  const columns: MaskingColumn[] = columnsQuery.data

  if (columns.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-lg border py-10 text-center text-sm">
        <ShieldOffIcon className="size-8 opacity-30" />
        <p>이 테이블에는 마스킹된 컬럼이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <ul className="max-h-[360px] overflow-y-auto">
        {columns.map((col) => {
          const isDisabled = col.maskingStatus === 'PENDING' || col.maskingStatus === 'APPROVED'
          const isSelected = state.selectedColumns.includes(col.columnName)

          return (
            <li key={col.columnName}>
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && actions.toggleColumn(col.columnName)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2',
                  isDisabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-accent'
                )}
              >
                <div
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-sm border',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30'
                  )}
                >
                  {isSelected && <CheckIcon className="size-3" />}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="font-mono text-sm">{col.columnName}</span>
                  {col.columnComment && (
                    <span className="text-muted-foreground ml-2 text-xs">{col.columnComment}</span>
                  )}
                </div>
                {col.maskingStatus === 'PENDING' && (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-yellow-200 bg-yellow-50 text-xs text-yellow-600"
                  >
                    신청 중
                  </Badge>
                )}
                {col.maskingStatus === 'APPROVED' && (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-green-200 bg-green-50 text-xs text-green-600"
                  >
                    승인됨
                  </Badge>
                )}
              </button>
            </li>
          )
        })}
      </ul>
      {state.selectedColumns.length > 0 && (
        <div className="bg-muted/30 border-t px-3 py-2">
          <p className="text-muted-foreground text-xs">
            {state.selectedColumns.length}개 컬럼 선택됨
          </p>
        </div>
      )}
    </div>
  )
}
