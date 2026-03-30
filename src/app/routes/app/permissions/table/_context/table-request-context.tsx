import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { usePostPermissionsRequestMutation } from '@/api/permissions/post-permissions-request'
import { paths } from '@/config/paths'
import { $dayjs } from '@/lib/dayjs'
import type { SchemaWithDatasource } from '@/types/manual/datasource'

type SelectedTable = { tableName: string; tableComment: string }

type TablePermissionRequestState = {
  selectedSchema: SchemaWithDatasource | null
  selectedTables: SelectedTable[]
  reason: string
  startDate: Date | undefined
  endDate: Date | undefined
}

type TablePermissionRequestActions = {
  selectSchema: (schema: SchemaWithDatasource) => void
  toggleTable: (table: SelectedTable) => void
  removeTable: (tableName: string) => void
  setReason: (reason: string) => void
  setStartDate: (date: Date | undefined) => void
  setEndDate: (date: Date | undefined) => void
  submit: () => void
}

type TablePermissionRequestContextValue = {
  state: TablePermissionRequestState
  actions: TablePermissionRequestActions
  canSubmit: boolean
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

  const [selectedSchema, setSelectedSchema] = useState<SchemaWithDatasource | null>(null)
  const [selectedTables, setSelectedTables] = useState<SelectedTable[]>([])
  const [reason, setReason] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const selectSchema = (schema: SchemaWithDatasource) => {
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
        datasourceId: selectedSchema.datasourceId,
        schema: selectedSchema.schemaName,
        tables: selectedTables,
        reason: reason.trim(),
        startDate: $dayjs(startDate).format('YYYY-MM-DD'),
        endDate: $dayjs(endDate).format('YYYY-MM-DD'),
      },
      {
        onSuccess: () => {
          toast.success('권한 신청이 완료되었습니다.')
          void navigate(paths.app.permissions.tables.getHref())
        },
      }
    )
  }

  const canSubmit =
    selectedSchema !== null &&
    selectedTables.length > 0 &&
    reason.trim().length > 0 &&
    startDate !== undefined &&
    endDate !== undefined

  const value: TablePermissionRequestContextValue = {
    state: { selectedSchema, selectedTables, reason, startDate, endDate },
    actions: {
      selectSchema,
      toggleTable,
      removeTable,
      setReason,
      setStartDate,
      setEndDate,
      submit,
    },
    canSubmit,
    isSubmitting: mutation.isPending,
  }

  return (
    <TablePermissionRequestContext.Provider value={value}>
      {children}
    </TablePermissionRequestContext.Provider>
  )
}
