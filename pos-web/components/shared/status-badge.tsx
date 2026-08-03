import { cn } from "@/lib/utils"

type Status = "active" | "inactive" | "pending" | "completed" | "cancelled" | "returned" | "trial" | "suspended"

const styles: Record<Status, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  inactive: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
  returned: "bg-red-500/10 text-red-600 dark:text-red-400",
  trial: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  suspended: "bg-red-500/10 text-red-600 dark:text-red-400",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = (styles[status as Status] ? status : "inactive") as Status
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        styles[key],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
