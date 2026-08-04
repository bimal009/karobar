"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldRow } from "@/components/shared/field-row"
import { ImageUploader } from "@/components/image-uploader"
import type { ProductForm } from "../client/useProductForm"
import type { ProductCreateFormData } from "../api/product.action"

const NONE = "none"

interface ProductFormFieldsProps {
  form: ProductForm
  data: ProductCreateFormData
  isPending: boolean
}

export function ProductFormFields({ form, data, isPending }: ProductFormFieldsProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form
  const { categories, brands, units, warranties } = data

  return (
    <>
      <FieldRow label="Product Image">
        <ImageUploader
          value={watch("image") ?? null}
          onChange={(url) => setValue("image", url ?? undefined, { shouldValidate: true })}
          folder="/products"
          maxSizeMb={5}
          disabled={isPending}
        />
        {errors.image && <p className="text-sm font-medium text-destructive">{errors.image.message}</p>}
      </FieldRow>
      <FieldRow label="Product Name" required htmlFor="p-name">
        <Input id="p-name" placeholder="e.g. iPhone 15 Pro Max" disabled={isPending} {...register("name")} />
        {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
      </FieldRow>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label="SKU" required htmlFor="p-sku">
          <Input id="p-sku" placeholder="APL-IP15PM-256" disabled={isPending} {...register("sku")} />
          {errors.sku && <p className="text-sm font-medium text-destructive">{errors.sku.message}</p>}
        </FieldRow>
        <FieldRow label="Barcode" htmlFor="p-barcode">
          <Input id="p-barcode" placeholder="8901234567890" disabled={isPending} {...register("barcode")} />
        </FieldRow>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label="Category" required>
          <Select
            items={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={watch("categoryId")}
            onValueChange={(value) => setValue("categoryId", value as string, { shouldValidate: true })}
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
        <FieldRow label="Brand">
          <Select
            items={[{ value: NONE, label: "None" }, ...brands.map((b) => ({ value: b.id, label: b.name }))]}
            value={watch("brandId") ?? NONE}
            onValueChange={(value) => setValue("brandId", value === NONE ? undefined : (value as string))}
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label="Unit">
          <Select
            items={[{ value: NONE, label: "None" }, ...units.map((u) => ({ value: u.id, label: u.name }))]}
            value={watch("unitId") ?? NONE}
            onValueChange={(value) => setValue("unitId", value === NONE ? undefined : (value as string))}
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None</SelectItem>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Warranty">
          <Select
            items={[{ value: NONE, label: "None" }, ...warranties.map((w) => ({ value: w.id, label: w.name }))]}
            value={watch("warrantyId") ?? NONE}
            onValueChange={(value) => setValue("warrantyId", value === NONE ? undefined : (value as string))}
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select warranty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None</SelectItem>
              {warranties.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label="Selling Price" required htmlFor="p-price">
          <Input
            id="p-price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            disabled={isPending}
            {...register("price")}
          />
          {errors.price && <p className="text-sm font-medium text-destructive">{errors.price.message}</p>}
        </FieldRow>
        <FieldRow label="Cost Price" required htmlFor="p-cost">
          <Input
            id="p-cost"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            disabled={isPending}
            {...register("cost")}
          />
          {errors.cost && <p className="text-sm font-medium text-destructive">{errors.cost.message}</p>}
        </FieldRow>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow label="Quantity" required htmlFor="p-qty">
          <Input id="p-qty" type="number" min="0" placeholder="0" disabled={isPending} {...register("quantity")} />
          {errors.quantity && (
            <p className="text-sm font-medium text-destructive">{errors.quantity.message}</p>
          )}
        </FieldRow>
        <FieldRow label="Low Stock Threshold" required htmlFor="p-threshold">
          <Input
            id="p-threshold"
            type="number"
            min="0"
            placeholder="0"
            disabled={isPending}
            {...register("lowStockThreshold")}
          />
        </FieldRow>
      </div>
      <FieldRow label="Expiry Date" htmlFor="p-expiry">
        <Input id="p-expiry" type="date" disabled={isPending} {...register("expiryDate")} />
      </FieldRow>
      <FieldRow label="Status">
        <Select
          items={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
          value={watch("status") ?? "active"}
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
    </>
  )
}
