"use client"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { useCustomerReport } from "../client/useReports"
import type { CustomerReportRow } from "../api/reports.action"

const columns: DataTableColumn<CustomerReportRow>[] = [
  {
    key: "name",
    header: "Customer",
    render: (c) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {c.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium">{c.name}</span>
      </div>
    ),
  },
  { key: "location", header: "Location", render: (c) => c.location ?? "—" },
  { key: "orders", header: "Total Orders", render: (c) => c.totalOrders },
  { key: "spent", header: "Total Spent", render: (c) => `$${c.totalSpent.toLocaleString()}` },
  { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
]

interface CustomerReportViewProps {
  tenant: string
  initialData: CustomerReportRow[]
}

export function CustomerReportView({ tenant, initialData }: CustomerReportViewProps) {
  const { data: customers } = useCustomerReport(tenant, initialData)
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customer Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Customer Report" }]} />
      <DataTable columns={columns} data={customers} rowKey={(c) => c.id} selectable={false} searchPlaceholder="Search customers..." getSearchValue={(c) => c.name} />
    </div>
  )
}
