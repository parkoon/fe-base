import { authHandlers } from './auth'
import { datasourceHandlers } from './datasources'
import { permissionHandlers } from './permissions'
import { queryHandlers } from './queries'

export const handlers = [
  ...authHandlers,
  ...datasourceHandlers,
  ...permissionHandlers,
  ...queryHandlers,
]
