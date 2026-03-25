import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DataSource = {
  id: string
  name: string
  schemas: string[]
}

type QueryStoreState = {
  selectedDataSourceId: string | null
  selectedSchema: string | null
  sqlValue: string
  limitRows: number

  setDataSource: (id: string | null) => void
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

// Mock data — 실제 API 연동 시 교체
export const MOCK_DATA_SOURCES: DataSource[] = [
  {
    id: 'ds-1',
    name: 'Production DB',
    schemas: ['public', 'analytics', 'auth'],
  },
  {
    id: 'ds-2',
    name: 'Staging DB',
    schemas: ['public', 'test'],
  },
  {
    id: 'ds-3',
    name: 'Data Warehouse',
    schemas: ['raw', 'transformed', 'reporting'],
  },
]

export const LIMIT_OPTIONS = [100, 500, 1000, 0] as const
