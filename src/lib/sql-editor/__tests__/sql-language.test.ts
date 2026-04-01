import { describe, expect, it } from 'vitest'

import {
  buildColumnCompletionItems,
  buildCompletionItems,
  extractTableNameBeforeDot,
  SQL_KEYWORDS,
} from '../sql-language'

const testSchema = {
  users: ['id', 'name', 'email'],
  orders: ['id', 'user_id', 'total'],
}

describe('buildCompletionItems', () => {
  it('SQL 키워드를 포함한다', () => {
    const items = buildCompletionItems({})
    const labels = items.map((i) => i.label)

    expect(labels).toContain('SELECT')
    expect(labels).toContain('FROM')
    expect(labels).toContain('WHERE')
  })

  it('모든 SQL 키워드가 포함된다', () => {
    const items = buildCompletionItems({})
    const keywordItems = items.filter((i) => i.detail === 'Keyword')

    expect(keywordItems).toHaveLength(SQL_KEYWORDS.length)
  })

  it('스키마의 테이블명을 포함한다', () => {
    const items = buildCompletionItems(testSchema)
    const labels = items.map((i) => i.label)

    expect(labels).toContain('users')
    expect(labels).toContain('orders')
  })

  it('테이블 항목은 detail이 Table이다', () => {
    const items = buildCompletionItems(testSchema)
    const tableItems = items.filter((i) => i.detail === 'Table')

    expect(tableItems).toHaveLength(2)
  })

  it('빈 스키마면 키워드만 반환한다', () => {
    const items = buildCompletionItems({})
    const tableItems = items.filter((i) => i.detail === 'Table')

    expect(tableItems).toHaveLength(0)
    expect(items.length).toBe(SQL_KEYWORDS.length)
  })
})

describe('buildColumnCompletionItems', () => {
  it('테이블의 컬럼들을 반환한다', () => {
    const items = buildColumnCompletionItems('users', testSchema)
    const labels = items.map((i) => i.label)

    expect(labels).toEqual(['id', 'name', 'email'])
  })

  it('각 항목의 detail에 테이블명이 포함된다', () => {
    const items = buildColumnCompletionItems('users', testSchema)

    for (const item of items) {
      expect(item.detail).toBe('users.column')
    }
  })

  it('kind가 Field(4)이다', () => {
    const items = buildColumnCompletionItems('users', testSchema)

    for (const item of items) {
      expect(item.kind).toBe(4)
    }
  })

  it('존재하지 않는 테이블이면 빈 배열 반환', () => {
    const items = buildColumnCompletionItems('nonexistent', testSchema)

    expect(items).toEqual([])
  })
})

describe('extractTableNameBeforeDot', () => {
  it('"users." 패턴에서 테이블명 추출', () => {
    expect(extractTableNameBeforeDot('SELECT users.')).toBe('users')
  })

  it('"orders." 패턴에서 테이블명 추출', () => {
    expect(extractTableNameBeforeDot('FROM orders.')).toBe('orders')
  })

  it('dot이 없으면 null 반환', () => {
    expect(extractTableNameBeforeDot('SELECT users')).toBeNull()
  })

  it('빈 문자열이면 null 반환', () => {
    expect(extractTableNameBeforeDot('')).toBeNull()
  })

  it('dot 뒤에 공백이 있어도 추출', () => {
    expect(extractTableNameBeforeDot('users. ')).toBe('users')
  })

  it('여러 dot 중 마지막 테이블명 추출', () => {
    expect(extractTableNameBeforeDot('schema.users.')).toBe('users')
  })
})
