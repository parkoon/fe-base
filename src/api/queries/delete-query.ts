import { querypie } from '../querypie'

export const deleteQueryService = (id: number) => querypie.instance.delete(`/api/queries/${id}`)
