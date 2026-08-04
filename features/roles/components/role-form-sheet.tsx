"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
import { FieldRow } from "@/components/shared/field-row"
import { toast } from "@/components/ui/toast"
import type { StoreRole } from "@/lib/database/schemas"
import { RoleInsert, roleInsertSchema } from "@/lib/database/zod/roles"
import { useCreateRole, useUpdateRole } from "../client/useRoles"

interface RoleFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  role?: StoreRole
}

export function RoleFormSheet({ tenant, trigger, role }: RoleFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const isEdit = Boolean(role)

  const { mutateAsync: create, isPending: isCreating } = useCreateRole(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateRole(tenant)
  const isPending = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleInsert>({
    resolver: zodResolver(roleInsertSchema),
    defaultValues: {
      name: role?.name ?? "",
      description: role?.description ?? undefined,
    },
  })

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) reset()
  }

  async function onSubmit(values: RoleInsert) {
    const promise = (isEdit ? update({ id: role!.id, data: values }) : create(values)).then(
      (result) => {
        if (result.error) throw new Error(result.message)
        return result
      }
    )

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating role..." : "Creating role...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Role updated successfully!" : "Role created successfully!",
        type: "success",
      },
      error: (err: Error) => ({
        title: isEdit ? "Update failed" : "Creation failed",
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
            <SheetTitle>{isEdit ? "Edit Role" : "Add Role"}</SheetTitle>
            <SheetDescription>
              {isEdit ? "Update this role's name and description." : "Create a new role. You can configure its permissions afterwards."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Role Name" required htmlFor="role-name">
              <Input id="role-name" placeholder="e.g. Store Manager" disabled={isPending} {...register("name")} />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
            </FieldRow>
            <FieldRow label="Description" htmlFor="role-description">
              <Textarea
                id="role-description"
                placeholder="What can this role do?"
                disabled={isPending}
                {...register("description")}
              />
            </FieldRow>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <SheetClose render={<Button type="button" variant="outline" disabled={isPending} />}>
              Cancel
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {isEdit ? "Save Changes" : "Add Role"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
