import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function SaveQueryDialog({
  open,
  onOpenChange,
  onSave,
  isSaving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string, memo?: string) => void
  isSaving: boolean
}) {
  const [name, setName] = useState('')
  const [memo, setMemo] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setName('')
    setMemo('')
    onSave(name.trim(), memo.trim() || undefined)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>쿼리 저장</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="query-name">제목</Label>
            <Input
              id="query-name"
              placeholder="쿼리 제목을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="query-memo">
              메모 <span className="text-muted-foreground font-normal">(선택)</span>
            </Label>
            <Textarea
              id="query-memo"
              placeholder="이 쿼리에 대한 메모를 남겨보세요"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
              >
                취소
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!name.trim() || isSaving}
            >
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
