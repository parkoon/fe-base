import {
  ClipboardCheckIcon,
  DatabaseIcon,
  EyeOffIcon,
  HistoryIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  TerminalSquareIcon,
  UsersIcon,
} from 'lucide-react'
import * as React from 'react'

import logo from '@/assets/images/logo.png'
import { NavMain } from '@/components/nav-main'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { paths } from '@/config/paths'
import type { UserRole } from '@/lib/auth'
import { getRoleLevel, useAuthStore } from '@/lib/auth'

type NavGroup = {
  label: string
  items: {
    title: string
    url: string
    icon: React.ReactNode
  }[]
  minRole?: UserRole
}

const navGroups: NavGroup[] = [
  {
    label: 'SQL',
    items: [
      {
        title: 'SQL 에디터',
        url: paths.app.sql.editor.getHref(),
        icon: <TerminalSquareIcon />,
      },
      {
        title: '실행 이력',
        url: paths.app.sql.history.getHref(),
        icon: <HistoryIcon />,
      },
    ],
  },
  {
    label: '권한관리',
    items: [
      {
        title: '테이블 권한',
        url: paths.app.permissions.table.root.getHref(),
        icon: <ScrollTextIcon />,
      },
      {
        title: '마스킹 권한',
        url: paths.app.permissions.masking.root.getHref(),
        icon: <EyeOffIcon />,
      },
    ],
  },
  {
    label: '결재',
    minRole: 'APPROVER',
    items: [
      {
        title: '결재 대기함',
        url: paths.app.approvals.root.getHref(),
        icon: <ClipboardCheckIcon />,
      },
    ],
  },
  {
    label: '관리자',
    minRole: 'ADMIN',
    items: [
      {
        title: '사용자 관리',
        url: paths.app.admin.users.getHref(),
        icon: <UsersIcon />,
      },
      {
        title: '권한 현황',
        url: paths.app.admin.permissions.getHref(),
        icon: <ShieldCheckIcon />,
      },
      {
        title: '감사 로그',
        url: paths.app.admin.audit.getHref(),
        icon: <DatabaseIcon />,
      },
    ],
  },
]

function hasAccess(userRole: UserRole, minRole?: UserRole): boolean {
  if (!minRole) return true
  return getRoleLevel(userRole) >= getRoleLevel(minRole)
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const role = useAuthStore((s) => s.role)

  const visibleGroups = navGroups.filter((group) => hasAccess(role, group.minRole))

  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
            >
              <a href={paths.app.dashboard.getHref()}>
                <div className="flex aspect-square size-8">
                  <img
                    src={logo}
                    className="h-full w-full"
                  />
                </div>
                <span className="truncate font-semibold">정보계 웹 쿼리</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((group) => (
          <NavMain
            key={group.label}
            label={group.label}
            items={group.items}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarTrigger className="text-gray-500" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
