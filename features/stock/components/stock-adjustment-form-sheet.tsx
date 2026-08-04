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
import {
  StockAdjustmentFormInput,
  StockAdjustmentInput,
  stockAdjustmentSchema,
} from "@/lib/database/zod/stock-movements"
import { useAdjustStock } from "../client/useStock"
import type { StockFormOptions } from "../api/stock.action"

interface StockAdjustmentFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  options: StockFormOptions
  defaultBranchId?: string
  defaultProductId?: string
}

export function StockAdjustmentFormSheet({
  tenant,
  trigger,
  options,
  defaultBranchId,
  defaultProductId,
}: StockAdjustmentFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const { mutateAsync: adjust, isPending } = useAdjustStock(tenant)

  const form = useForm<StockAdjustmentFormInput, unknown, StockAdjustmentInput>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      branchId: defaultBranchId ?? "",
      productId: defaultProductId ?? "",
      quantityChange: 0,
      reason: "",
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
    if (!next) reset({ branchId: defaultBranchId ?? "", productId: defaultProductId ?? "", quantityChange: 0, reason: "" })
  }

  async function onSubmit(values: StockAdjustmentInput) {
    const promise = adjust(values).then((result) => {
      if (result.error) throw new Error(result.message)
      return result
    })

    toast.promise(promise, {
      loading: { title: "Adjusting stock...", type: "loading" },
      success: { title: "Success", description: "Stock adjusted successfully!", type: "success" },
      error: (err: Error) => ({ title: "Adjustment failed", description: err.message, type: "error" }),
    })

    try {
      await promise
      setOpen(false)
      reset({ branchId: defaultBranchId ?? "", productId: defaultProductId ?? "", quantityChange: 0, reason: "" })
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
            <SheetTitle>New Stock Adjustment</SheetTitle>
            <SheetDescription>Correct a product&apos;s stock quantity for a branch.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <FieldRow label="Branch" required>
              <Select
                value={watch("branchId")}
                onValueChange={(value) => setValue("branchId", value as string, { shouldValidate: true })}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {options.branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.branchId && <p className="text-sm font-medium text-destructive">{errors.branchId.message}</p>}
            </FieldRow>
            <FieldRow label="Product" required>
              <Select
                value={watch("productId")}
                onValueChange={(value) => setValue("productId", value as string, { shouldValidate: true })}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {options.products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && <p className="text-sm font-medium text-destructive">{errors.productId.message}</p>}
            </FieldRow>
            <FieldRow label="Adjustment Quantity" required htmlFor="adj-qty">
              <Input
                id="adj-qty"
                type="number"
                placeholder="e.g. -5 or 10"
                disabled={isPending}
                {...register("quantityChange")}
              />
              {errors.quantityChange && (
                <p className="text-sm font-medium text-destructive">{errors.quantityChange.message}</p>
              )}
            </FieldRow>
            <FieldRow label="Reason" htmlFor="adj-reason">
              <Textarea
                id="adj-reason"
                placeholder="e.g. Damaged in transit"
                rows={3}
                disabled={isPending}
                {...register("reason")}
              />
            </FieldRow>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <SheetClose render={<Button type="button" variant="outline" disabled={isPending} />}>
              Cancel
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Save Adjustment
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
