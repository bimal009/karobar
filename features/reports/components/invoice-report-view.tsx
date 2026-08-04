"use client"

import { CheckCircle2, Clock, FileText, Receipt } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { useInvoiceReport } from "../client/useReports"
import type { InvoiceReportData, InvoiceRow } from "../api/reports.action"

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
  initialData: InvoiceReportData
}

export function InvoiceReportView({ tenant, initialData }: InvoiceReportViewProps) {
  const { data } = useInvoiceReport(tenant, initialData)
  const { rows, totalInvoices, totalAmount, paidCount, dueCount } = data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Invoice Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Invoice Report" }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Invoices</p><p className="text-xl font-bold">{totalInvoices}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Receipt className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Amount</p><p className="text-xl font-bold">${totalAmount.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><CheckCircle2 className="size-5" /></div><div><p className="text-xs text-muted-foreground">Paid</p><p className="text-xl font-bold">{paidCount}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><Clock className="size-5" /></div><div><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold">{dueCount}</p></div></CardContent></Card>
      </div>
      <DataTable columns={columns} data={rows} rowKey={(o) => o.id} selectable={false} searchPlaceholder="Search invoices..." getSearchValue={(o) => `${o.orderNo} ${o.customerName}`} />
    </div>
  )
}
