"use client"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { useSupplierReport } from "../client/useReports"
import type { SupplierReportRow } from "../api/reports.action"

const columns: DataTableColumn<SupplierReportRow>[] = [
  {
    key: "name",
    header: "Supplier",
    render: (s) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {s.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium">{s.name}</span>
      </div>
    ),
  },
  { key: "location", header: "Location", render: (s) => s.location ?? "—" },
  { key: "due", header: "Due Amount", render: (s) => `$${s.totalDue.toLocaleString()}` },
  { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
]

interface SupplierReportViewProps {
  tenant: string
  initialData: SupplierReportRow[]
}

export function SupplierReportView({ tenant, initialData }: SupplierReportViewProps) {
  const { data: suppliers } = useSupplierReport(tenant, initialData)
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Supplier Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Supplier Report" }]} />
      <DataTable columns={columns} data={suppliers} rowKey={(s) => s.id} selectable={false} searchPlaceholder="Search suppliers..." getSearchValue={(s) => s.name} />
    </div>
  )
}
