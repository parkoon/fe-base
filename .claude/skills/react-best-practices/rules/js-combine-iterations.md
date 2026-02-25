---
title: 여러 배열 반복 합치기
impact: LOW-MEDIUM
impactDescription: 반복 횟수 감소
tags: javascript, arrays, loops, performance
---

## 여러 배열 반복 합치기

여러 번의 `.filter()`나 `.map()` 호출은 배열을 여러 번 반복합니다. 하나의 루프로 합칩니다.

**잘못된 예 (3번 반복):**

```typescript
const admins = users.filter((u) => u.isAdmin)
const testers = users.filter((u) => u.isTester)
const inactive = users.filter((u) => !u.isActive)
```

**올바른 예 (1번 반복):**

```typescript
const admins: User[] = []
const testers: User[] = []
const inactive: User[] = []

for (const user of users) {
  if (user.isAdmin) admins.push(user)
  if (user.isTester) testers.push(user)
  if (!user.isActive) inactive.push(user)
}
```
