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
import type { Unit } from "@/lib/database/schemas"
import { UnitInsert, unitInsertSchema } from "@/lib/database/zod/units"
import { useCreateUnit, useUpdateUnit } from "../client/useUnit"

interface UnitFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  unit?: Unit
}

export function UnitFormSheet({ tenant, trigger, unit }: UnitFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const isEdit = Boolean(unit)

  const { mutateAsync: create, isPending: isCreating } = useCreateUnit(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateUnit(tenant)
  const isPending = isCreating || isUpdating

  const form = useForm<UnitInsert>({
    resolver: zodResolver(unitInsertSchema),
    defaultValues: {
      name: unit?.name ?? "",
      shortName: unit?.shortName ?? "",
      status: unit?.status ?? "active",
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

  async function onSubmit(values: UnitInsert) {
    const promise = (isEdit ? update({ id: unit!.id, data: values }) : create(values)).then((result) => {
      if (result.error) throw new Error(result.message)
      return result
    })

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating unit..." : "Creating unit...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Unit updated successfully!" : "Unit created successfully!",
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
            <SheetTitle>{isEdit ? "Edit Unit" : "Add Unit"}</SheetTitle>
            <SheetDescription>
              {isEdit ? "Update this unit's details." : "Create a new measurement unit for your products."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Unit Name" required htmlFor="unit-name">
              <Input id="unit-name" placeholder="e.g. Kilogram" disabled={isPending} {...register("name")} />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
            </FieldRow>
            <FieldRow label="Short Name" required htmlFor="unit-short">
              <Input id="unit-short" placeholder="e.g. Kg" disabled={isPending} {...register("shortName")} />
              {errors.shortName && (
                <p className="text-sm font-medium text-destructive">{errors.shortName.message}</p>
              )}
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
              {isEdit ? "Save Changes" : "Add Unit"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
