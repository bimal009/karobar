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
import type { Brand } from "@/lib/database/schemas"
import { BrandInsert, brandInsertSchema } from "@/lib/database/zod/brands"
import { useCreateBrand, useUpdateBrand } from "../client/useBrand"

interface BrandFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  brand?: Brand
}

export function BrandFormSheet({ tenant, trigger, brand }: BrandFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const isEdit = Boolean(brand)

  const { mutateAsync: create, isPending: isCreating } = useCreateBrand(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateBrand(tenant)
  const isPending = isCreating || isUpdating

  const form = useForm<BrandInsert>({
    resolver: zodResolver(brandInsertSchema),
    defaultValues: {
      name: brand?.name ?? "",
      status: brand?.status ?? "active",
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

  async function onSubmit(values: BrandInsert) {
    const promise = (isEdit ? update({ id: brand!.id, data: values }) : create(values)).then((result) => {
      if (result.error) throw new Error(result.message)
      return result
    })

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating brand..." : "Creating brand...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Brand updated successfully!" : "Brand created successfully!",
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
            <SheetTitle>{isEdit ? "Edit Brand" : "Add Brand"}</SheetTitle>
            <SheetDescription>
              {isEdit ? "Update this brand's details." : "Create a new brand to tag your products with."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Brand Name" required htmlFor="brand-name">
              <Input id="brand-name" placeholder="e.g. Samsung" disabled={isPending} {...register("name")} />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
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
              {isEdit ? "Save Changes" : "Add Brand"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
