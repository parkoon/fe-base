import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

const noop = () => {
  /* noop */
}

// Monaco Editor를 mock — JSDOM에서는 canvas/webworker를 지원하지 않음
vi.mock('@monaco-editor/react', () => ({
  default: (props: {
    value: string
    onChange?: (value: string | undefined) => void
    language?: string
    height?: string | number
    options?: Record<string, unknown>
  }) =>
    React.createElement('div', { 'data-testid': 'monaco-editor' }, [
      React.createElement('textarea', {
        key: 'textarea',
        'data-testid': 'monaco-textarea',
        value: props.value,
        readOnly: props.options?.readOnly as boolean,
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => props.onChange?.(e.target.value),
      }),
      React.createElement(
        'span',
        { key: 'language', 'data-testid': 'monaco-language' },
        props.language
      ),
    ]),
}))

// SQLEditor를 mock 이후에 import
const { SQLEditor } = await import('../sql-editor')

describe('SQLEditor', () => {
  it('MonacoEditor를 렌더링한다', () => {
    render(
      <SQLEditor
        value=""
        onChange={noop}
      />
    )

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('language가 sql로 설정된다', () => {
    render(
      <SQLEditor
        value=""
        onChange={noop}
      />
    )

    expect(screen.getByTestId('monaco-language')).toHaveTextContent('sql')
  })

  it('value가 textarea에 반영된다', () => {
    render(
      <SQLEditor
        value="SELECT * FROM users"
        onChange={noop}
      />
    )

    const textarea = screen.getByTestId('monaco-textarea')
    expect(textarea).toHaveValue('SELECT * FROM users')
  })

  it('onChange가 호출된다', () => {
    const handleChange = vi.fn()

    render(
      <SQLEditor
        value=""
        onChange={handleChange}
      />
    )

    const textarea = screen.getByTestId('monaco-textarea')
    textarea.dispatchEvent(new Event('change', { bubbles: true }))

    expect(textarea).toBeInTheDocument()
  })

  it('readOnly 옵션이 전달된다', () => {
    render(
      <SQLEditor
        value=""
        onChange={noop}
        readOnly
      />
    )

    const textarea = screen.getByTestId('monaco-textarea')
    expect(textarea).toHaveAttribute('readonly')
  })

  it('기본 props로 렌더링 시 에러 없음', () => {
    expect(() =>
      render(
        <SQLEditor
          value="test"
          onChange={noop}
          schema={{ users: ['id'] }}
          onRun={noop}
          onRunSelection={noop}
        />
      )
    ).not.toThrow()
  })
})
