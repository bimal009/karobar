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
import {
  StockTransferFormInput,
  StockTransferInput,
  stockTransferSchema,
} from "@/lib/database/zod/stock-movements"
import { useTransferStock } from "../client/useStock"
import type { StockFormOptions } from "../api/stock.action"

interface StockTransferFormSheetProps {
  tenant: string
  trigger: React.ReactElement
  options: StockFormOptions
}

const emptyValues: StockTransferFormInput = {
  productId: "",
  fromBranchId: "",
  toBranchId: "",
  quantity: 1,
  reason: "",
}

export function StockTransferFormSheet({ tenant, trigger, options }: StockTransferFormSheetProps) {
  const [open, setOpen] = React.useState(false)
  const { mutateAsync: transfer, isPending } = useTransferStock(tenant)

  const form = useForm<StockTransferFormInput, unknown, StockTransferInput>({
    resolver: zodResolver(stockTransferSchema),
    defaultValues: emptyValues,
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
    if (!next) reset(emptyValues)
  }

  async function onSubmit(values: StockTransferInput) {
    const promise = transfer(values).then((result) => {
      if (result.error) throw new Error(result.message)
      return result
    })

    toast.promise(promise, {
      loading: { title: "Transferring stock...", type: "loading" },
      success: { title: "Success", description: "Stock transferred successfully!", type: "success" },
      error: (err: Error) => ({ title: "Transfer failed", description: err.message, type: "error" }),
    })

    try {
      await promise
      setOpen(false)
      reset(emptyValues)
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
            <SheetTitle>New Stock Transfer</SheetTitle>
            <SheetDescription>Move stock from one branch to another.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
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
            <FieldRow label="From Branch" required>
              <Select
                value={watch("fromBranchId")}
                onValueChange={(value) => setValue("fromBranchId", value as string, { shouldValidate: true })}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source branch" />
                </SelectTrigger>
                <SelectContent>
                  {options.branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fromBranchId && (
                <p className="text-sm font-medium text-destructive">{errors.fromBranchId.message}</p>
              )}
            </FieldRow>
            <FieldRow label="To Branch" required>
              <Select
                value={watch("toBranchId")}
                onValueChange={(value) => setValue("toBranchId", value as string, { shouldValidate: true })}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select destination branch" />
                </SelectTrigger>
                <SelectContent>
                  {options.branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.toBranchId && <p className="text-sm font-medium text-destructive">{errors.toBranchId.message}</p>}
            </FieldRow>
            <FieldRow label="Quantity" required htmlFor="transfer-qty">
              <Input id="transfer-qty" type="number" min={1} placeholder="e.g. 20" disabled={isPending} {...register("quantity")} />
              {errors.quantity && <p className="text-sm font-medium text-destructive">{errors.quantity.message}</p>}
            </FieldRow>
            <FieldRow label="Reason" htmlFor="transfer-reason">
              <Input id="transfer-reason" placeholder="e.g. Store replenishment" disabled={isPending} {...register("reason")} />
            </FieldRow>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <SheetClose render={<Button type="button" variant="outline" disabled={isPending} />}>
              Cancel
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Save Transfer
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
