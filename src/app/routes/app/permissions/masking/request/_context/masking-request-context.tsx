/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
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
  isPreFilled: boolean
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
  const [searchParams, setSearchParams] = useSearchParams()
  const mutation = usePostMaskingRequestMutation()

  // URL params를 useState 초기화 함수로 한 번만 읽음 (mount 시점 스냅샷)
  const [isPreFilled] = useState(
    () => searchParams.get('schema') !== null && searchParams.get('table') !== null
  )
  const [selectedSchema, setSelectedSchemaState] = useState<string | null>(() =>
    searchParams.get('schema')
  )
  const [selectedTable, setSelectedTableState] = useState<string | null>(() =>
    searchParams.get('table')
  )
  const [tableComment, setTableComment] = useState('')
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    () => searchParams.get('columns')?.split(',').filter(Boolean) ?? []
  )
  const [reason, setReason] = useState('')

  const rawStep = Number(searchParams.get('step'))
  const currentStep: 1 | 2 | 3 = rawStep === 1 || rawStep === 2 || rawStep === 3 ? rawStep : 1

  // 초기 step이 없으면 1로 설정
  useEffect(() => {
    if (!searchParams.get('step')) {
      const next = new URLSearchParams(searchParams)
      next.set('step', '1')
      setSearchParams(next, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const goToStep = (step: 1 | 2 | 3) => {
    const next = new URLSearchParams(searchParams)
    next.set('step', String(step))
    setSearchParams(next, { replace: false })
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
    isPreFilled,
    canProceedToStep2,
    canProceedToStep3,
    canSubmit,
    isSubmitting: mutation.isPending,
  }

  return <MaskingRequestContext.Provider value={value}>{children}</MaskingRequestContext.Provider>
}
