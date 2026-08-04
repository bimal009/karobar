"use client"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { useInvoiceReport } from "../client/useReports"
import type { InvoiceRow } from "../api/reports.action"

const columns: DataTableColumn<InvoiceRow>[] = [
  { key: "invoice", header: "Invoice No", render: (o) => <span className="font-medium">{o.orderNo}</span> },
  { key: "customer", header: "Customer", render: (o) => o.customerName },
  { key: "date", header: "Date", render: (o) => new Date(o.createdAt).toLocaleDateString() },
  { key: "biller", header: "Biller", render: (o) => o.billerName },
  { key: "amount", header: "Amount", render: (o) => `$${o.total.toFixed(2)}` },
  { key: "payment", header: "Payment", render: (o) => <span className="capitalize">{o.paymentMethod}</span> },
  { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
]

interface InvoiceReportViewProps {
  tenant: string
  initialData: InvoiceRow[]
}

export function InvoiceReportView({ tenant, initialData }: InvoiceReportViewProps) {
  const { data: orders } = useInvoiceReport(tenant, initialData)
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Invoice Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Invoice Report" }]} />
      <DataTable columns={columns} data={orders} rowKey={(o) => o.id} selectable={false} searchPlaceholder="Search invoices..." getSearchValue={(o) => `${o.orderNo} ${o.customerName}`} />
    </div>
  )
}
