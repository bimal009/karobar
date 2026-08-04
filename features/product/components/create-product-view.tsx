"use client"

import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import type { ProductInsert } from "@/lib/database/zod/products"
import { useProductForm } from "../client/useProductForm"
import { ProductFormFields } from "./product-form-fields"
import type { ProductCreateFormData } from "../api/product.action"

interface CreateProductViewProps {
  tenant: string
  data: ProductCreateFormData
}

export function CreateProductView({ tenant, data }: CreateProductViewProps) {
  const router = useRouter()
  const { form, submit, isPending } = useProductForm(tenant)

  async function onSubmit(values: ProductInsert) {
    await submit(values, () => router.push(`/${tenant}/products`))
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Create Product"
        crumbs={[
          { label: "Dashboard", href: `/${tenant}/dashboard` },
          { label: "Products", href: `/${tenant}/products` },
          { label: "Create" },
        ]}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <ProductFormFields form={form} data={data} isPending={isPending} />
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => router.push(`/${tenant}/products`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            Save Product
          </Button>
        </div>
      </form>
    </div>
  )
}
