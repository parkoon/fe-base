import { ChevronRightIcon, FileTextIcon, PlusIcon, SearchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function QuerySidebar() {
  return (
    <div className="flex h-full w-full flex-col border-r">
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-3">
        <span className="text-sm font-semibold">SQL Editor</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
        >
          <PlusIcon className="size-3.5" />
        </Button>
      </div>

      {/* Search */}
      <div className="border-b px-3 py-2">
        <div className="relative">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search queries..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Query list */}
      <div className="flex-1 overflow-y-auto p-2">
        <SidebarSection
          title="FAVORITES"
          count={1}
        />
        <SidebarSection
          title="PRIVATE"
          count={12}
          defaultOpen
        />
        <SidebarSection title="COMMUNITY" />
      </div>
    </div>
  )
}

function SidebarSection({
  title,
  count,
  defaultOpen,
}: {
  title: string
  count?: number
  defaultOpen?: boolean
}) {
  return (
    <div className="mb-1">
      <button
        type="button"
        className="hover:bg-accent flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium tracking-wider text-neutral-500"
      >
        <ChevronRightIcon className="size-3" />
        {title}
        {count != null && <span className="text-muted-foreground">({count})</span>}
      </button>

      {defaultOpen && (
        <div className="mt-0.5 space-y-0.5">
          {['전체 게시글 조회', '최근 사용자 목록', '주문 통계'].map((name) => (
            <button
              key={name}
              type="button"
              className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-700"
            >
              <FileTextIcon className="text-muted-foreground size-3.5 shrink-0" />
              <span className="truncate">{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
