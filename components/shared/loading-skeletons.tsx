import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

export function AppHeaderSkeleton() {
  return (
    <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4">
      <Skeleton className="size-7 rounded-md" />
      <Skeleton className="h-4 w-28" />
      <div className="ml-auto flex items-center gap-2">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </div>
  )
}

export function PageHeaderSkeleton({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {withAction && <Skeleton className="h-9 w-32" />}
    </div>
  )
}

export function TableRowsSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((__, c) => (
            <TableCell key={c}>
              <Skeleton className={c === 0 ? "h-4 w-2/3" : "h-4 w-full max-w-32"} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export function TableCardSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-3 border-b p-4">
        <Skeleton className="h-9 w-full max-w-xs" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-6 p-4">
            {Array.from({ length: columns }).map((__, c) => (
              <Skeleton key={c} className={c === 0 ? "h-4 w-1/4 min-w-24" : "h-4 flex-1"} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t p-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-5">
      <Skeleton className="size-9 rounded-lg" />
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

/** Generic skeleton for content-only areas (rendered inside PageShell's existing AppHeader). */
export function ContentSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeaderSkeleton />
      <TableCardSkeleton rows={rows} columns={columns} />
    </div>
  )
}

/** Full-page skeleton (header bar + content) for route-level loading.tsx files. */
export function PageSkeleton({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <>
      <AppHeaderSkeleton />
      <ContentSkeleton rows={rows} columns={columns} />
    </>
  )
}

export function DashboardSkeleton() {
  return (
    <>
      <AppHeaderSkeleton />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <PageHeaderSkeleton withAction={false} />
        <Skeleton className="h-14 w-full rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <Skeleton className="h-72 rounded-xl xl:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <TableCardSkeleton rows={4} columns={3} />
      </div>
    </>
  )
}

export function ReportsSkeleton() {
  return (
    <>
      <AppHeaderSkeleton />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <PageHeaderSkeleton withAction={false} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-9 w-full max-w-xs" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
        <TableCardSkeleton rows={8} columns={5} />
      </div>
    </>
  )
}

export function PosSkeleton() {
  return (
    <>
      <AppHeaderSkeleton />
      <div className="grid h-[calc(100vh-4rem)] grid-cols-1 gap-0 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4 overflow-hidden p-4 md:p-6">
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[68px] w-28 shrink-0 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-9 w-56" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t bg-card p-4 lg:border-t-0 lg:border-l">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="mt-auto h-40 w-full rounded-lg" />
        </div>
      </div>
    </>
  )
}

export function FormCardSkeleton({ rows = 2, title = true }: { rows?: number; title?: boolean }) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border bg-card p-6">
      {title && <Skeleton className="h-5 w-32" />}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <>
      <AppHeaderSkeleton />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <PageHeaderSkeleton withAction={false} />
        <FormCardSkeleton rows={2} />
        <FormCardSkeleton rows={3} />
      </div>
    </>
  )
}

export function CardGridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} className="h-[68px] rounded-xl" />
      ))}
    </div>
  )
}
