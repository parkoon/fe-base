# Coding Style Guide

## 1. React Query 훅 결과 명명 규칙

`useQuery`, `useSuspenseQuery`, `useMutation` 결과는 **구조 분해하지 않고** `xxxQuery` / `xxxMutation` 변수에 할당한다.

### Bad

```tsx
// ❌ 구조 분해로 별칭 지정
const { data: queries = [], isLoading } = useQuery(getQueriesQueryOptions())
const { mutate: deleteQuery } = useDeleteQueryMutation()
const { mutate: saveQuery, isPending: isSaving } = useCreateQueryMutation()
```

### Good

```tsx
// ✅ 변수명 패턴
const queriesQuery = useQuery(getQueriesQueryOptions())
const deleteQueryMutation = useDeleteQueryMutation()
const createQueryMutation = useCreateQueryMutation()

// 사용
queriesQuery.data ?? []
queriesQuery.isLoading
deleteQueryMutation.mutate(id)
createQueryMutation.isPending
```

**이유:** 어떤 훅에서 온 값인지 추적이 쉽고, 동일 컴포넌트에 여러 쿼리가 있을 때 충돌이 없다.

---

## 2. 쿼리 추상화 지양

컴포넌트에서만 사용되는 쿼리 로직은 커스텀 훅으로 추출하지 않고 **컴포넌트 내 인라인**으로 작성한다. 컴포넌트를 잘 분리하면 대부분 인라인으로 해결된다.

### Bad

```tsx
// ❌ 단일 사용처를 위한 커스텀 훅 추출
// use-schema-metadata.ts
export function useSchemaMetadata() {
  const tablesQuery = useQuery(getDatasourceTablesQueryOptions(...))
  const columnQueries = useQueries({ ... })
  return schemaMap
}

// editor.tsx
const schemaMap = useSchemaMetadata()
```

### Good

```tsx
// ✅ 컴포넌트 내 인라인
function QueryEditorPage() {
  const tablesQuery = useQuery(getDatasourceTablesQueryOptions(dsId, schema))
  const permittedTables = useMemo(...)
  const columnQueries = useQueries({ ... })
  const schemaMap = useMemo(...)
}
```

**예외:** 여러 컴포넌트에서 재사용되는 경우에만 커스텀 훅으로 추출한다.

---

## 3. AsyncBoundary 패턴

데이터를 페칭하는 컴포넌트는 `useSuspenseQuery`를 사용하고, **부모 컴포넌트에서 `AsyncBoundary`로 감싼다**.

### Bad

```tsx
// ❌ useQuery + 수동 로딩 처리
function QuerySidebar() {
  const queriesQuery = useQuery(getQueriesQueryOptions())
  if (queriesQuery.isLoading) return <p>불러오는 중...</p>
  return <QueryList queries={queriesQuery.data ?? []} />
}
```

### Good

```tsx
// ✅ useSuspenseQuery + 부모에서 AsyncBoundary
function QuerySidebar() {
  const queriesQuery = useSuspenseQuery(getQueriesQueryOptions())
  return <QueryList queries={queriesQuery.data} />
}

// 부모 컴포넌트
;<AsyncBoundary loadingFallback={<SidebarSkeleton />}>
  <QuerySidebar />
</AsyncBoundary>
```

### 예외: `enabled` 조건이 있는 쿼리

`enabled` 옵션으로 조건부 실행되는 쿼리는 `useSuspenseQuery` 사용 불가 (`enabled: false`일 때 무한 suspense 발생). `useQuery`를 유지한다.

```tsx
// ✅ 조건부 쿼리는 useQuery 유지
const schemasQuery = useQuery(getDatasourceSchemasQueryOptions(datasourceId ?? 0))
// getDatasourceSchemasQueryOptions 내부: enabled: datasourceId > 0
```
