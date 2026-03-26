import { create } from 'zustand'

export const LIMIT_OPTIONS = [100, 500, 1000, 0] as const

type QueryTableState = {
  limitRows: number
  setLimitRows: (limit: number) => void
}

export const useQueryTableStore = create<QueryTableState>()((set) => ({
  limitRows: 100,
  setLimitRows: (limit) => set({ limitRows: limit }),
}))
