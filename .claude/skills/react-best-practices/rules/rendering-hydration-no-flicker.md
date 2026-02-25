---
title: 깜빡임 없이 하이드레이션 불일치 방지하기
impact: MEDIUM
impactDescription: 시각적 깜빡임과 하이드레이션 에러 방지
tags: rendering, ssr, hydration, localStorage, flicker
---

## 깜빡임 없이 하이드레이션 불일치 방지하기

클라이언트 사이드 저장소(localStorage, 쿠키)에 의존하는 콘텐츠를 렌더링할 때, SSR 오류와 하이드레이션 후 깜빡임을 모두 방지하려면 React가 하이드레이트하기 전에 DOM을 업데이트하는 동기 스크립트를 주입합니다.

**잘못된 예 (SSR 오류):**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  // localStorage는 서버에서 사용 불가 - 에러 발생
  const theme = localStorage.getItem('theme') || 'light'

  return <div className={theme}>{children}</div>
}
```

서버 사이드 렌더링은 `localStorage`가 undefined이므로 실패합니다.

**잘못된 예 (시각적 깜빡임):**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // 하이드레이션 후 실행 - 눈에 보이는 깜빡임 발생
    const stored = localStorage.getItem('theme')
    if (stored) {
      setTheme(stored)
    }
  }, [])

  return <div className={theme}>{children}</div>
}
```

컴포넌트가 먼저 기본값(`light`)으로 렌더링된 후 하이드레이션 후에 업데이트되어, 잘못된 콘텐츠가 눈에 보이게 깜빡입니다.

**올바른 예 (깜빡임 없음, 하이드레이션 불일치 없음):**

```tsx
function ThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <div id="theme-wrapper">{children}</div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme') || 'light';
                var el = document.getElementById('theme-wrapper');
                if (el) el.className = theme;
              } catch (e) {}
            })();
          `,
        }}
      />
    </>
  )
}
```

인라인 스크립트가 엘리먼트를 보여주기 전에 동기적으로 실행되어, DOM이 이미 올바른 값을 가지게 됩니다. 깜빡임 없음, 하이드레이션 불일치 없음.

이 패턴은 테마 토글, 사용자 환경설정, 인증 상태, 그리고 기본값을 깜빡이지 않고 즉시 렌더링해야 하는 클라이언트 전용 데이터에 특히 유용합니다.
