// DataSource/Schema 관련 타입 (백엔드 OpenAPI 스펙 확정 전 수동 정의)

export type DataSourceDriver = 'ORACLE' | 'POSTGRESQL' | 'MYSQL' | 'MSSQL'

export type DataSourceStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR'

export type DataSource = {
  id: number
  name: string
  host: string
  port: number
  driver: DataSourceDriver
  status: DataSourceStatus
  description?: string
  createdAt: string
  updatedAt: string
}

export type SchemaInfo = {
  name: string
  tableCount: number
}

export type TableInfo = {
  tableName: string
  tableComment: string
  hasPermission: boolean
}

export type ColumnInfo = {
  name: string
  type: string
  comment: string
  isMasked: boolean
}

export type SchemaMetadata = {
  datasourceId: number
  datasourceName: string
  schema: string
  tables: TableMetadataWithPermission[]
}

export type TableMetadataWithPermission = {
  tableName: string
  tableComment: string
  hasPermission: boolean
  columns: ColumnInfo[]
}
