import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { usePostPermissionsRequestMutation } from '@/api/permissions/post-permissions-request'
import { paths } from '@/config/paths'
import { $dayjs } from '@/lib/dayjs'

type SelectedTable = { tableName: string; tableComment: string }

type RequestFormState = {
  step: number
  datasourceId: number | null
  datasourceName: string
  schema: string | null
  selectedTables: SelectedTable[]
  reason: string
  startDate: Date | undefined
  endDate: Date | undefined
}

type RequestFormActions = {
  setStep: (step: number) => void
  changeDatasource: (id: number, name: string) => void
  changeSchema: (schema: string) => void
  toggleTable: (table: SelectedTable) => void
  removeTable: (tableName: string) => void
  setReason: (reason: string) => void
  setStartDate: (date: Date | undefined) => void
  setEndDate: (date: Date | undefined) => void
  submit: () => void
}

type PermissionRequestContextValue = {
  state: RequestFormState
  actions: RequestFormActions
  canProceed: boolean
  isSubmitting: boolean
}

const PermissionRequestContext = createContext<PermissionRequestContextValue | null>(null)

export function usePermissionRequest() {
  const ctx = useContext(PermissionRequestContext)
  if (!ctx) throw new Error('usePermissionRequest must be used within PermissionRequestProvider')
  return ctx
}

export function PermissionRequestProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const mutation = usePostPermissionsRequestMutation()

  const [step, setStep] = useState(1)
  const [datasourceId, setDatasourceId] = useState<number | null>(null)
  const [datasourceName, setDatasourceName] = useState('')
  const [schema, setSchema] = useState<string | null>(null)
  const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([])
  const [reason, setReason] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const changeDatasource = (id: number, name: string) => {
    setDatasourceId(id)
    setDatasourceName(name)
    setSelectedTables([])
  }

  const changeSchema = (s: string) => {
    setSchema(s)
    setSelectedTables([])
  }

  const toggleTable = (table: SelectedTable) => {
    setSelectedTables((prev) => {
      const exists = prev.some((t) => t.tableName === table.tableName)
      if (exists) return prev.filter((t) => t.tableName !== table.tableName)
      return [...prev, table]
    })
  }

  const removeTable = (tableName: string) => {
    setSelectedTables((prev) => prev.filter((t) => t.tableName !== tableName))
  }

  const submit = () => {
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

  const canProceed = (() => {
    if (step === 1) return datasourceId !== null && schema !== null && schema.length > 0
    if (step === 2) return selectedTables.length > 0
    if (step === 3)
      return reason.trim().length > 0 && startDate !== undefined && endDate !== undefined
    return false
  })()

  const value: PermissionRequestContextValue = {
    state: {
      step,
      datasourceId,
      datasourceName,
      schema,
      selectedTables,
      reason,
      startDate,
      endDate,
    },
    actions: {
      setStep,
      changeDatasource,
      changeSchema,
      toggleTable,
      removeTable,
      setReason,
      setStartDate,
      setEndDate,
      submit,
    },
    canProceed,
    isSubmitting: mutation.isPending,
  }

  return (
    <PermissionRequestContext.Provider value={value}>{children}</PermissionRequestContext.Provider>
  )
}
