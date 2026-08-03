import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Layers,
  Award,
  Ruler,
  SlidersHorizontal,
  ShieldCheck,
  Barcode,
  QrCode,
  AlertTriangle,
  CalendarClock,
  Boxes,
  ArrowLeftRight,
  Users,
  UserCog,
  Truck,
  Store,
  Warehouse,
  BarChart3,
  Receipt,
  ClipboardList,
  FileBarChart,
  Settings,
  Building2,
  CreditCard,
  LifeBuoy,
  GitBranch,
  Contact,
} from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export function getTenantNav(slug: string): NavGroup[] {
  const base = `/${slug}`
  return [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
        { label: "Sales Dashboard", href: `${base}/sales-dashboard`, icon: BarChart3 },
        { label: "POS", href: `${base}/pos`, icon: ShoppingCart },
      ],
    },
    {
      title: "Branches",
      items: [
        { label: "Branches", href: `${base}/branches`, icon: GitBranch },
        { label: "Branch Members", href: `${base}/branches/members`, icon: Contact },
      ],
    },
    {
      title: "Inventory",
      items: [
        { label: "Products", href: `${base}/products`, icon: Package },
        { label: "Categories", href: `${base}/categories`, icon: Tags },
        { label: "Sub Categories", href: `${base}/sub-categories`, icon: Layers },
        { label: "Brands", href: `${base}/brands`, icon: Award },
        { label: "Units", href: `${base}/units`, icon: Ruler },
        { label: "Variant Attributes", href: `${base}/variant-attributes`, icon: SlidersHorizontal },
        { label: "Warranties", href: `${base}/warranties`, icon: ShieldCheck },
        { label: "Expired Products", href: `${base}/products/expired`, icon: AlertTriangle },
        { label: "Low Stocks", href: `${base}/products/low-stocks`, icon: CalendarClock },
        { label: "Print Barcode", href: `${base}/print-barcode`, icon: Barcode },
        { label: "Print QR Code", href: `${base}/print-qrcode`, icon: QrCode },
      ],
    },
    {
      title: "Stock",
      items: [
        { label: "Manage Stock", href: `${base}/stock/manage`, icon: Boxes },
        { label: "Stock Adjustment", href: `${base}/stock/adjustment`, icon: SlidersHorizontal },
        { label: "Stock Transfer", href: `${base}/stock/transfer`, icon: ArrowLeftRight },
      ],
    },
    {
      title: "Peoples",
      items: [
        { label: "Customers", href: `${base}/customers`, icon: Users },
        { label: "Billers", href: `${base}/billers`, icon: UserCog },
        { label: "Suppliers", href: `${base}/suppliers`, icon: Truck },
        { label: "Stores", href: `${base}/stores`, icon: Store },
        { label: "Warehouses", href: `${base}/warehouses`, icon: Warehouse },
      ],
    },
    {
      title: "Reports",
      items: [
        { label: "Sales Report", href: `${base}/reports/sales`, icon: BarChart3 },
        { label: "Purchase Report", href: `${base}/reports/purchase`, icon: Receipt },
        { label: "Inventory Report", href: `${base}/reports/inventory`, icon: ClipboardList },
        { label: "Invoice Report", href: `${base}/reports/invoice`, icon: FileBarChart },
        { label: "Supplier Report", href: `${base}/reports/supplier`, icon: Truck },
        { label: "Customer Report", href: `${base}/reports/customer`, icon: Users },
        { label: "Product Report", href: `${base}/reports/product`, icon: Package },
      ],
    },
    {
      title: "Settings",
      items: [{ label: "Settings", href: `${base}/settings`, icon: Settings }],
    },
  ]
}

export const superadminNav: NavGroup[] = [
  {
    title: "Platform",
    items: [
      { label: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
      { label: "Tenants", href: "/superadmin/tenants", icon: Building2 },
      { label: "Billing", href: "/superadmin/billing", icon: CreditCard },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/superadmin/settings", icon: Settings },
      { label: "Support", href: "/superadmin/support", icon: LifeBuoy },
    ],
  },
]
