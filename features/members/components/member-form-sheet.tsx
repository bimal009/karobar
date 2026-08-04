"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldRow } from "@/components/shared/field-row"
import { toast } from "@/components/ui/toast"
import { MemberInsert, memberInsertSchema } from "@/lib/database/zod/members"
import { useCreateMember, useMemberFormOptions, useUpdateMember } from "../client/useMembers"
import type { MemberRow } from "../api/member.action"

interface MemberFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  member?: MemberRow
}

export function MemberFormSheet({ tenant, trigger, member }: MemberFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const isEdit = Boolean(member)

  const { data: options } = useMemberFormOptions(tenant)
  const { mutateAsync: create, isPending: isCreating } = useCreateMember(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateMember(tenant)
  const isPending = isCreating || isUpdating

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberInsert>({
    resolver: isEdit ? undefined : zodResolver(memberInsertSchema),
    defaultValues: {
      email: "",
      roleId: member?.roleId ?? "",
      branchId: member?.branch?.id ?? null,
    },
  })

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) reset()
  }

  async function onSubmit(values: MemberInsert) {
    const promise = (
      isEdit
        ? update({ id: member!.id, data: { roleId: values.roleId, branchId: values.branchId } })
        : create(values)
    ).then((result) => {
      if (result.error) throw new Error(result.message)
      return result
    })

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating member..." : "Adding member...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Member updated successfully!" : "Member added successfully!",
        type: "success",
      },
      error: (err: Error) => ({
        title: isEdit ? "Update failed" : "Failed to add member",
        description: err.message,
        type: "error",
      }),
    })

    try {
      await promise
      setOpen(false)
      reset()
    } catch {
      // toast already surfaced the error
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={trigger} />
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <SheetHeader className="border-b">
            <SheetTitle>{isEdit ? "Edit Member" : "Add Member"}</SheetTitle>
            <SheetDescription>
              {isEdit
                ? "Update this member's role and branch assignments."
                : "Add an existing platform user to this store by their email."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            {isEdit ? (
              <FieldRow label="Member">
                <p className="text-sm font-medium">{member!.name}</p>
                <p className="text-xs text-muted-foreground">{member!.email}</p>
              </FieldRow>
            ) : (
              <FieldRow label="Email" required htmlFor="member-email">
                <Input
                  id="member-email"
                  type="email"
                  placeholder="staff@example.com"
                  disabled={isPending}
                  {...register("email")}
                />
                {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
              </FieldRow>
            )}
            <FieldRow label="Role" required>
              <Controller
                control={control}
                name="roleId"
                render={({ field }) => (
                  <Select
                    items={options?.roles.map((r) => ({ value: r.id, label: r.name })) ?? []}
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.roleId && <p className="text-sm font-medium text-destructive">{errors.roleId.message}</p>}
            </FieldRow>
            <FieldRow label="Branch">
              <Controller
                control={control}
                name="branchId"
                render={({ field }) => (
                  <Select
                    items={[
                      { value: "none", label: "No branch" },
                      ...(options?.branches.map((b) => ({ value: b.id, label: b.name })) ?? []),
                    ]}
                    value={field.value ?? "none"}
                    onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No branch</SelectItem>
                      {options?.branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldRow>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <SheetClose render={<Button type="button" variant="outline" disabled={isPending} />}>
              Cancel
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {isEdit ? "Save Changes" : "Add Member"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
