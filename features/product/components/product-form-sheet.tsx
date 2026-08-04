"use client"

import * as React from "react"
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
import type { ProductInsert } from "@/lib/database/zod/products"
import { useProductForm } from "../client/useProductForm"
import { ProductFormFields } from "./product-form-fields"
import type { ProductCreateFormData, ProductWithRelations } from "../api/product.action"

interface ProductFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  data: ProductCreateFormData
  product?: ProductWithRelations
}

export function ProductFormSheet({ tenant, trigger, data, product }: ProductFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const { form, submit, isPending, isEdit } = useProductForm(tenant, product)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) form.reset()
  }

  async function onSubmit(values: ProductInsert) {
    await submit(values, () => {
      setOpen(false)
      form.reset()
    })
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={trigger} />
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-lg">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <SheetHeader className="border-b">
            <SheetTitle>{isEdit ? "Edit Product" : "Add Product"}</SheetTitle>
            <SheetDescription>
              {isEdit ? "Update this product's details." : "Create a new product for this store."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <ProductFormFields form={form} data={data} isPending={isPending} />
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <SheetClose render={<Button type="button" variant="outline" disabled={isPending} />}>
              Cancel
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {isEdit ? "Save Changes" : "Add Product"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
