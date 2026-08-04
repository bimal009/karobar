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
import type { Customer } from "@/lib/database/schemas"
import { CustomerInsert, customerInsertSchema } from "@/lib/database/zod/customers"
import { useCreateCustomer, useUpdateCustomer } from "../client/useCustomer"

interface CustomerFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  customer?: Customer
}

export function CustomerFormSheet({ tenant, trigger, customer }: CustomerFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const isEdit = Boolean(customer)

  const { mutateAsync: create, isPending: isCreating } = useCreateCustomer(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateCustomer(tenant)
  const isPending = isCreating || isUpdating

  const form = useForm<CustomerInsert>({
    resolver: zodResolver(customerInsertSchema),
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? undefined,
      phone: customer?.phone ?? undefined,
      location: customer?.location ?? undefined,
      status: customer?.status ?? "active",
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

  async function onSubmit(values: CustomerInsert) {
    const promise = (isEdit ? update({ id: customer!.id, data: values }) : create(values)).then(
      (result) => {
        if (result.error) throw new Error(result.message)
        return result
      }
    )

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating customer..." : "Creating customer...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Customer updated successfully!" : "Customer created successfully!",
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
            <SheetTitle>{isEdit ? "Edit Customer" : "Add Customer"}</SheetTitle>
            <SheetDescription>
              {isEdit ? "Update this customer's details." : "Add a new customer to this store's directory."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Full Name" required htmlFor="cust-name">
              <Input id="cust-name" placeholder="e.g. Robert Fox" disabled={isPending} {...register("name")} />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
            </FieldRow>
            <FieldRow label="Email" htmlFor="cust-email">
              <Input id="cust-email" type="email" placeholder="customer@example.com" disabled={isPending} {...register("email")} />
              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </FieldRow>
            <FieldRow label="Phone" htmlFor="cust-phone">
              <Input id="cust-phone" placeholder="+1 202-555-0100" disabled={isPending} {...register("phone")} />
            </FieldRow>
            <FieldRow label="Location" htmlFor="cust-location">
              <Input id="cust-location" placeholder="e.g. New York, US" disabled={isPending} {...register("location")} />
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
              {isEdit ? "Save Changes" : "Add Customer"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
