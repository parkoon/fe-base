import {
  ClipboardCheckIcon,
  DatabaseIcon,
  HardDriveIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  SendIcon,
  ShieldCheckIcon,
  TerminalSquareIcon,
  UsersIcon,
} from 'lucide-react'
import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
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
    label: '웹쿼리',
    items: [
      {
        title: 'SQL 에디터',
        url: paths.app.query.editor.getHref(),
        icon: <TerminalSquareIcon />,
      },
      {
        title: '실행 이력',
        url: paths.app.query.history.getHref(),
        icon: <HistoryIcon />,
      },
    ],
  },
  {
    label: '권한관리',
    items: [
      {
        title: '권한 신청',
        url: paths.app.permissions.request.getHref(),
        icon: <SendIcon />,
      },
      {
        title: '내 신청 목록',
        url: paths.app.permissions.my.getHref(),
        icon: <ScrollTextIcon />,
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
        title: 'DataSource 관리',
        url: paths.app.admin.datasources.getHref(),
        icon: <HardDriveIcon />,
      },
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
  const user = useAuthStore((s) => s.user)
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
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <LayoutDashboardIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">QueryPie</span>
                  <span className="truncate text-xs">정보계 DB 관리</span>
                </div>
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
        <NavUser
          user={{
            name: user?.firstName ?? '사용자',
            email: user?.email ?? '',
            avatar: user?.image ?? '',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
