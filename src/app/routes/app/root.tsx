import { Outlet } from 'react-router'

import { AppSidebar } from '@/components/app-sidebar'
import { NavUser } from '@/components/nav-user'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useAuthStore } from '@/lib/auth'

function AppRoot() {
  const user = useAuthStore((s) => s.user)

  return (
    <SidebarProvider style={{ '--sidebar-width': '220px' } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center justify-end border-b px-4">
          <NavUser
            user={{
              name: user?.firstName ?? '사용자',
              email: user?.email ?? '',
              avatar: user?.image ?? '',
            }}
          />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AppRoot
