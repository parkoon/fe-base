export type SavedQuery = {
  id: number
  name: string
  sql: string
  memo?: string
  createdAt: string
}

export type CreateQueryBody = {
  name: string
  sql: string
  memo?: string
}
