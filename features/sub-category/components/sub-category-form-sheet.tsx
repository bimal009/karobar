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
import type { Category } from "@/lib/database/schemas"
import { SubCategoryInsert, subCategoryInsertSchema } from "@/lib/database/zod/sub-categories"
import { useCreateSubCategory, useUpdateSubCategory } from "../client/useSubCategory"
import type { SubCategoryWithCategory } from "../api/sub-category.action"

interface SubCategoryFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  categories: Category[]
  subCategory?: SubCategoryWithCategory
}

export function SubCategoryFormSheet({
  tenant,
  trigger,
  categories,
  subCategory,
}: SubCategoryFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const isEdit = Boolean(subCategory)

  const { mutateAsync: create, isPending: isCreating } = useCreateSubCategory(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateSubCategory(tenant)
  const isPending = isCreating || isUpdating

  const form = useForm<SubCategoryInsert>({
    resolver: zodResolver(subCategoryInsertSchema),
    defaultValues: {
      name: subCategory?.name ?? "",
      categoryId: subCategory?.categoryId ?? "",
      status: subCategory?.status ?? "active",
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

  async function onSubmit(values: SubCategoryInsert) {
    const promise = (isEdit ? update({ id: subCategory!.id, data: values }) : create(values)).then(
      (result) => {
        if (result.error) throw new Error(result.message)
        return result
      }
    )

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating sub category..." : "Creating sub category...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Sub category updated successfully!" : "Sub category created successfully!",
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
            <SheetTitle>{isEdit ? "Edit Sub Category" : "Add Sub Category"}</SheetTitle>
            <SheetDescription>
              {isEdit
                ? "Update this sub category's details."
                : "Create a new sub category nested under a parent category."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Sub Category Name" required htmlFor="subcat-name">
              <Input
                id="subcat-name"
                placeholder="e.g. Mobile Phones"
                disabled={isPending}
                {...register("name")}
              />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
            </FieldRow>
            <FieldRow label="Parent Category" required>
              <Select
                value={watch("categoryId")}
                onValueChange={(value) => setValue("categoryId", value as string)}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm font-medium text-destructive">{errors.categoryId.message}</p>
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
              {isEdit ? "Save Changes" : "Add Sub Category"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
