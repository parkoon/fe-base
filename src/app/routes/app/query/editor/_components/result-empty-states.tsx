import { AlertCircleIcon, CheckCircle2Icon, PlayIcon, TerminalIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export function ResultInitial() {
  return (
    <div className="flex flex-1 items-center justify-center border-t">
      <div className="text-muted-foreground text-center">
        <TerminalIcon className="mx-auto mb-3 size-8 opacity-40" />
        <p className="text-sm font-medium">쿼리를 실행하면 결과가 여기에 표시됩니다</p>
        <p className="mt-2 text-xs">
          <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[11px]">Ctrl</kbd>
          {' + '}
          <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-[11px]">Enter</kbd>
          <span className="ml-1.5">로 실행</span>
        </p>
      </div>
    </div>
  )
}

export function ResultLoading() {
  return (
    <div className="flex flex-1 items-center justify-center border-t">
      <div className="text-muted-foreground text-center">
        <Spinner className="mx-auto mb-3" />
        <p className="text-sm font-medium">쿼리 실행 중...</p>
      </div>
    </div>
  )
}

export function ResultError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center border-t">
      <div className="text-center">
        <AlertCircleIcon className="mx-auto mb-3 size-8 text-red-400" />
        <p className="text-sm font-medium text-red-600">쿼리 실행 오류</p>
        <pre className="bg-muted mx-auto mt-2 max-w-md rounded-md px-3 py-2 text-left text-xs text-red-600">
          {message}
        </pre>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={onRetry}
        >
          <PlayIcon className="size-3 fill-current" />
          다시 실행
        </Button>
      </div>
    </div>
  )
}

export function ResultEmpty({ executionTimeMs }: { executionTimeMs: number }) {
  return (
    <div className="flex flex-1 items-center justify-center border-t">
      <div className="text-muted-foreground text-center">
        <CheckCircle2Icon className="mx-auto mb-3 size-8 text-green-400" />
        <p className="text-sm font-medium">쿼리가 성공적으로 실행되었지만 결과가 없습니다</p>
        <p className="mt-1 text-xs">{executionTimeMs}ms</p>
      </div>
    </div>
  )
}
