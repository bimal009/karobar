"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { Loader2, ShieldCheck } from "lucide-react"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { PERMISSION_GROUPS, type PermissionUpdate } from "@/lib/database/zod/roles"
import type { StoreRole } from "@/lib/database/schemas"
import { useUpdateRolePermissions } from "../client/useRoles"

function humanize(key: string) {
  return key.replace(/^can/, "").replace(/([A-Z])/g, " $1").trim()
}

interface PermissionsSheetProps {
  tenant: string
  role: StoreRole
  trigger: React.ReactElement
}

export function PermissionsSheet({ tenant, role, trigger }: PermissionsSheetProps) {
  const [open, setOpen] = React.useState(false)
  const { mutateAsync, isPending } = useUpdateRolePermissions(tenant)

  const defaultValues = React.useMemo<PermissionUpdate>(() => {
    const values = {} as PermissionUpdate
    for (const group of PERMISSION_GROUPS) {
      for (const key of group.keys) {
        values[key] = Boolean(role[key])
      }
    }
    return values
  }, [role])

  const { control, handleSubmit, reset } = useForm<PermissionUpdate>({ defaultValues })

  React.useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) reset(defaultValues)
  }

  async function onSubmit(values: PermissionUpdate) {
    const promise = mutateAsync({ id: role.id, data: values }).then((result) => {
      if (result.error) throw new Error(result.message)
      return result
    })

    toast.promise(promise, {
      loading: { title: "Saving permissions...", type: "loading" },
      success: { title: "Success", description: "Permissions updated successfully!", type: "success" },
      error: (err: Error) => ({ title: "Update failed", description: err.message, type: "error" }),
    })

    try {
      await promise
      setOpen(false)
    } catch {
      // toast already surfaced the error
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={trigger} />
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4" /> Permissions — {role.name}
            </SheetTitle>
            <SheetDescription>Choose what members with this role are allowed to do.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-2">
                <p className="text-sm font-semibold">{group.title}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border p-3">
                  {group.keys.map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <Controller
                        control={control}
                        name={key}
                        render={({ field }) => (
                          <Checkbox
                            id={key}
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                            disabled={isPending}
                          />
                        )}
                      />
                      <Label htmlFor={key} className="text-sm font-normal">
                        {humanize(key)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <SheetClose render={<Button type="button" variant="outline" disabled={isPending} />}>
              Cancel
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Save Permissions
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
