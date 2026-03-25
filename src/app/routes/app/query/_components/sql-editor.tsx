import { sql } from '@codemirror/lang-sql'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { useEffect, useRef } from 'react'

const sqlCompartment = new Compartment()

export function SqlEditor({
  value,
  onChange,
  onRun,
  onEditorMount,
  schema,
}: {
  value: string
  onChange: (value: string) => void
  onRun?: () => void
  onEditorMount?: (view: EditorView) => void
  schema?: Record<string, string[]>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onRunRef = useRef(onRun)
  const onChangeRef = useRef(onChange)

  onRunRef.current = onRun
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return

    const runQueryKeymap = keymap.of([
      {
        key: 'Mod-Enter',
        run: () => {
          onRunRef.current?.()
          return true
        },
      },
    ])

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString())
      }
    })

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        sqlCompartment.of(sql({ schema })),
        runQueryKeymap,
        updateListener,
        EditorView.theme({
          '&': { height: '100%', fontSize: '13px' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-content': { padding: '8px 0' },
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view
    view.focus()
    onEditorMount?.(view)

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // schema 변경 시 sql extension 동적 교체
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    view.dispatch({
      effects: sqlCompartment.reconfigure(sql({ schema })),
    })
  }, [schema])

  // 외부 value 변경 시 에디터 동기화
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const currentValue = view.state.doc.toString()
    if (currentValue !== value) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value },
      })
    }
  }, [value])

  return (
    <div
      ref={containerRef}
      className="h-full"
    />
  )
}
