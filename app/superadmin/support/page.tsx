import { LifeBuoy, Mail, MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/layout/page-shell"

const tickets = [
  { id: "TCK-1042", subject: "Unable to transfer stock between warehouses", tenant: "Urban Mart", status: "pending" as const },
  { id: "TCK-1041", subject: "Requesting plan upgrade to Enterprise", tenant: "TechStop Electronics", status: "active" as const },
  { id: "TCK-1039", subject: "Billing invoice discrepancy for July", tenant: "North Hardware Co.", status: "completed" as const },
  { id: "TCK-1035", subject: "Cannot invite new staff member", tenant: "Bella Boutique", status: "pending" as const },
]

export default function SuperAdminSupportPage() {
  return (
    <PageShell pageName="Support">
    <div className="flex flex-col gap-6">
      <PageHeader title="Support" crumbs={[{ label: "Dashboard", href: "/superadmin" }, { label: "Support" }]} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LifeBuoy className="size-5" />
            </div>
            <div>
              <p className="text-lg font-bold">{tickets.length}</p>
              <p className="text-sm text-muted-foreground">Open tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="size-5" />
            </div>
            <div>
              <p className="text-lg font-bold">2.4h</p>
              <p className="text-sm text-muted-foreground">Avg. response time</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageCircle className="size-5" />
            </div>
            <div>
              <p className="text-lg font-bold">96%</p>
              <p className="text-sm text-muted-foreground">Satisfaction score</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 p-0">
        <div className="border-b p-4">
          <h3 className="font-semibold">Recent tickets</h3>
        </div>
        <div className="divide-y">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {ticket.id} · {ticket.tenant}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={ticket.status} />
                <Button size="sm" variant="outline">
                  Reply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
    </PageShell>
  )
}
