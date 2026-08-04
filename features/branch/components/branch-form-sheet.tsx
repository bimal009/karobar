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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldRow } from "@/components/shared/field-row"
import { toast } from "@/components/ui/toast"
import type { Branch } from "@/lib/database/schemas"
import { BranchInsert, branchInsertSchema } from "@/lib/database/zod/branches"
import { useCreateBranch, useUpdateBranch } from "../client/useBranch"

interface BranchFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  branch?: Branch
}

export function BranchFormSheet({ tenant, trigger, branch }: BranchFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const isEdit = Boolean(branch)

  const { mutateAsync: create, isPending: isCreating } = useCreateBranch(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateBranch(tenant)
  const isPending = isCreating || isUpdating

  const form = useForm<BranchInsert>({
    resolver: zodResolver(branchInsertSchema),
    defaultValues: {
      name: branch?.name ?? "",
      code: branch?.code ?? "",
      phone: branch?.phone ?? undefined,
      email: branch?.email ?? undefined,
      address: branch?.address ?? undefined,
      city: branch?.city ?? undefined,
      state: branch?.state ?? undefined,
      country: branch?.country ?? undefined,
      postalCode: branch?.postalCode ?? undefined,
      isMain: branch?.isMain ?? false,
      status: branch?.status ?? "active",
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) reset()
  }

  async function onSubmit(values: BranchInsert) {
    const promise = (isEdit ? update({ id: branch!.id, data: values }) : create(values)).then(
      (result) => {
        if (result.error) throw new Error(result.message)
        return result
      }
    )

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating branch..." : "Creating branch...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Branch updated successfully!" : "Branch created successfully!",
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
            <SheetTitle>{isEdit ? "Edit Branch" : "Add Branch"}</SheetTitle>
            <SheetDescription>
              {isEdit ? "Update this branch's details." : "Create a new branch location for this store."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Branch Name" required htmlFor="branch-name">
              <Input id="branch-name" placeholder="e.g. Downtown Branch" disabled={isPending} {...register("name")} />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
            </FieldRow>
            <FieldRow label="Branch Code" required htmlFor="branch-code">
              <Input id="branch-code" placeholder="e.g. BR-DT" disabled={isPending} {...register("code")} />
              {errors.code && <p className="text-sm font-medium text-destructive">{errors.code.message}</p>}
            </FieldRow>
            <FieldRow label="Phone" htmlFor="branch-phone">
              <Input id="branch-phone" placeholder="+1 202-555-0100" disabled={isPending} {...register("phone")} />
            </FieldRow>
            <FieldRow label="Email" htmlFor="branch-email">
              <Input id="branch-email" type="email" placeholder="branch@example.com" disabled={isPending} {...register("email")} />
              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </FieldRow>
            <FieldRow label="Address" htmlFor="branch-address">
              <Input id="branch-address" placeholder="e.g. 5th Avenue" disabled={isPending} {...register("address")} />
            </FieldRow>
            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="City" htmlFor="branch-city">
                <Input id="branch-city" disabled={isPending} {...register("city")} />
              </FieldRow>
              <FieldRow label="State" htmlFor="branch-state">
                <Input id="branch-state" disabled={isPending} {...register("state")} />
              </FieldRow>
              <FieldRow label="Country" htmlFor="branch-country">
                <Input id="branch-country" disabled={isPending} {...register("country")} />
              </FieldRow>
              <FieldRow label="Postal Code" htmlFor="branch-postal">
                <Input id="branch-postal" disabled={isPending} {...register("postalCode")} />
              </FieldRow>
            </div>
            <FieldRow label="Status">
              <Select
                items={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as "active" | "inactive")}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Main Branch</p>
                <p className="text-xs text-muted-foreground">Mark this as the store&apos;s primary branch.</p>
              </div>
              <Switch
                checked={watch("isMain") ?? false}
                onCheckedChange={(checked) => setValue("isMain", checked)}
                disabled={isPending}
              />
            </div>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <SheetClose render={<Button type="button" variant="outline" disabled={isPending} />}>
              Cancel
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {isEdit ? "Save Changes" : "Add Branch"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
