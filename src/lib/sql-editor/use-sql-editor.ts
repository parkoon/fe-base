import { useCallback, useState } from 'react'

import type { SQLEditorProps, SQLEditorSchema } from './types'

type UseSQLEditorOptions = {
  initialValue?: string
  schema?: SQLEditorSchema
}

type UseSQLEditorReturn = {
  value: string
  setValue: (sql: string) => void
  clear: () => void
  schema: SQLEditorSchema
  setSchema: (schema: SQLEditorSchema) => void
  /** SQLEditor에 바로 spread 가능한 props */
  editorProps: Pick<SQLEditorProps, 'value' | 'onChange' | 'schema'>
}

export function useSQLEditor(options: UseSQLEditorOptions = {}): UseSQLEditorReturn {
  const { initialValue = '', schema: initialSchema = {} } = options
  const [value, setValue] = useState(initialValue)
  const [schema, setSchema] = useState<SQLEditorSchema>(initialSchema)

  const clear = useCallback(() => setValue(''), [])

  return {
    value,
    setValue,
    clear,
    schema,
    setSchema,
    editorProps: {
      value,
      onChange: setValue,
      schema,
    },
  }
}
