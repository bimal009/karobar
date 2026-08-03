"use client"

import { parseAsString, useQueryState } from "nuqs"
import { Mail, Phone, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { getBranches, users } from "@/lib/dummy-data"
import type { AppUser } from "@/lib/types"

const columns: DataTableColumn<AppUser>[] = [
  {
    key: "name",
    header: "Member",
    render: (u) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {u.avatarInitial}
        </div>
        <div>
          <p className="font-medium">{u.name}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="size-3" /> {u.email}
          </p>
        </div>
      </div>
    ),
  },
  { key: "role", header: "Role", render: (u) => <span className="capitalize">{u.role}</span> },
  {
    key: "phone",
    header: "Phone",
    render: (u) => (
      <span className="flex items-center gap-1.5">
        <Phone className="size-3.5 text-muted-foreground" /> {u.phone}
      </span>
    ),
  },
  { key: "joined", header: "Joined", render: (u) => u.joinedAt },
  { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
]

export default function BranchMembersPage() {
  const branches = getBranches()
  const [branchFilter, setBranchFilter] = useQueryState("branch", parseAsString.withDefault("all"))

  const filteredUsers = branchFilter === "all" ? users : users.filter((u) => u.branchId === branchFilter)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Branch Members"
        crumbs={[{ label: "Branches" }, { label: "Members" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> Add Member</Button>}
            title="Add Branch Member"
            description="Add a staff member and assign them to a branch."
            submitLabel="Add Member"
          >
            <FieldRow label="Full Name" required htmlFor="member-name">
              <Input id="member-name" placeholder="e.g. Olivia Brown" required />
            </FieldRow>
            <FieldRow label="Email" required htmlFor="member-email">
              <Input id="member-email" type="email" placeholder="staff@example.com" required />
            </FieldRow>
            <FieldRow label="Phone" required htmlFor="member-phone">
              <Input id="member-phone" placeholder="+1 202-555-0100" required />
            </FieldRow>
            <FieldRow label="Branch" required>
              <Select required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Role" required>
              <Select defaultValue="cashier">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
          </FormSheet>
        }
      />
      <DataTable
        columns={columns}
        data={filteredUsers}
        rowKey={(u) => u.id}
        searchPlaceholder="Search members..."
        getSearchValue={(u) => `${u.name} ${u.email} ${u.role}`}
        filters={
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger size="sm" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </div>
  )
}
