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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldRow } from "@/components/shared/field-row"
import { toast } from "@/components/ui/toast"
import type { Warehouse } from "@/lib/database/schemas"
import { WarehouseInsert, warehouseInsertSchema } from "@/lib/database/zod/warehouses"
import { useCreateWarehouse, useUpdateWarehouse } from "../client/useWarehouse"

interface WarehouseFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  warehouse?: Warehouse
}

export function WarehouseFormSheet({ tenant, trigger, warehouse }: WarehouseFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const isEdit = Boolean(warehouse)

  const { mutateAsync: create, isPending: isCreating } = useCreateWarehouse(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateWarehouse(tenant)
  const isPending = isCreating || isUpdating

  const form = useForm<WarehouseInsert>({
    resolver: zodResolver(warehouseInsertSchema),
    defaultValues: {
      name: warehouse?.name ?? "",
      contactPerson: warehouse?.contactPerson ?? undefined,
      email: warehouse?.email ?? undefined,
      phone: warehouse?.phone ?? undefined,
      location: warehouse?.location ?? undefined,
      status: warehouse?.status ?? "active",
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

  async function onSubmit(values: WarehouseInsert) {
    const promise = (isEdit ? update({ id: warehouse!.id, data: values }) : create(values)).then(
      (result) => {
        if (result.error) throw new Error(result.message)
        return result
      }
    )

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating warehouse..." : "Creating warehouse...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Warehouse updated successfully!" : "Warehouse created successfully!",
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
            <SheetTitle>{isEdit ? "Edit Warehouse" : "Add Warehouse"}</SheetTitle>
            <SheetDescription>
              {isEdit ? "Update this warehouse's details." : "Register a new storage warehouse."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Warehouse Name" required htmlFor="wh-name">
              <Input id="wh-name" placeholder="e.g. Central Warehouse" disabled={isPending} {...register("name")} />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
            </FieldRow>
            <FieldRow label="Contact Person" htmlFor="wh-contact">
              <Input id="wh-contact" placeholder="e.g. Michael Scott" disabled={isPending} {...register("contactPerson")} />
            </FieldRow>
            <FieldRow label="Email" htmlFor="wh-email">
              <Input id="wh-email" type="email" placeholder="warehouse@example.com" disabled={isPending} {...register("email")} />
              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </FieldRow>
            <FieldRow label="Phone" htmlFor="wh-phone">
              <Input id="wh-phone" placeholder="+1 202-555-0100" disabled={isPending} {...register("phone")} />
            </FieldRow>
            <FieldRow label="Location" htmlFor="wh-location">
              <Input id="wh-location" placeholder="e.g. Industrial Zone, Newark" disabled={isPending} {...register("location")} />
            </FieldRow>
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
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <SheetClose render={<Button type="button" variant="outline" disabled={isPending} />}>
              Cancel
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {isEdit ? "Save Changes" : "Add Warehouse"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
