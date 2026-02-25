---
title: 반복 함수 호출 결과 캐싱
impact: MEDIUM
impactDescription: 불필요한 연산 방지
tags: javascript, cache, memoization, performance
---

## 반복 함수 호출 결과 캐싱

렌더 중에 같은 입력으로 반복 호출되는 함수의 결과를 모듈 레벨 Map을 사용하여 캐싱합니다.

**잘못된 예 (불필요한 연산):**

```typescript
function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map(project => {
        // slugify()가 같은 프로젝트 이름에 대해 100번 이상 호출됨
        const slug = slugify(project.name)

        return <ProjectCard key={project.id} slug={slug} />
      })}
    </div>
  )
}
```

**올바른 예 (캐시된 결과):**

```typescript
// 모듈 레벨 캐시
const slugifyCache = new Map<string, string>()

function cachedSlugify(text: string): string {
  if (slugifyCache.has(text)) {
    return slugifyCache.get(text)!
  }
  const result = slugify(text)
  slugifyCache.set(text, result)
  return result
}

function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div>
      {projects.map(project => {
        // 고유한 프로젝트 이름당 한 번만 계산
        const slug = cachedSlugify(project.name)

        return <ProjectCard key={project.id} slug={slug} />
      })}
    </div>
  )
}
```

**단일 값 함수를 위한 더 간단한 패턴:**

```typescript
let isLoggedInCache: boolean | null = null

function isLoggedIn(): boolean {
  if (isLoggedInCache !== null) {
    return isLoggedInCache
  }

  isLoggedInCache = document.cookie.includes('auth=')
  return isLoggedInCache
}

// 인증 변경 시 캐시 초기화
function onAuthChange() {
  isLoggedInCache = null
}
```

유틸리티, 이벤트 핸들러 등 React 컴포넌트뿐만 아니라 어디서든 작동하도록 Map(훅이 아닌)을 사용합니다.

Reference: [How we made the Vercel Dashboard twice as fast](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)
