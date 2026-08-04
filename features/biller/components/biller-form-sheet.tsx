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
import type { Biller, StoreLocation } from "@/lib/database/schemas"
import { BillerInsert, billerInsertSchema } from "@/lib/database/zod/billers"
import { useCreateBiller, useUpdateBiller } from "../client/useBiller"

interface BillerFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  biller?: Biller
  stores: StoreLocation[]
}

export function BillerFormSheet({ tenant, trigger, biller, stores }: BillerFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const isEdit = Boolean(biller)

  const { mutateAsync: create, isPending: isCreating } = useCreateBiller(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateBiller(tenant)
  const isPending = isCreating || isUpdating

  const form = useForm<BillerInsert>({
    resolver: zodResolver(billerInsertSchema),
    defaultValues: {
      name: biller?.name ?? "",
      email: biller?.email ?? undefined,
      phone: biller?.phone ?? undefined,
      location: biller?.location ?? undefined,
      status: biller?.status ?? "active",
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

  async function onSubmit(values: BillerInsert) {
    const promise = (isEdit ? update({ id: biller!.id, data: values }) : create(values)).then(
      (result) => {
        if (result.error) throw new Error(result.message)
        return result
      }
    )

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating biller..." : "Creating biller...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Biller updated successfully!" : "Biller created successfully!",
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

  const selectedStore = stores.find((s) => s.name === watch("location"))

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={trigger} />
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <SheetHeader className="border-b">
            <SheetTitle>{isEdit ? "Edit Biller" : "Add Biller"}</SheetTitle>
            <SheetDescription>
              {isEdit ? "Update this biller's details." : "Add a staff member who can process sales at the till."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Full Name" required htmlFor="biller-name">
              <Input id="biller-name" placeholder="e.g. Olivia Brown" disabled={isPending} {...register("name")} />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
            </FieldRow>
            <FieldRow label="Email" htmlFor="biller-email">
              <Input id="biller-email" type="email" placeholder="biller@example.com" disabled={isPending} {...register("email")} />
              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </FieldRow>
            <FieldRow label="Phone" htmlFor="biller-phone">
              <Input id="biller-phone" placeholder="+1 202-555-0100" disabled={isPending} {...register("phone")} />
            </FieldRow>
            <FieldRow label="Store">
              <Select
                items={stores.map((s) => ({ value: s.id, label: s.name }))}
                value={selectedStore?.id}
                onValueChange={(value) => {
                  const store = stores.find((s) => s.id === value)
                  setValue("location", store?.name)
                }}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {isEdit ? "Save Changes" : "Add Biller"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
