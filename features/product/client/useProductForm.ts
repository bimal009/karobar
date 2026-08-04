"use client"

import { useForm, type UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { toast } from "@/components/ui/toast"
import { ProductFormInput, ProductInsert, productInsertSchema } from "@/lib/database/zod/products"
import { useCreateProduct, useUpdateProduct } from "./useProduct"
import type { ProductWithRelations } from "../api/product.action"

export type ProductForm = UseFormReturn<ProductFormInput, unknown, ProductInsert>

interface UseProductFormResult {
  form: ProductForm
  submit: (values: ProductInsert, onSuccess?: () => void) => Promise<void>
  isPending: boolean
  isEdit: boolean
}

export function useProductForm(tenant: string, product?: ProductWithRelations): UseProductFormResult {
  const isEdit = Boolean(product)

  const { mutateAsync: create, isPending: isCreating } = useCreateProduct(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateProduct(tenant)
  const isPending = isCreating || isUpdating

  const form = useForm<ProductFormInput, unknown, ProductInsert>({
    resolver: zodResolver(productInsertSchema),
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      barcode: product?.barcode ?? undefined,
      categoryId: product?.categoryId ?? "",
      subCategoryId: product?.subCategoryId ?? undefined,
      brandId: product?.brandId ?? undefined,
      unitId: product?.unitId ?? undefined,
      warrantyId: product?.warrantyId ?? undefined,
      price: product ? Number(product.price) : 0,
      cost: product ? Number(product.cost) : 0,
      quantity: product?.quantity ?? 0,
      lowStockThreshold: product?.lowStockThreshold ?? 0,
      expiryDate: product?.expiryDate ?? undefined,
      status: product?.status ?? "active",
    },
  })

  async function submit(values: ProductInsert, onSuccess?: () => void) {
    const promise = (isEdit ? update({ id: product!.id, data: values }) : create(values)).then(
      (result) => {
        if (result.error) throw new Error(result.message)
        return result
      }
    )

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating product..." : "Creating product...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Product updated successfully!" : "Product created successfully!",
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
      onSuccess?.()
    } catch {
      // toast already surfaced the error
    }
  }

  return { form, submit, isPending, isEdit }
}
