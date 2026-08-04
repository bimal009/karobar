"use client"

import { DollarSign, TrendingUp, UserCheck, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { useCustomerReport } from "../client/useReports"
import type { CustomerReportData, CustomerReportRow } from "../api/reports.action"

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
  initialData: CustomerReportData
}

export function CustomerReportView({ tenant, initialData }: CustomerReportViewProps) {
  const { data } = useCustomerReport(tenant, initialData)
  const { rows, totalCustomers, activeCustomers, totalSpent, avgSpent } = data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customer Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Customer Report" }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Users className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Customers</p><p className="text-xl font-bold">{totalCustomers}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><UserCheck className="size-5" /></div><div><p className="text-xs text-muted-foreground">Active Customers</p><p className="text-xl font-bold">{activeCustomers}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><DollarSign className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Spent</p><p className="text-xl font-bold">${totalSpent.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><TrendingUp className="size-5" /></div><div><p className="text-xs text-muted-foreground">Avg. Spent</p><p className="text-xl font-bold">${avgSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div></CardContent></Card>
      </div>
      <DataTable columns={columns} data={rows} rowKey={(c) => c.id} selectable={false} searchPlaceholder="Search customers..." getSearchValue={(c) => c.name} />
    </div>
  )
}
