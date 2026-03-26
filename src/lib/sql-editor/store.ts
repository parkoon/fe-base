import { create } from 'zustand'

type SQLEditorState = {
  SQL: string
  schema: Record<string, string[]>
  setSQL: (sql: string) => void
  setSchema: (schema: Record<string, string[]>) => void
  clearSQL: () => void
}

const useSQLEditorStore = create<SQLEditorState>()((set) => ({
  SQL: '',
  schema: {},
  setSQL: (sql) => set({ SQL: sql }),
  setSchema: (schema) => set({ schema }),
  clearSQL: () => set({ SQL: '' }),
}))

export const useSQLEditorValue = () => {
  const SQL = useSQLEditorStore((s) => s.SQL)
  const schema = useSQLEditorStore((s) => s.schema)

  return { SQL, schema }
}

export const useSQLEditorAction = () => {
  const setSQL = useSQLEditorStore((s) => s.setSQL)
  const setSchema = useSQLEditorStore((s) => s.setSchema)
  const clearSQL = useSQLEditorStore((s) => s.clearSQL)

  return { setSQL, setSchema, clearSQL }
}
