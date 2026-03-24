import { authHandlers } from './auth'
import { datasourceHandlers } from './datasources'
import { permissionHandlers } from './permissions'

export const handlers = [...authHandlers, ...datasourceHandlers, ...permissionHandlers]
