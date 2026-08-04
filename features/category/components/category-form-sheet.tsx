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
import { CategoryInsert, categoryInsertSchema } from "@/lib/database/zod/categories"
import { useCreateCategory, useUpdateCategory } from "../client/useCategory"

interface CategoryFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  category?: Category
}

export function CategoryFormSheet({ tenant, trigger, category }: CategoryFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const isEdit = Boolean(category)

  const { mutateAsync: create, isPending: isCreating } = useCreateCategory(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateCategory(tenant)
  const isPending = isCreating || isUpdating

  const form = useForm<CategoryInsert>({
    resolver: zodResolver(categoryInsertSchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      status: category?.status ?? "active",
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

  async function onSubmit(values: CategoryInsert) {
    const promise = (isEdit ? update({ id: category!.id, data: values }) : create(values)).then(
      (result) => {
        if (result.error) throw new Error(result.message)
        return result
      }
    )

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating category..." : "Creating category...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Category updated successfully!" : "Category created successfully!",
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
            <SheetTitle>{isEdit ? "Edit Category" : "Add Category"}</SheetTitle>
            <SheetDescription>
              {isEdit ? "Update this category's details." : "Create a new product category for this store."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Category Name" required htmlFor="cat-name">
              <Input id="cat-name" placeholder="e.g. Electronics" disabled={isPending} {...register("name")} />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
            </FieldRow>
            <FieldRow label="Slug" required htmlFor="cat-slug">
              <Input id="cat-slug" placeholder="e.g. electronics" disabled={isPending} {...register("slug")} />
              {errors.slug && <p className="text-sm font-medium text-destructive">{errors.slug.message}</p>}
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
              {isEdit ? "Save Changes" : "Add Category"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
