import { cn } from "@/lib/utils"
import { getCategoryIcon } from "@/lib/icon-map"

interface CategoryIconProps {
  categoryName: string
  className?: string
  iconClassName?: string
}

export function CategoryIcon({ categoryName, className, iconClassName }: CategoryIconProps) {
  const Icon = getCategoryIcon(categoryName)
  return (
    <div className={cn("flex size-9 items-center justify-center rounded-lg bg-muted", className)}>
      <Icon className={cn("size-4 text-foreground", iconClassName)} />
    </div>
  )
}
