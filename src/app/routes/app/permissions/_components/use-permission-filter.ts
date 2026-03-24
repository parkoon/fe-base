import { useSearchParams } from 'react-router'

import type { StatusFilter } from './types'

export function usePermissionFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentFilter = (searchParams.get('status') ?? 'ALL') as StatusFilter

  const setFilter = (value: StatusFilter) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'ALL') {
      next.delete('status')
    } else {
      next.set('status', value)
    }
    setSearchParams(next)
  }

  return { currentFilter, setFilter }
}
