import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type QueryStoreState = {
  selectedDataSourceId: number | null
  selectedSchema: string | null
  sqlValue: string
  limitRows: number

  setDataSource: (id: number | null) => void
  setSchema: (schema: string | null) => void
  setSqlValue: (value: string) => void
  setLimitRows: (limit: number) => void
}

export const useQueryStore = create<QueryStoreState>()(
  persist(
    (set) => ({
      selectedDataSourceId: null,
      selectedSchema: null,
      sqlValue: '',
      limitRows: 100,

      setDataSource: (id) => set({ selectedDataSourceId: id, selectedSchema: null }),
      setSchema: (schema) => set({ selectedSchema: schema }),
      setSqlValue: (value) => set({ sqlValue: value }),
      setLimitRows: (limit) => set({ limitRows: limit }),
    }),
    {
      name: 'query-editor-storage',
    }
  )
)

export const LIMIT_OPTIONS = [100, 500, 1000, 0] as const
