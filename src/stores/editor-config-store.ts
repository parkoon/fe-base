import { create } from 'zustand'

type EditorConfigState = {
  selectedSchema: string | null
  setSchema: (schema: string | null) => void
}

export const useEditorConfigStore = create<EditorConfigState>()((set) => ({
  selectedSchema: null,
  setSchema: (schema) => set({ selectedSchema: schema }),
}))
