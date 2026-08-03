"use client"

import { use } from "react"
import Link from "next/link"
import { Pencil, Plus, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { FormSheet } from "@/components/shared/form-sheet"
import { FieldRow } from "@/components/shared/field-row"
import { getBranches } from "@/lib/dummy-data"
import { getUsersByBranch } from "@/lib/dummy-data/users"
import type { Branch } from "@/lib/types"

export default function BranchesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const branches = getBranches()

  const columns: DataTableColumn<Branch>[] = [
    {
      key: "name",
      header: "Branch",
      render: (b) => (
        <div>
          <div className="flex items-center gap-2 font-medium">
            {b.name}
            {b.isMain && <Badge variant="secondary">Main</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">{b.code}</p>
        </div>
      ),
    },
    { key: "location", header: "Location", render: (b) => b.location },
    { key: "phone", header: "Phone", render: (b) => b.phone },
    { key: "manager", header: "Manager", render: (b) => b.managerName },
    {
      key: "members",
      header: "Members",
      render: (b) => (
        <Link href={`/${tenant}/branches/members?branch=${b.id}`} className="flex items-center gap-1.5 text-primary hover:underline">
          <Users className="size-3.5" /> {getUsersByBranch(b.id).length}
        </Link>
      ),
    },
    { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: () => (
        <div className="flex justify-end gap-1">
          <IconButton label="Edit" size="icon-sm" variant="ghost">
            <Pencil />
            </IconButton>
          <IconButton label="Delete" size="icon-sm" variant="ghost">
            <Trash2 className="text-destructive" />
            </IconButton>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Branches"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Branches" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> Add Branch</Button>}
            title="Add Branch"
            description="Create a new branch location for this store."
            submitLabel="Add Branch"
          >
            <FieldRow label="Branch Name" required htmlFor="branch-name">
              <Input id="branch-name" placeholder="e.g. Downtown Branch" required />
            </FieldRow>
            <FieldRow label="Branch Code" required htmlFor="branch-code">
              <Input id="branch-code" placeholder="e.g. BR-DT" required />
            </FieldRow>
            <FieldRow label="Manager" required htmlFor="branch-manager">
              <Input id="branch-manager" placeholder="e.g. James Carter" required />
            </FieldRow>
            <FieldRow label="Phone" required htmlFor="branch-phone">
              <Input id="branch-phone" placeholder="+1 202-555-0100" required />
            </FieldRow>
            <FieldRow label="Location" htmlFor="branch-location">
              <Input id="branch-location" placeholder="e.g. 5th Avenue, New York" />
            </FieldRow>
            <FieldRow label="Status">
              <Select defaultValue="active">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
          </FormSheet>
        }
      />
      <DataTable
        columns={columns}
        data={branches}
        rowKey={(b) => b.id}
        searchPlaceholder="Search branches..."
        getSearchValue={(b) => `${b.name} ${b.code} ${b.location} ${b.managerName}`}
      />
    </div>
  )
}
