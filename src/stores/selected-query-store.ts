import { create } from 'zustand'

type SelectedQueryState = {
  selectedQueryId: number | null
  setSelectedQueryId: (id: number | null) => void
}

export const useSelectedQueryStore = create<SelectedQueryState>()((set) => ({
  selectedQueryId: null,
  setSelectedQueryId: (id) => set({ selectedQueryId: id }),
}))
