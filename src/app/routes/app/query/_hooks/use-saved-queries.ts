import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createQueryService } from '@/api/queries/create-query'
import { deleteQueryService } from '@/api/queries/delete-query'
import { getQueriesQueryOptions } from '@/api/queries/get-queries'
import { useQueryStore } from '@/stores/query-store'
import type { SavedQuery } from '@/types/manual/saved-query'

export function useSavedQueries() {
  const queryClient = useQueryClient()
  const { sqlValue, loadedQueryId, setLoadedQuery, clearLoadedQuery } = useQueryStore()

  const { data: queries = [], isLoading } = useQuery(getQueriesQueryOptions())

  const { mutate: deleteQuery } = useMutation({
    mutationFn: deleteQueryService,
    onSuccess: (_, deletedId) => {
      if (loadedQueryId === deletedId) {
        clearLoadedQuery()
      }
      void queryClient.invalidateQueries({ queryKey: ['getQueries'] })
    },
  })

  const { mutate: restoreQuery } = useMutation({
    mutationFn: createQueryService,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['getQueries'] })
    },
  })

  const { mutate: saveQuery, isPending: isSaving } = useMutation({
    mutationFn: createQueryService,
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: ['getQueries'] })
      toast(`"${saved.name}" 쿼리가 저장되었습니다.`)
    },
  })

  const handleLoad = (query: SavedQuery) => {
    setLoadedQuery(query.id, query.sql)
  }

  const handleDelete = (query: SavedQuery) => {
    deleteQuery(query.id, {
      onSuccess: () => {
        toast(`"${query.name}" 쿼리가 삭제되었습니다.`, {
          duration: 3000,
          action: {
            label: 'Undo',
            onClick: () => restoreQuery({ name: query.name, sql: query.sql }),
          },
        })
      },
    })
  }

  const handleSave = (name: string, memo?: string, onSuccess?: () => void) => {
    saveQuery({ name, sql: sqlValue, memo }, { onSuccess })
  }

  return {
    queries,
    isLoading,
    loadedQueryId,
    handleLoad,
    handleDelete,
    handleSave,
    isSaving,
  }
}
