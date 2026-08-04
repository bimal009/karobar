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
import type { StoreLocation } from "@/lib/database/schemas"
import { StoreLocationInsert, storeLocationInsertSchema } from "@/lib/database/zod/store-locations"
import { useCreateStoreLocation, useUpdateStoreLocation } from "../client/useStoreLocation"

interface StoreLocationFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  store?: StoreLocation
}

export function StoreLocationFormSheet({ tenant, trigger, store }: StoreLocationFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const isEdit = Boolean(store)

  const { mutateAsync: create, isPending: isCreating } = useCreateStoreLocation(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateStoreLocation(tenant)
  const isPending = isCreating || isUpdating

  const form = useForm<StoreLocationInsert>({
    resolver: zodResolver(storeLocationInsertSchema),
    defaultValues: {
      name: store?.name ?? "",
      manager: store?.manager ?? undefined,
      email: store?.email ?? undefined,
      phone: store?.phone ?? undefined,
      location: store?.location ?? undefined,
      status: store?.status ?? "active",
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

  async function onSubmit(values: StoreLocationInsert) {
    const promise = (isEdit ? update({ id: store!.id, data: values }) : create(values)).then(
      (result) => {
        if (result.error) throw new Error(result.message)
        return result
      }
    )

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating store..." : "Creating store...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Store updated successfully!" : "Store created successfully!",
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
            <SheetTitle>{isEdit ? "Edit Store" : "Add Store"}</SheetTitle>
            <SheetDescription>
              {isEdit ? "Update this store location's details." : "Register a new physical store location."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Store Name" required htmlFor="store-name">
              <Input id="store-name" placeholder="e.g. Downtown Store" disabled={isPending} {...register("name")} />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
            </FieldRow>
            <FieldRow label="Manager" htmlFor="store-manager">
              <Input id="store-manager" placeholder="e.g. James Carter" disabled={isPending} {...register("manager")} />
            </FieldRow>
            <FieldRow label="Email" htmlFor="store-email">
              <Input id="store-email" type="email" placeholder="store@example.com" disabled={isPending} {...register("email")} />
              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </FieldRow>
            <FieldRow label="Phone" htmlFor="store-phone">
              <Input id="store-phone" placeholder="+1 202-555-0100" disabled={isPending} {...register("phone")} />
            </FieldRow>
            <FieldRow label="Location" htmlFor="store-location">
              <Input id="store-location" placeholder="e.g. 5th Avenue, New York" disabled={isPending} {...register("location")} />
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
              {isEdit ? "Save Changes" : "Add Store"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
