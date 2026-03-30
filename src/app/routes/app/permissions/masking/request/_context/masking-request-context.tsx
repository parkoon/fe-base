/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { usePostMaskingRequestMutation } from '@/api/permissions/masking/post-masking-request'
import { paths } from '@/config/paths'

type MaskingRequestState = {
  selectedSchema: string | null
  selectedTable: string | null
  tableComment: string
  selectedColumns: string[]
  reason: string
}

type MaskingRequestActions = {
  setSchema: (schema: string) => void
  setTable: (tableName: string, tableComment?: string) => void
  toggleColumn: (columnName: string) => void
  setReason: (reason: string) => void
  goToStep: (step: 1 | 2 | 3) => void
  submit: () => void
}

type MaskingRequestContextValue = {
  state: MaskingRequestState
  actions: MaskingRequestActions
  currentStep: 1 | 2 | 3
  canProceedToStep2: boolean
  canProceedToStep3: boolean
  canSubmit: boolean
  isSubmitting: boolean
}

const MaskingRequestContext = createContext<MaskingRequestContextValue | null>(null)

export function useMaskingRequest() {
  const ctx = useContext(MaskingRequestContext)
  if (!ctx) throw new Error('useMaskingRequest must be used within MaskingRequestProvider')
  return ctx
}

export function MaskingRequestProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const mutation = usePostMaskingRequestMutation()

  const [selectedSchema, setSelectedSchemaState] = useState<string | null>(null)
  const [selectedTable, setSelectedTableState] = useState<string | null>(null)
  const [tableComment, setTableComment] = useState('')
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [reason, setReason] = useState('')
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

  const goToStep = (step: 1 | 2 | 3) => {
    setCurrentStep(step)
  }

  const setSchema = (schema: string) => {
    setSelectedSchemaState(schema)
    setSelectedTableState(null)
    setTableComment('')
    setSelectedColumns([])
  }

  const setTable = (tableName: string, comment = '') => {
    setSelectedTableState(tableName)
    setTableComment(comment)
    setSelectedColumns([])
  }

  const toggleColumn = (columnName: string) => {
    setSelectedColumns((prev) => {
      const exists = prev.includes(columnName)
      if (exists) return prev.filter((c) => c !== columnName)
      return [...prev, columnName]
    })
  }

  const submit = () => {
    if (!selectedSchema || !selectedTable || selectedColumns.length === 0) return

    mutation.mutate(
      {
        schema: selectedSchema,
        tableName: selectedTable,
        columns: selectedColumns,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          toast.success('마스킹 권한 신청이 완료되었습니다.')
          void navigate(paths.app.permissions.masking.root.getHref())
        },
      }
    )
  }

  const canProceedToStep2 = selectedSchema !== null && selectedTable !== null
  const canProceedToStep3 = selectedColumns.length > 0
  const canSubmit = canProceedToStep2 && canProceedToStep3 && reason.trim().length > 0

  const value: MaskingRequestContextValue = {
    state: { selectedSchema, selectedTable, tableComment, selectedColumns, reason },
    actions: { setSchema, setTable, toggleColumn, setReason, goToStep, submit },
    currentStep,
    canProceedToStep2,
    canProceedToStep3,
    canSubmit,
    isSubmitting: mutation.isPending,
  }

  return <MaskingRequestContext.Provider value={value}>{children}</MaskingRequestContext.Provider>
}
