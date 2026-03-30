import { HashIcon, LayersIcon, LockIcon, TableIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { usePostMaskingRequestMutation } from '@/api/permissions/masking/post-masking-request'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schema: string
  tableName: string
  columnName: string
}

export function MaskingRequestDialog({ open, onOpenChange, schema, tableName, columnName }: Props) {
  const [reason, setReason] = useState('')
  const mutation = usePostMaskingRequestMutation()

  const handleSubmit = () => {
    mutation.mutate(
      { schema, tableName, columns: [columnName], reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success('마스킹 권한 신청이 완료되었습니다.')
          setReason('')
          onOpenChange(false)
        },
      }
    )
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setReason('')
    onOpenChange(next)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockIcon className="size-4" />
            마스킹 권한 신청
          </DialogTitle>
          <DialogDescription>아래 컬럼에 대한 마스킹 해제 권한을 신청합니다.</DialogDescription>
        </DialogHeader>

        <div className="bg-muted/40 space-y-3 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <LayersIcon className="text-muted-foreground size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs">Schema</p>
              <p className="truncate font-mono text-sm font-medium">{schema}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <TableIcon className="text-muted-foreground size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs">테이블</p>
              <p className="truncate font-mono text-sm font-medium">{tableName}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <HashIcon className="text-muted-foreground size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs">컬럼</p>
              <p className="truncate font-mono text-sm font-medium">{columnName}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="masking-reason">신청 사유</Label>
          <Textarea
            id="masking-reason"
            placeholder="마스킹 해제가 필요한 이유를 입력해주세요."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={mutation.isPending}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={reason.trim().length === 0 || mutation.isPending}
          >
            {mutation.isPending ? '신청 중...' : '신청하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
