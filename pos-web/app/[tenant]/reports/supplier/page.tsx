"use client"

import { use } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { getSuppliers } from "@/lib/dummy-data"
import type { Supplier } from "@/lib/types"

const columns: DataTableColumn<Supplier>[] = [
  {
    key: "name",
    header: "Supplier",
    render: (s) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{s.avatarInitial}</div>
        <span className="font-medium">{s.name}</span>
      </div>
    ),
  },
  { key: "location", header: "Location", render: (s) => s.location },
  { key: "orders", header: "Total Orders", render: (s) => s.totalOrders },
  { key: "due", header: "Due Amount", render: (s) => `$${s.totalDue.toLocaleString()}` },
  { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
]

export default function SupplierReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const suppliers = getSuppliers()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Supplier Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Supplier Report" }]} />
      <DataTable columns={columns} data={suppliers} rowKey={(s) => s.id} selectable={false} searchPlaceholder="Search suppliers..." getSearchValue={(s) => s.name} />
    </div>
  )
}
