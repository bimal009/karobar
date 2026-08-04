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
import type { Supplier } from "@/lib/database/schemas"
import { SupplierFormInput, SupplierInsert, supplierInsertSchema } from "@/lib/database/zod/suppliers"
import { useCreateSupplier, useUpdateSupplier } from "../client/useSupplier"

interface SupplierFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  supplier?: Supplier
}

export function SupplierFormSheet({ tenant, trigger, supplier }: SupplierFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const isEdit = Boolean(supplier)

  const { mutateAsync: create, isPending: isCreating } = useCreateSupplier(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateSupplier(tenant)
  const isPending = isCreating || isUpdating

  const form = useForm<SupplierFormInput, unknown, SupplierInsert>({
    resolver: zodResolver(supplierInsertSchema),
    defaultValues: {
      name: supplier?.name ?? "",
      email: supplier?.email ?? undefined,
      phone: supplier?.phone ?? undefined,
      location: supplier?.location ?? undefined,
      totalDue: supplier?.totalDue ? Number(supplier.totalDue) : 0,
      status: supplier?.status ?? "active",
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

  async function onSubmit(values: SupplierInsert) {
    const promise = (isEdit ? update({ id: supplier!.id, data: values }) : create(values)).then(
      (result) => {
        if (result.error) throw new Error(result.message)
        return result
      }
    )

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating supplier..." : "Creating supplier...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Supplier updated successfully!" : "Supplier created successfully!",
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
            <SheetTitle>{isEdit ? "Edit Supplier" : "Add Supplier"}</SheetTitle>
            <SheetDescription>
              {isEdit ? "Update this supplier's details." : "Add a new supplier you purchase inventory from."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Supplier Name" required htmlFor="sup-name">
              <Input id="sup-name" placeholder="e.g. Global Supply Co." disabled={isPending} {...register("name")} />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
            </FieldRow>
            <FieldRow label="Email" htmlFor="sup-email">
              <Input id="sup-email" type="email" placeholder="supplier@example.com" disabled={isPending} {...register("email")} />
              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </FieldRow>
            <FieldRow label="Phone" htmlFor="sup-phone">
              <Input id="sup-phone" placeholder="+1 202-555-0100" disabled={isPending} {...register("phone")} />
            </FieldRow>
            <FieldRow label="Location" htmlFor="sup-location">
              <Input id="sup-location" placeholder="e.g. Newark, US" disabled={isPending} {...register("location")} />
            </FieldRow>
            <FieldRow label="Total Due" htmlFor="sup-due">
              <Input
                id="sup-due"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                disabled={isPending}
                {...register("totalDue")}
              />
              {errors.totalDue && <p className="text-sm font-medium text-destructive">{errors.totalDue.message}</p>}
            </FieldRow>
            <FieldRow label="Status">
              <Select
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
              {isEdit ? "Save Changes" : "Add Supplier"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
