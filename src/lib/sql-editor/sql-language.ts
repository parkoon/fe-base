import type { languages } from 'monaco-editor'

import type { SQLEditorSchema } from './types'

export const SQL_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'INSERT',
  'UPDATE',
  'DELETE',
  'CREATE',
  'DROP',
  'ALTER',
  'TABLE',
  'INDEX',
  'VIEW',
  'INTO',
  'VALUES',
  'SET',
  'JOIN',
  'LEFT',
  'RIGHT',
  'INNER',
  'OUTER',
  'FULL',
  'CROSS',
  'ON',
  'AS',
  'AND',
  'OR',
  'NOT',
  'IN',
  'EXISTS',
  'BETWEEN',
  'LIKE',
  'IS',
  'NULL',
  'TRUE',
  'FALSE',
  'ORDER',
  'BY',
  'GROUP',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'UNION',
  'ALL',
  'DISTINCT',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'ASC',
  'DESC',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'COALESCE',
  'CAST',
  'WITH',
  'RECURSIVE',
  'RETURNING',
  'TRUNCATE',
  'BEGIN',
  'COMMIT',
  'ROLLBACK',
  'GRANT',
  'REVOKE',
  'PRIMARY',
  'KEY',
  'FOREIGN',
  'REFERENCES',
  'CONSTRAINT',
  'DEFAULT',
  'CHECK',
  'UNIQUE',
  'CASCADE',
  'RESTRICT',
]

export function buildCompletionItems(schema: SQLEditorSchema): languages.CompletionItem[] {
  const items: languages.CompletionItem[] = []

  // SQL keywords
  for (const keyword of SQL_KEYWORDS) {
    items.push({
      label: keyword,
      kind: 17, // CompletionItemKind.Keyword
      insertText: keyword,
      detail: 'Keyword',
      range: undefined as never,
    })
  }

  // Table names
  for (const tableName of Object.keys(schema)) {
    items.push({
      label: tableName,
      kind: 1, // CompletionItemKind.Text → used as "table" visually via detail
      insertText: tableName,
      detail: 'Table',
      range: undefined as never,
    })
  }

  return items
}

export function buildColumnCompletionItems(
  tableName: string,
  schema: SQLEditorSchema
): languages.CompletionItem[] {
  const columns = schema[tableName]
  if (!columns) return []

  return columns.map((col) => ({
    label: col,
    kind: 4, // CompletionItemKind.Field
    insertText: col,
    detail: `${tableName}.column`,
    range: undefined as never,
  }))
}

/**
 * 에디터 텍스트에서 "tableName." 패턴의 테이블명을 추출
 */
export function extractTableNameBeforeDot(textBeforeCursor: string): string | null {
  const match = /(\w+)\.\s*$/.exec(textBeforeCursor)
  return match ? match[1] : null
}
