import { create } from 'zustand'

type EditorConfigState = {
  selectedDataSourceId: number | null
  selectedSchema: string | null
  setDataSource: (id: number | null) => void
  setSchema: (schema: string | null) => void
}

export const useEditorConfigStore = create<EditorConfigState>()((set) => ({
  selectedDataSourceId: null,
  selectedSchema: null,
  setDataSource: (id) => set({ selectedDataSourceId: id, selectedSchema: null }),
  setSchema: (schema) => set({ selectedSchema: schema }),
}))
