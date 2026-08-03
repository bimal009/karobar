import type { LucideIcon } from "lucide-react"
import { Armchair, Package, PenLine, Shirt, ShoppingBasket, Smartphone, Sparkles } from "lucide-react"

const categoryIcons: Record<string, LucideIcon> = {
  Electronics: Smartphone,
  Groceries: ShoppingBasket,
  Furniture: Armchair,
  "Beauty & Health": Sparkles,
  Apparel: Shirt,
  Stationery: PenLine,
}

export function getCategoryIcon(categoryName: string): LucideIcon {
  return categoryIcons[categoryName] ?? Package
}
