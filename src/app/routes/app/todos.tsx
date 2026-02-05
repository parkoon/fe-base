import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { getTodosQueryOptions, usePatchTodosIdMutation, usePostTodosAddMutation } from '@/api/todos'
import { AsyncBoundary } from '@/components/errors'
import { Button } from '@/components/ui/button'

function TodoList() {
  const { data } = useSuspenseQuery(getTodosQueryOptions())

  const patchMutation = usePatchTodosIdMutation()

  const handleToggle = (id: number, completed: boolean) => {
    patchMutation.mutate({ id, completed: !completed })
  }

  return (
    <ul className="space-y-2">
      {data?.todos?.slice(0, 10).map((todo) => (
        <li
          key={todo.id}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => handleToggle(todo.id!, todo.completed!)}
            className="h-5 w-5"
          />
          <span className={todo.completed ? 'text-gray-400 line-through' : ''}>{todo.todo}</span>
        </li>
      ))}
    </ul>
  )
}

function AddTodoForm() {
  const [text, setText] = useState('')
  const addMutation = usePostTodosAddMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    addMutation.mutate(
      {
        todo: text,
        completed: false,
        userId: 1,
      },
      {
        onSuccess: () => {
          setText('')
        },
      }
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="새 할일 입력..."
        className="flex-1 rounded-lg border px-3 py-2"
      />
      <Button
        type="submit"
        disabled={addMutation.isPending}
      >
        {addMutation.isPending ? '추가 중...' : '추가'}
      </Button>
    </form>
  )
}

export function Component() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Todo</h1>
      </div>

      <AddTodoForm />

      <AsyncBoundary>
        <TodoList />
      </AsyncBoundary>
    </div>
  )
}

export default Component
