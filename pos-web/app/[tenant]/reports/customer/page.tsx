"use client"

import { use } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { getCustomers } from "@/lib/dummy-data"
import type { Customer } from "@/lib/types"

const columns: DataTableColumn<Customer>[] = [
  {
    key: "name",
    header: "Customer",
    render: (c) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{c.avatarInitial}</div>
        <span className="font-medium">{c.name}</span>
      </div>
    ),
  },
  { key: "location", header: "Location", render: (c) => c.location },
  { key: "orders", header: "Total Orders", render: (c) => c.totalOrders },
  { key: "spent", header: "Total Spent", render: (c) => `$${c.totalSpent.toLocaleString()}` },
  { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
]

export default function CustomerReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const customers = [...getCustomers()].sort((a, b) => b.totalSpent - a.totalSpent)
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customer Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Customer Report" }]} />
      <DataTable columns={columns} data={customers} rowKey={(c) => c.id} selectable={false} searchPlaceholder="Search customers..." getSearchValue={(c) => c.name} />
    </div>
  )
}
