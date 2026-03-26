import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { usePostAuthLoginMutation } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { paths } from '@/config/paths'
import type { UserRole } from '@/lib/auth'
import { useAuthStore } from '@/lib/auth'
import { cn } from '@/lib/utils'

// DummyJSON 테스트 계정 + 역할 매핑
const TEST_ACCOUNTS: {
  label: string
  username: string
  password: string
  role: UserRole
}[] = [
  { label: '일반 사용자', username: 'emilys', password: 'emilyspass', role: 'USER' },
  { label: '결재자', username: 'michaelw', password: 'michaelwpass', role: 'APPROVER' },
  { label: '관리자', username: 'sophiab', password: 'sophiabpass', role: 'ADMIN' },
]

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const setRole = useAuthStore((s) => s.setRole)

  const loginMutation = usePostAuthLoginMutation()

  const doLogin = (loginUsername: string, loginPassword: string) => {
    loginMutation.mutate(
      { username: loginUsername, password: loginPassword, expiresInMins: 60 },
      {
        onSuccess: (data) => {
          setUser(data)

          // 테스트 계정이면 매핑된 역할 부여
          const account = TEST_ACCOUNTS.find((a) => a.username === loginUsername)
          if (account) {
            setRole(account.role)
          }

          const redirectTo = searchParams.get('redirectTo')
          void navigate(redirectTo ?? paths.app.root.getHref(), { replace: true })
        },
      }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doLogin(username, password)
  }

  const handleQuickLogin = (account: (typeof TEST_ACCOUNTS)[number]) => {
    setUsername(account.username)
    setPassword(account.password)
    doLogin(account.username, account.password)
  }

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">QueryPie</CardTitle>
          <CardDescription>정보계 DB 권한관리 + 웹쿼리</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">사용자명</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">비밀번호</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? '로그인 중...' : '로그인'}
              </Button>
              {loginMutation.isError && (
                <p className="text-destructive text-center text-sm">
                  로그인에 실패했습니다. 계정 정보를 확인해주세요.
                </p>
              )}
            </FieldGroup>
          </form>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-muted-foreground text-xs">테스트 계정으로 빠른 로그인</span>
              <Separator className="flex-1" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {TEST_ACCOUNTS.map((account) => (
                <Button
                  key={account.username}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loginMutation.isPending}
                  onClick={() => handleQuickLogin(account)}
                >
                  {account.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
