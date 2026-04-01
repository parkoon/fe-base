import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useSQLEditor } from '../use-sql-editor'

describe('useSQLEditor', () => {
  it('기본값은 빈 문자열과 빈 스키마', () => {
    const { result } = renderHook(() => useSQLEditor())

    expect(result.current.value).toBe('')
    expect(result.current.schema).toEqual({})
  })

  it('initialValue를 지정하면 해당 값으로 시작', () => {
    const { result } = renderHook(() => useSQLEditor({ initialValue: 'SELECT 1' }))

    expect(result.current.value).toBe('SELECT 1')
  })

  it('schema를 지정하면 해당 스키마로 시작', () => {
    const schema = { users: ['id', 'name'] }
    const { result } = renderHook(() => useSQLEditor({ schema }))

    expect(result.current.schema).toEqual(schema)
  })

  it('setValue로 값 변경', () => {
    const { result } = renderHook(() => useSQLEditor())

    act(() => {
      result.current.setValue('SELECT * FROM users')
    })

    expect(result.current.value).toBe('SELECT * FROM users')
  })

  it('clear로 값 초기화', () => {
    const { result } = renderHook(() => useSQLEditor({ initialValue: 'SELECT 1' }))

    act(() => {
      result.current.clear()
    })

    expect(result.current.value).toBe('')
  })

  it('setSchema로 스키마 변경', () => {
    const { result } = renderHook(() => useSQLEditor())
    const newSchema = { orders: ['id', 'total'] }

    act(() => {
      result.current.setSchema(newSchema)
    })

    expect(result.current.schema).toEqual(newSchema)
  })

  it('editorProps가 value, onChange, schema를 포함', () => {
    const schema = { users: ['id'] }
    const { result } = renderHook(() => useSQLEditor({ initialValue: 'test', schema }))

    expect(result.current.editorProps.value).toBe('test')
    expect(result.current.editorProps.schema).toEqual(schema)
    expect(typeof result.current.editorProps.onChange).toBe('function')
  })

  it('editorProps.onChange로 값이 변경된다', () => {
    const { result } = renderHook(() => useSQLEditor())

    act(() => {
      result.current.editorProps.onChange('new value')
    })

    expect(result.current.value).toBe('new value')
  })
})
