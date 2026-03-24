import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  DatabaseIcon,
  LayersIcon,
  Loader2Icon,
  SendIcon,
  TableIcon,
  XIcon,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { usePostPermissionsRequestMutation } from '@/api/permissions/post-permissions-request'
import { DataSourceSchemaPicker } from '@/components/datasource-schema-picker'
import { DateRangePicker } from '@/components/date-range-picker'
import { TableSearchCombobox } from '@/components/table-search-combobox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { paths } from '@/config/paths'
import { $dayjs } from '@/lib/dayjs'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'DataSource / Schema', icon: DatabaseIcon },
  { id: 2, label: '테이블 선택', icon: TableIcon },
  { id: 3, label: '신청 정보', icon: SendIcon },
] as const

function PermissionRequestPage() {
  const navigate = useNavigate()
  const mutation = usePostPermissionsRequestMutation()

  const [step, setStep] = useState(1)
  const [datasourceId, setDatasourceId] = useState<number | null>(null)
  const [datasourceName, setDatasourceName] = useState('')
  const [schema, setSchema] = useState<string | null>(null)
  const [selectedTables, setSelectedTables] = useState<
    { tableName: string; tableComment: string }[]
  >([])
  const [reason, setReason] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const handleDatasourceChange = useCallback((id: number, name: string) => {
    setDatasourceId(id)
    setDatasourceName(name)
    setSelectedTables([])
  }, [])

  const handleSchemaChange = useCallback((s: string) => {
    setSchema(s)
    setSelectedTables([])
  }, [])

  const handleToggleTable = useCallback((table: { tableName: string; tableComment: string }) => {
    setSelectedTables((prev) => {
      const exists = prev.some((t) => t.tableName === table.tableName)
      if (exists) return prev.filter((t) => t.tableName !== table.tableName)
      return [...prev, table]
    })
  }, [])

  const handleRemoveTable = useCallback((tableName: string) => {
    setSelectedTables((prev) => prev.filter((t) => t.tableName !== tableName))
  }, [])

  const canProceed = useMemo(() => {
    if (step === 1) return datasourceId !== null && schema !== null && schema.length > 0
    if (step === 2) return selectedTables.length > 0
    if (step === 3)
      return reason.trim().length > 0 && startDate !== undefined && endDate !== undefined
    return false
  }, [step, datasourceId, schema, selectedTables, reason, startDate, endDate])

  const handleSubmit = () => {
    if (!datasourceId || !schema || !startDate || !endDate) return

    mutation.mutate(
      {
        datasourceId,
        schema,
        tables: selectedTables,
        reason: reason.trim(),
        startDate: $dayjs(startDate).format('YYYY-MM-DD'),
        endDate: $dayjs(endDate).format('YYYY-MM-DD'),
      },
      {
        onSuccess: () => {
          toast.success('권한 신청이 완료되었습니다.')
          void navigate(paths.app.permissions.my.getHref())
        },
      }
    )
  }

  return (
    <div className="mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">권한 신청</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          DataSource와 Schema를 선택하고, 접근할 테이블의 권한을 신청합니다.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const isActive = step === s.id
          const isCompleted = step > s.id
          const StepIcon = s.icon

          return (
            <div
              key={s.id}
              className="flex items-center"
            >
              <button
                type="button"
                onClick={() => {
                  if (isCompleted) setStep(s.id)
                }}
                disabled={!isCompleted}
                className={cn(
                  'flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors',
                  isActive && 'bg-primary-50 text-primary-700',
                  isCompleted && 'text-primary-600 hover:bg-primary-50/60 cursor-pointer',
                  !isActive && !isCompleted && 'text-muted-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    isActive && 'bg-primary-500 text-white',
                    isCompleted && 'bg-primary-100 text-primary-700',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <CheckIcon className="size-3.5" /> : s.id}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <StepIcon className="size-3.5" />
                  {s.label}
                </div>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-1 h-px w-6 shrink-0',
                    isCompleted ? 'bg-primary-300' : 'bg-border'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <Card>
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>DataSource / Schema 선택</CardTitle>
              <CardDescription>접근할 데이터베이스와 스키마를 선택하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataSourceSchemaPicker
                datasourceId={datasourceId}
                schema={schema}
                onDatasourceChange={handleDatasourceChange}
                onSchemaChange={handleSchemaChange}
              />
              {datasourceId && schema && (
                <div className="bg-muted/50 mt-4 flex items-center gap-2 rounded-lg px-3 py-2">
                  <DatabaseIcon className="text-primary-500 size-4" />
                  <span className="text-sm">
                    <span className="font-medium">{datasourceName}</span>
                    <span className="text-muted-foreground mx-1.5">/</span>
                    <span className="font-medium">{schema}</span>
                  </span>
                </div>
              )}
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>테이블 선택</CardTitle>
                <Badge
                  variant="secondary"
                  className="text-xs"
                >
                  <DatabaseIcon className="size-3" />
                  {datasourceName}
                  <span className="text-muted-foreground mx-0.5">/</span>
                  {schema}
                </Badge>
              </div>
              <CardDescription>권한을 신청할 테이블을 검색하고 선택하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <TableSearchCombobox
                datasourceId={datasourceId!}
                schema={schema!}
                selectedTables={selectedTables}
                onToggleTable={handleToggleTable}
              />
            </CardContent>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>신청 정보 입력</CardTitle>
              <CardDescription>신청 사유와 기간을 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* 선택 요약 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">선택된 테이블</label>
                <div className="bg-muted/50 flex items-center gap-2 rounded-lg px-3 py-2">
                  <DatabaseIcon className="text-muted-foreground size-3.5" />
                  <span className="text-sm font-medium">{datasourceName}</span>
                  <LayersIcon className="text-muted-foreground size-3.5" />
                  <span className="text-sm font-medium">{schema}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTables.map((table) => (
                    <Badge
                      key={table.tableName}
                      variant="outline"
                      className="gap-1 pr-1 pl-2 font-mono text-xs"
                    >
                      {table.tableName}
                      {table.tableComment && (
                        <span className="text-muted-foreground font-sans">
                          {table.tableComment}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveTable(table.tableName)}
                        className="hover:bg-muted ml-0.5 rounded-sm p-0.5"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 사유 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  신청 사유 <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="권한이 필요한 업무 목적과 사유를 입력하세요."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* 기간 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  사용 기간 <span className="text-destructive">*</span>
                </label>
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartChange={setStartDate}
                  onEndChange={setEndDate}
                />
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
        >
          <ArrowLeftIcon className="size-4" />
          이전
        </Button>

        {step < 3 ? (
          <Button
            size="lg"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed}
          >
            다음
            <ArrowRightIcon className="size-4" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!canProceed || mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SendIcon className="size-4" />
            )}
            권한 신청하기
          </Button>
        )}
      </div>
    </div>
  )
}

export default PermissionRequestPage
