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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldRow } from "@/components/shared/field-row"
import { toast } from "@/components/ui/toast"
import type { Warranty } from "@/lib/database/schemas"
import { WarrantyInsert, warrantyInsertSchema } from "@/lib/database/zod/warranties"
import { useCreateWarranty, useUpdateWarranty } from "../client/useWarranty"

interface WarrantyFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  warranty?: Warranty
}

export function WarrantyFormSheet({ tenant, trigger, warranty }: WarrantyFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const isEdit = Boolean(warranty)

  const { mutateAsync: create, isPending: isCreating } = useCreateWarranty(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateWarranty(tenant)
  const isPending = isCreating || isUpdating

  const form = useForm<WarrantyInsert>({
    resolver: zodResolver(warrantyInsertSchema),
    defaultValues: {
      name: warranty?.name ?? "",
      duration: warranty?.duration ?? "",
      description: warranty?.description ?? undefined,
      status: warranty?.status ?? "active",
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

  async function onSubmit(values: WarrantyInsert) {
    const promise = (isEdit ? update({ id: warranty!.id, data: values }) : create(values)).then(
      (result) => {
        if (result.error) throw new Error(result.message)
        return result
      }
    )

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating warranty..." : "Creating warranty...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Warranty updated successfully!" : "Warranty created successfully!",
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
            <SheetTitle>{isEdit ? "Edit Warranty" : "Add Warranty"}</SheetTitle>
            <SheetDescription>
              {isEdit
                ? "Update this warranty policy's details."
                : "Create a new warranty policy to attach to products."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Warranty Name" required htmlFor="w-name">
              <Input id="w-name" placeholder="e.g. 1 Year Warranty" disabled={isPending} {...register("name")} />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
            </FieldRow>
            <FieldRow label="Duration" required htmlFor="w-duration">
              <Input id="w-duration" placeholder="e.g. 12 months" disabled={isPending} {...register("duration")} />
              {errors.duration && (
                <p className="text-sm font-medium text-destructive">{errors.duration.message}</p>
              )}
            </FieldRow>
            <FieldRow label="Description" htmlFor="w-desc">
              <Textarea
                id="w-desc"
                placeholder="What this warranty covers..."
                rows={3}
                disabled={isPending}
                {...register("description")}
              />
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
              {isEdit ? "Save Changes" : "Add Warranty"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
