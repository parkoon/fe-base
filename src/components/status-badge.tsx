import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ApprovalStatus } from '@/types/manual/permissions'
import { APPROVAL_STATUS_MAP } from '@/types/manual/permissions'

type StatusBadgeProps = {
  status: ApprovalStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = APPROVAL_STATUS_MAP[status]

  return (
    <Badge
      variant={config.variant}
      className={cn('text-xs font-medium', config.color, className)}
    >
      {config.label}
    </Badge>
  )
}
