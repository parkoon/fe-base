import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { usePostPermissionsRequestMutation } from '@/api/permissions/post-permissions-request'
import { paths } from '@/config/paths'
import { $dayjs } from '@/lib/dayjs'
import type { SchemaInfo } from '@/types/manual/query'

type SelectedTable = { tableName: string; tableComment: string }

type TablePermissionRequestState = {
  selectedSchema: SchemaInfo | null
  selectedTables: SelectedTable[]
  reason: string
  startDate: Date | undefined
  endDate: Date | undefined
  currentStep: 1 | 2
}

type TablePermissionRequestActions = {
  selectSchema: (schema: SchemaInfo) => void
  toggleTable: (table: SelectedTable) => void
  removeTable: (tableName: string) => void
  setReason: (reason: string) => void
  setStartDate: (date: Date | undefined) => void
  setEndDate: (date: Date | undefined) => void
  submit: () => void
  nextStep: () => void
  prevStep: () => void
}

type TablePermissionRequestContextValue = {
  state: TablePermissionRequestState
  actions: TablePermissionRequestActions
  canSubmit: boolean
  canProceedToNext: boolean
  isSubmitting: boolean
}

const TablePermissionRequestContext = createContext<TablePermissionRequestContextValue | null>(null)

export function useTablePermissionRequest() {
  const ctx = useContext(TablePermissionRequestContext)
  if (!ctx)
    throw new Error('useTablePermissionRequest must be used within TablePermissionRequestProvider')
  return ctx
}

export function TablePermissionRequestProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const mutation = usePostPermissionsRequestMutation()

  const [selectedSchema, setSelectedSchema] = useState<SchemaInfo | null>(null)
  const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([])
  const [reason, setReason] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)

  const selectSchema = (schema: SchemaInfo) => {
    setSelectedSchema(schema)
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
    if (!selectedSchema || !startDate || !endDate) return

    mutation.mutate(
      {
        schema: selectedSchema.name,
        tables: selectedTables,
        reason: reason.trim(),
        startDate: $dayjs(startDate).format('YYYY-MM-DD'),
        endDate: $dayjs(endDate).format('YYYY-MM-DD'),
      },
      {
        onSuccess: () => {
          toast.success('권한 신청이 완료되었습니다.')
          void navigate(paths.app.permissions.table.root.getHref())
        },
      }
    )
  }

  const canProceedToNext = selectedSchema !== null && selectedTables.length > 0

  const canSubmit =
    selectedSchema !== null &&
    selectedTables.length > 0 &&
    reason.trim().length > 0 &&
    startDate !== undefined &&
    endDate !== undefined

  const nextStep = () => {
    if (canProceedToNext) setCurrentStep(2)
  }

  const prevStep = () => {
    setCurrentStep(1)
  }

  const value: TablePermissionRequestContextValue = {
    state: { selectedSchema, selectedTables, reason, startDate, endDate, currentStep },
    actions: {
      selectSchema,
      toggleTable,
      removeTable,
      setReason,
      setStartDate,
      setEndDate,
      submit,
      nextStep,
      prevStep,
    },
    canSubmit,
    canProceedToNext,
    isSubmitting: mutation.isPending,
  }

  return (
    <TablePermissionRequestContext.Provider value={value}>
      {children}
    </TablePermissionRequestContext.Provider>
  )
}
