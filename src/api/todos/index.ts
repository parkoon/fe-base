// GET /todos
export type { GetTodosQueryConfig } from './get-todos'
export { getTodosQueryOptions, getTodosService } from './get-todos'

// POST /todos/add
export { postTodosAddService, usePostTodosAddMutation } from './post-todos-add'

// GET /todos/random
export type { GetTodosRandomQueryConfig } from './get-todos-random'
export { getTodosRandomQueryOptions, getTodosRandomService } from './get-todos-random'

// GET /todos/random/{length}
export type { GetTodosRandomLengthQueryConfig } from './get-todos-random-{length}'
export {
  getTodosRandomLengthQueryOptions,
  getTodosRandomLengthService,
} from './get-todos-random-{length}'

// GET /todos/{id}
export type { GetTodosIdQueryConfig } from './get-todos-{id}'
export { getTodosIdQueryOptions, getTodosIdService } from './get-todos-{id}'

// PUT /todos/{id}
export { putTodosIdService, usePutTodosIdMutation } from './put-todos-{id}'

// PATCH /todos/{id}
export { patchTodosIdService, usePatchTodosIdMutation } from './patch-todos-{id}'

// DELETE /todos/{id}
export { deleteTodosIdService, useDeleteTodosIdMutation } from './delete-todos-{id}'

// GET /todos/user/{userId}
export type { GetTodosUserUserIdQueryConfig } from './get-todos-user-{userId}'
export {
  getTodosUserUserIdQueryOptions,
  getTodosUserUserIdService,
} from './get-todos-user-{userId}'
