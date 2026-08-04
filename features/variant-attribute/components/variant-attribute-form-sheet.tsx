"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, X } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldRow } from "@/components/shared/field-row"
import { toast } from "@/components/ui/toast"
import type { VariantAttribute } from "@/lib/database/schemas"
import { VariantAttributeInsert, variantAttributeInsertSchema } from "@/lib/database/zod/variant-attributes"
import { useCreateVariantAttribute, useUpdateVariantAttribute } from "../client/useVariantAttribute"

interface VariantAttributeFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  variantAttribute?: VariantAttribute
}

export function VariantAttributeFormSheet({
  tenant,
  trigger,
  variantAttribute,
}: VariantAttributeFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const [valueDraft, setValueDraft] = React.useState("")
  const isEdit = Boolean(variantAttribute)

  const { mutateAsync: create, isPending: isCreating } = useCreateVariantAttribute(tenant)
  const { mutateAsync: update, isPending: isUpdating } = useUpdateVariantAttribute(tenant)
  const isPending = isCreating || isUpdating

  const form = useForm<VariantAttributeInsert>({
    resolver: zodResolver(variantAttributeInsertSchema),
    defaultValues: {
      name: variantAttribute?.name ?? "",
      values: variantAttribute?.values ?? [],
      status: variantAttribute?.status ?? "active",
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

  const values = watch("values") ?? []

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      reset()
      setValueDraft("")
    }
  }

  function addValue() {
    const trimmed = valueDraft.trim()
    if (!trimmed || values.includes(trimmed)) {
      setValueDraft("")
      return
    }
    setValue("values", [...values, trimmed], { shouldValidate: true })
    setValueDraft("")
  }

  function removeValue(value: string) {
    setValue(
      "values",
      values.filter((v) => v !== value),
      { shouldValidate: true }
    )
  }

  async function onSubmit(values: VariantAttributeInsert) {
    const promise = (
      isEdit ? update({ id: variantAttribute!.id, data: values }) : create(values)
    ).then((result) => {
      if (result.error) throw new Error(result.message)
      return result
    })

    toast.promise(promise, {
      loading: { title: isEdit ? "Updating attribute..." : "Creating attribute...", type: "loading" },
      success: {
        title: "Success",
        description: isEdit ? "Attribute updated successfully!" : "Attribute created successfully!",
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
      setValueDraft("")
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
            <SheetTitle>{isEdit ? "Edit Variant Attribute" : "Add Variant Attribute"}</SheetTitle>
            <SheetDescription>
              Define an attribute and its possible values, e.g. Color or Size.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Attribute Name" required htmlFor="va-name">
              <Input id="va-name" placeholder="e.g. Color" disabled={isPending} {...register("name")} />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
            </FieldRow>
            <FieldRow label="Values" required htmlFor="va-values">
              <div className="flex gap-2">
                <Input
                  id="va-values"
                  placeholder="e.g. Red"
                  disabled={isPending}
                  value={valueDraft}
                  onChange={(e) => setValueDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addValue()
                    }
                  }}
                />
                <Button type="button" variant="outline" disabled={isPending} onClick={addValue}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {values.map((value) => (
                  <Badge key={value} variant="outline" className="gap-1 pr-1">
                    {value}
                    <button
                      type="button"
                      aria-label={`Remove ${value}`}
                      className="rounded-full p-0.5 hover:bg-muted"
                      disabled={isPending}
                      onClick={() => removeValue(value)}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {errors.values && (
                <p className="text-sm font-medium text-destructive">{errors.values.message}</p>
              )}
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
              {isEdit ? "Save Changes" : "Add Attribute"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
