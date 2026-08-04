"use client"

import { parseAsString, useQueryState } from "nuqs"
import { Mail, Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconButton } from "@/components/shared/icon-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import { MemberFormSheet } from "./member-form-sheet"
import { useDeleteMember, useMemberFormOptions, useMembers } from "../client/useMembers"
import type { MemberFormOptions, MemberRow } from "../api/member.action"

interface MembersViewProps {
  tenant: string
  initialData: MemberRow[]
  initialOptions: MemberFormOptions
}

export function MembersView({ tenant, initialData, initialOptions }: MembersViewProps) {
  const { data: members } = useMembers(tenant, initialData)
  const { data: options } = useMemberFormOptions(tenant, initialOptions)
  const { mutateAsync: deleteMember, isPending: isDeleting } = useDeleteMember(tenant)
  const [branchFilter, setBranchFilter] = useQueryState("branch", parseAsString.withDefault("all"))
  const [roleFilter, setRoleFilter] = useQueryState("role", parseAsString.withDefault("all"))

  const filteredMembers = members
    .filter((m) => branchFilter === "all" || m.branches.some((b) => b.id === branchFilter))
    .filter((m) => roleFilter === "all" || m.roleId === roleFilter)

  async function handleDelete(id: string) {
    const result = await deleteMember(id)
    if (!result.error) {
      toast.add({ title: "Member removed", type: "success" })
    } else {
      toast.add({ title: "Failed to remove member", description: result.message, type: "error" })
    }
  }

  const columns: DataTableColumn<MemberRow>[] = [
    {
      key: "name",
      header: "Member",
      render: (m) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {m.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{m.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="size-3" /> {m.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (m) => (
        <div className="flex items-center gap-1.5">
          {m.roleName}
          {m.isSystemRole && <Badge variant="secondary">System</Badge>}
        </div>
      ),
    },
    {
      key: "branches",
      header: "Branches",
      render: (m) => (
        <div className="flex flex-wrap gap-1">
          {m.branches.length ? (
            m.branches.map((b) => (
              <Badge key={b.id} variant="outline">
                {b.name}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (m) => new Date(m.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (m) => (
        <div className="flex justify-end gap-1">
          <MemberFormSheet
            tenant={tenant}
            member={m}
            trigger={
              <IconButton label="Edit" size="icon-sm" variant="ghost">
                <Pencil />
              </IconButton>
            }
          />
          <ConfirmDeleteDialog
            trigger={
              <IconButton label="Remove" size="icon-sm" variant="ghost">
                <Trash2 className="text-destructive" />
              </IconButton>
            }
            title={`Remove ${m.name}?`}
            description="This will remove their access to this store and all its branches."
            isPending={isDeleting}
            onConfirm={() => handleDelete(m.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Branch Members"
        crumbs={[{ label: "Branches", href: `/${tenant}/branches` }, { label: "Members" }]}
        actions={
          <MemberFormSheet
            tenant={tenant}
            trigger={
              <Button>
                <Plus /> Add Member
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={filteredMembers}
        rowKey={(m) => m.id}
        searchPlaceholder="Search members..."
        getSearchValue={(m) => `${m.name} ${m.email} ${m.roleName}`}
        filters={
          <>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
              <SelectTrigger size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {options?.roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={branchFilter} onValueChange={(value) => setBranchFilter(value)}>
              <SelectTrigger size="sm" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {options?.branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
    </div>
  )
}
