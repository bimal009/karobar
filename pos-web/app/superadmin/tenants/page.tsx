"use client"

import Link from "next/link"
import { Download, Eye, MoreHorizontal, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { FormSheet } from "@/components/shared/form-sheet"
import { FieldRow } from "@/components/shared/field-row"
import { tenants } from "@/lib/dummy-data"
import type { Tenant } from "@/lib/types"

const columns: DataTableColumn<Tenant>[] = [
  {
    key: "name",
    header: "Tenant",
    render: (t) => (
      <div className="flex items-center gap-3">
        <div className={`flex size-9 items-center justify-center rounded-lg text-sm font-bold text-white ${t.logoColor}`}>
          {t.logoInitial}
        </div>
        <div>
          <p className="font-medium">{t.name}</p>
          <p className="text-xs text-muted-foreground">/{t.slug}</p>
        </div>
      </div>
    ),
  },
  {
    key: "owner",
    header: "Owner",
    render: (t) => (
      <div>
        <p>{t.ownerName}</p>
        <p className="text-xs text-muted-foreground">{t.ownerEmail}</p>
      </div>
    ),
  },
  { key: "plan", header: "Plan", render: (t) => <span className="capitalize">{t.plan}</span> },
  { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
  { key: "users", header: "Users", render: (t) => t.usersCount },
  { key: "stores", header: "Stores", render: (t) => t.storesCount },
  { key: "mrr", header: "MRR", render: (t) => `$${t.mrr}` },
  { key: "country", header: "Country", render: (t) => t.country },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: (t) => (
      <div className="flex justify-end gap-1">
        <IconButton label="View dashboard" size="icon-sm" variant="ghost" render={<Link href={`/${t.slug}/dashboard`} />}>
          <Eye />
        </IconButton>
        <IconButton label="Manage" size="icon-sm" variant="ghost">
          <Settings />
        </IconButton>
        <IconButton label="More" size="icon-sm" variant="ghost">
          <MoreHorizontal />
        </IconButton>
      </div>
    ),
  },
]

export default function TenantsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tenants"
        crumbs={[{ label: "Dashboard", href: "/superadmin" }, { label: "Tenants" }]}
        actions={
          <>
            <Button variant="outline">
              <Download /> Export
            </Button>
            <FormSheet
              trigger={
                <Button>
                  <Plus /> Add Tenant
                </Button>
              }
              title="Add Tenant"
              description="Onboard a new business workspace onto the platform."
              submitLabel="Create Tenant"
            >
              <FieldRow label="Business Name" required htmlFor="tenant-name">
                <Input id="tenant-name" placeholder="e.g. Acme Retail" required />
              </FieldRow>
              <FieldRow label="Workspace Slug" required htmlFor="tenant-slug">
                <Input id="tenant-slug" placeholder="e.g. acme-retail" required />
              </FieldRow>
              <FieldRow label="Owner Name" required htmlFor="tenant-owner">
                <Input id="tenant-owner" placeholder="e.g. Sarah Johnson" required />
              </FieldRow>
              <FieldRow label="Owner Email" required htmlFor="tenant-owner-email">
                <Input id="tenant-owner-email" type="email" placeholder="owner@example.com" required />
              </FieldRow>
              <FieldRow label="Plan">
                <Select defaultValue="starter">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
            </FormSheet>
          </>
        }
      />
      <DataTable
        columns={columns}
        data={tenants}
        rowKey={(t) => t.id}
        searchPlaceholder="Search tenants..."
        getSearchValue={(t) => `${t.name} ${t.ownerName} ${t.slug}`}
        filters={
          <Select defaultValue="all">
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="growth">Growth</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  )
}
