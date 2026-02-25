---
title: 독립적인 연산에 Promise.all() 사용하기
impact: CRITICAL
impactDescription: 2-10배 개선
tags: async, parallelization, promises, waterfalls
---

## 독립적인 연산에 Promise.all() 사용하기

비동기 연산들이 서로 의존성이 없는 경우, `Promise.all()`을 사용하여 동시에 실행합니다.

**잘못된 예 (순차 실행, 3번의 라운드 트립):**

```typescript
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

**올바른 예 (병렬 실행, 1번의 라운드 트립):**

```typescript
const [user, posts, comments] = await Promise.all([fetchUser(), fetchPosts(), fetchComments()])
```
