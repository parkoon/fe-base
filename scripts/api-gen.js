#!/usr/bin/env node
/**
 * API 코드 생성 CLI
 *
 * swagger.json을 기반으로 API 엔드포인트 코드를 자동 생성합니다.
 *
 * 사용법: pnpm api:gen
 */

import { confirm, search, select } from '@inquirer/prompts'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = join(__dirname, '..')

// ============================================
// Swagger 파싱
// ============================================

const swagger = JSON.parse(readFileSync(join(ROOT_DIR, 'swagger.json'), 'utf-8'))

const allPaths = Object.keys(swagger.paths)

// ============================================
// 유틸리티 함수
// ============================================

/** Path에서 사용 가능한 HTTP 메서드 추출 */
const getMethods = (path) => {
  const pathObj = swagger.paths[path]
  return ['get', 'post', 'put', 'patch', 'delete'].filter((method) => pathObj[method])
}

/** Path에서 Path Parameter 추출: /users/{id} → ['id'] */
const extractPathParams = (path) => {
  const matches = path.match(/\{(\w+)\}/g) ?? []
  return matches.map((m) => m.slice(1, -1))
}

/** Path에 Query Parameter가 있는지 확인 */
const hasQueryParams = (path, method) => {
  const pathObj = swagger.paths[path]
  const methodObj = pathObj[method]
  if (!methodObj || typeof methodObj !== 'object') return false
  return !!methodObj.parameters?.query
}

/** 파일명 생성: /auth/login + post → post-auth-login.ts */
const getFileName = (path, method) => {
  const kebabPath = path.replace(/^\//, '').replace(/\//g, '-')
  return `${method}-${kebabPath}.ts`
}

/** 모듈명 생성: /auth/login → auth */
const getModuleName = (path) => {
  const segments = path.split('/').filter(Boolean)
  return segments[0]
}

/** camelCase 변환: auth-login → authLogin */
const toCamelCase = (str) => {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

/** PascalCase 변환: auth-login → AuthLogin */
const toPascalCase = (str) => {
  const camel = toCamelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

/** 서비스명 생성: /auth/login + post → postAuthLogin */
const getServiceName = (path, method) => {
  const kebabPath = path.replace(/^\//, '').replace(/\//g, '-').replace(/\{|\}/g, '')
  return toCamelCase(`${method}-${kebabPath}`)
}

/** QueryKey 생성: /auth/login + get → getAuthLogin */
const getQueryKey = (path, method) => {
  return getServiceName(path, method)
}

// ============================================
// 템플릿 생성
// ============================================

/** GET 템플릿 (Path/Query 파라미터 없음) */
const generateSimpleGetTemplate = (path) => {
  const serviceName = getServiceName(path, 'get')
  const pascalName = toPascalCase(serviceName.replace('get', ''))
  const queryKey = getQueryKey(path, 'get')

  return `import { queryOptions } from '@tanstack/react-query'

import type { QueryConfig } from '@/lib/react-query'

import { dummyjson } from '../dummyjson'

export const ${serviceName}Service = () => dummyjson.GET('${path}')

export const ${serviceName}QueryOptions = () =>
  queryOptions({
    queryKey: ['${queryKey}'],
    queryFn: ${serviceName}Service,
  })

export type Get${pascalName}QueryConfig = QueryConfig<typeof ${serviceName}QueryOptions>
`
}

/** GET 템플릿 (Path 파라미터 있음) */
const generateGetWithPathParamsTemplate = (path, pathParams) => {
  const serviceName = getServiceName(path, 'get')
  const pascalName = toPascalCase(serviceName.replace('get', ''))
  const queryKey = getQueryKey(path, 'get')

  // 파라미터 타입 추론
  const paramsType = `InferPathParams<paths, '${path}', 'get'>`
  const paramsList = pathParams.join(', ')

  return `import { queryOptions } from '@tanstack/react-query'

import type { InferPathParams } from '@/lib/api'
import type { QueryConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const ${serviceName}Service = (params: ${paramsType}) =>
  dummyjson.GET('${path}', { path: params })

export const ${serviceName}QueryOptions = (${paramsList}: ${paramsType}[keyof ${paramsType}]) =>
  queryOptions({
    queryKey: ['${queryKey}', ${paramsList}],
    queryFn: () => ${serviceName}Service({ ${paramsList} }),
  })

export type Get${pascalName}QueryConfig = QueryConfig<typeof ${serviceName}QueryOptions>
`
}

/** GET 템플릿 (Query 파라미터 있음) */
const generateGetWithQueryParamsTemplate = (path) => {
  const serviceName = getServiceName(path, 'get')
  const pascalName = toPascalCase(serviceName.replace('get', ''))
  const queryKey = getQueryKey(path, 'get')

  const queryType = `InferQueryParams<paths, '${path}', 'get'>`

  return `import { queryOptions } from '@tanstack/react-query'

import type { InferQueryParams } from '@/lib/api'
import type { QueryConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const ${serviceName}Service = (query?: ${queryType}) =>
  dummyjson.GET('${path}', { query })

export const ${serviceName}QueryOptions = (query?: ${queryType}) =>
  queryOptions({
    queryKey: ['${queryKey}', query],
    queryFn: () => ${serviceName}Service(query),
  })

export type Get${pascalName}QueryConfig = QueryConfig<typeof ${serviceName}QueryOptions>
`
}

/** GET 템플릿 (Path + Query 파라미터 둘 다 있음) */
const generateGetWithBothParamsTemplate = (path, pathParams) => {
  const serviceName = getServiceName(path, 'get')
  const pascalName = toPascalCase(serviceName.replace('get', ''))
  const queryKey = getQueryKey(path, 'get')

  const pathParamsType = `InferPathParams<paths, '${path}', 'get'>`
  const queryType = `InferQueryParams<paths, '${path}', 'get'>`
  const paramsList = pathParams.join(', ')

  return `import { queryOptions } from '@tanstack/react-query'

import type { InferPathParams, InferQueryParams } from '@/lib/api'
import type { QueryConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

export const ${serviceName}Service = (
  params: ${pathParamsType},
  query?: ${queryType}
) => dummyjson.GET('${path}', { path: params, query })

export const ${serviceName}QueryOptions = (
  ${paramsList}: ${pathParamsType}[keyof ${pathParamsType}],
  query?: ${queryType}
) =>
  queryOptions({
    queryKey: ['${queryKey}', ${paramsList}, query],
    queryFn: () => ${serviceName}Service({ ${paramsList} }, query),
  })

export type Get${pascalName}QueryConfig = QueryConfig<typeof ${serviceName}QueryOptions>
`
}

/** Mutation 템플릿 (POST/PUT/PATCH/DELETE) */
const generateMutationTemplate = (path, method) => {
  const serviceName = getServiceName(path, method)
  const pascalName = toPascalCase(serviceName)
  const methodUpper = method.toUpperCase()
  const pathParams = extractPathParams(path)
  const hasPath = pathParams.length > 0

  // Body가 필요한지 확인 (DELETE는 보통 body 없음)
  const needsBody = method !== 'delete'

  let serviceParams = ''
  let serviceCall = ''
  // import 순서: 외부 패키지 → @/lib/api → @/lib/react-query → @/types (알파벳순)
  let imports = `import { useMutation } from '@tanstack/react-query'

`

  if (needsBody && hasPath) {
    imports += `import type { InferBody, InferPathParams } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'
`
    serviceParams = `data: InferBody<paths, '${path}', '${method}'>,
  params: InferPathParams<paths, '${path}', '${method}'>`
    serviceCall = `dummyjson.${methodUpper}('${path}', data, { path: params })`
  } else if (needsBody) {
    imports += `import type { InferBody } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'
`
    serviceParams = `data: InferBody<paths, '${path}', '${method}'>`
    serviceCall = `dummyjson.${methodUpper}('${path}', data)`
  } else if (hasPath) {
    imports += `import type { InferPathParams } from '@/lib/api'
import type { MutationConfig } from '@/lib/react-query'
import type { paths } from '@/types/dummyjson'
`
    serviceParams = `params: InferPathParams<paths, '${path}', '${method}'>`
    serviceCall = `dummyjson.${methodUpper}('${path}', { path: params })`
  } else {
    imports += `import type { MutationConfig } from '@/lib/react-query'
`
    serviceParams = ''
    serviceCall = `dummyjson.${methodUpper}('${path}')`
  }

  imports += `
import { dummyjson } from '../dummyjson'
`

  return `${imports}
export const ${serviceName}Service = (${serviceParams}) =>
  ${serviceCall}

type Use${pascalName}MutationOptions = {
  mutationConfig?: MutationConfig<typeof ${serviceName}Service>
}

export function use${pascalName}Mutation({
  mutationConfig,
}: Use${pascalName}MutationOptions = {}) {
  return useMutation({
    mutationFn: ${serviceName}Service,
    ...mutationConfig,
  })
}
`
}

/** 템플릿 선택 및 생성 */
const generateTemplate = (path, method) => {
  if (method === 'get') {
    const pathParams = extractPathParams(path)
    const hasQuery = hasQueryParams(path, method)
    const hasPath = pathParams.length > 0

    if (hasPath && hasQuery) {
      return generateGetWithBothParamsTemplate(path, pathParams)
    } else if (hasPath) {
      return generateGetWithPathParamsTemplate(path, pathParams)
    } else if (hasQuery) {
      return generateGetWithQueryParamsTemplate(path)
    } else {
      return generateSimpleGetTemplate(path)
    }
  } else {
    return generateMutationTemplate(path, method)
  }
}

// ============================================
// Index.ts 업데이트
// ============================================

const updateIndexFile = (modulePath, fileName, path, method) => {
  const indexPath = join(modulePath, 'index.ts')
  const serviceName = getServiceName(path, method)
  const pascalName = toPascalCase(serviceName)
  const fileNameWithoutExt = fileName.replace('.ts', '')

  let exports = []

  if (method === 'get') {
    const pascalQueryName = toPascalCase(serviceName.replace('get', ''))
    exports = [
      `export type { Get${pascalQueryName}QueryConfig } from './${fileNameWithoutExt}'`,
      `export { ${serviceName}QueryOptions, ${serviceName}Service } from './${fileNameWithoutExt}'`,
    ]
  } else {
    exports = [
      `export { ${serviceName}Service, use${pascalName}Mutation } from './${fileNameWithoutExt}'`,
    ]
  }

  if (existsSync(indexPath)) {
    const content = readFileSync(indexPath, 'utf-8')

    // 이미 export가 있는지 확인
    if (content.includes(fileNameWithoutExt)) {
      console.log(`  ℹ index.ts already contains exports for ${fileNameWithoutExt}`)
      return
    }

    // 파일 끝에 추가
    const newContent =
      content.trimEnd() +
      '\n\n// ' +
      method.toUpperCase() +
      ' ' +
      path +
      '\n' +
      exports.join('\n') +
      '\n'
    writeFileSync(indexPath, newContent)
  } else {
    // 새 index.ts 생성
    const newContent = `// ${method.toUpperCase()} ${path}\n${exports.join('\n')}\n`
    writeFileSync(indexPath, newContent)
  }
}

// ============================================
// 메인 CLI
// ============================================

const main = async () => {
  console.log('\n🚀 API Code Generator\n')

  // 1. Path 검색/선택
  const selectedPath = await search({
    message: 'Select API path:',
    source: (input) => {
      const term = input?.toLowerCase() ?? ''
      return allPaths
        .filter((p) => p.toLowerCase().includes(term))
        .map((p) => ({
          name: p,
          value: p,
          description: getMethods(p).join(', ').toUpperCase(),
        }))
    },
  })

  // 2. HTTP Method 선택
  const methods = getMethods(selectedPath)
  let selectedMethod

  if (methods.length === 1) {
    selectedMethod = methods[0]
    console.log(`  → Method: ${selectedMethod.toUpperCase()} (only option)`)
  } else {
    selectedMethod = await select({
      message: `Select HTTP method for ${selectedPath}:`,
      choices: methods.map((m) => ({
        name: m.toUpperCase(),
        value: m,
      })),
    })
  }

  // 3. 파일 경로 결정
  const moduleName = getModuleName(selectedPath)
  const fileName = getFileName(selectedPath, selectedMethod)
  const modulePath = join(ROOT_DIR, 'src', 'api', moduleName)
  const filePath = join(modulePath, fileName)

  // 4. 파일 존재 확인
  if (existsSync(filePath)) {
    const overwrite = await confirm({
      message: `${fileName} already exists. Overwrite?`,
      default: false,
    })
    if (!overwrite) {
      console.log('\n❌ Cancelled.\n')
      return
    }
  }

  // 5. 폴더 생성
  if (!existsSync(modulePath)) {
    mkdirSync(modulePath, { recursive: true })
    console.log(`  ✓ Created directory: src/api/${moduleName}/`)
  }

  // 6. 파일 생성
  const template = generateTemplate(selectedPath, selectedMethod)
  writeFileSync(filePath, template)
  console.log(`  ✓ Created: src/api/${moduleName}/${fileName}`)

  // 7. index.ts 업데이트
  updateIndexFile(modulePath, fileName, selectedPath, selectedMethod)
  console.log(`  ✓ Updated: src/api/${moduleName}/index.ts`)

  console.log('\n✨ Done! Run `pnpm lint --fix` to format the generated code.\n')
}

main().catch(console.error)
