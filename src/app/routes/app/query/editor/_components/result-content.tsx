import type { QueryResult } from '../_hooks/use-query-execution'
import { ResultEmpty, ResultError, ResultInitial, ResultLoading } from './result-empty-states'
import { ResultTable } from './result-table'

type Props = {
  isRunning: boolean
  error: string | null
  result: QueryResult | null
  onRetry: () => void
}

export function ResultContent({ isRunning, error, result, onRetry }: Props) {
  if (isRunning) return <ResultLoading />
  if (error)
    return (
      <ResultError
        message={error}
        onRetry={onRetry}
      />
    )
  if (result && result.rowCount > 0)
    return (
      <div className="flex-1 overflow-auto border-t">
        <ResultTable result={result} />
      </div>
    )
  if (result) return <ResultEmpty executionTimeMs={result.executionTimeMs} />
  return <ResultInitial />
}
