"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2 } from "lucide-react"

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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FieldRow } from "@/components/shared/field-row"
import { ImageUploader } from "@/components/image-uploader"
import { CountryDropdown } from "@/components/ui/country-dropdown"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { useCreateStore } from "../client/useStore"
import { StoreInsert, storeInsertSchema } from "@/lib/database/zod/stores"
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/common/currencies"

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

interface StoreFormSheetProps {
  trigger: React.ReactElement
}

export function StoreFormSheet({ trigger }: StoreFormSheetProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [slugTouched, setSlugTouched] = React.useState(false)

  const { mutateAsync, isPending } = useCreateStore()

  const form = useForm<StoreInsert>({
    resolver: zodResolver(storeInsertSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: undefined,
      country: "",
      currency: DEFAULT_CURRENCY,
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

  const nameValue = watch("name")
  const countryValue = watch("country")
  const currencyValue = watch("currency")
  const logoValue = watch("logo")

  React.useEffect(() => {
    if (!slugTouched && nameValue) {
      setValue("slug", slugify(nameValue), { shouldValidate: true })
    }
  }, [nameValue, slugTouched, setValue])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      reset()
      setServerError(null)
      setSlugTouched(false)
    }
  }

  const handleLogoChange = React.useCallback(
    (url: string | null) => setValue("logo", url ?? undefined, { shouldValidate: true }),
    [setValue]
  )

  const handleCountryChange = React.useCallback(
    (country: { alpha3: string }) => setValue("country", country.alpha3, { shouldValidate: true }),
    [setValue]
  )

  async function onSubmit(values: StoreInsert) {
    setServerError(null)

    const promise = mutateAsync(values).then((result) => {
      if (result && typeof result === "object" && "error" in result && result.error) {
        throw new Error(result.message ?? "Failed to create store")
      }
      return result
    })

    toast.promise(promise, {
      loading: { title: "Creating store...", type: "loading" },
      success: { title: "Success", description: "Store created successfully!", type: "success" },
      error: (err: Error) => ({
        title: "Store creation failed",
        description: err.message,
        type: "error",
      }),
    })

    try {
      const result = await promise
      if (result.data) {
        setOpen(false)
        router.push(`/${result.data.slug}/dashboard`)
        router.refresh()
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={trigger} />
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <SheetHeader className="border-b">
            <SheetTitle>Create a Store</SheetTitle>
            <SheetDescription>
              Set up a new store workspace. You can add branches, staff and products once it&apos;s created.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <FieldRow label="Store Logo">
              <ImageUploader
                value={logoValue ?? null}
                onChange={handleLogoChange}
                folder="/stores/logos"
                maxSizeMb={5}
                disabled={isPending}
              />
              {errors.logo && <p className="text-sm font-medium text-destructive">{errors.logo.message}</p>}
            </FieldRow>

            <FieldRow label="Store Name" required htmlFor="store-name">
              <Input
                id="store-name"
                placeholder="Acme Retail"
                disabled={isPending}
                {...register("name")}
              />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
            </FieldRow>

            <FieldRow label="Store URL / Slug" required htmlFor="store-slug">
              <div className="flex items-center">
                <span className="flex h-9 shrink-0 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
                  /store/
                </span>
                <Input
                  id="store-slug"
                  placeholder="acme-retail"
                  className="rounded-l-none focus-visible:z-10"
                  disabled={isPending}
                  {...register("slug", {
                    onChange: () => setSlugTouched(true),
                  })}
                />
              </div>
              {errors.slug && <p className="text-sm font-medium text-destructive">{errors.slug.message}</p>}
            </FieldRow>

            <FieldRow label="Store Region" required>
              <CountryDropdown
                disabled={isPending}
                defaultValue={countryValue}
                onChange={handleCountryChange}
              />
              {errors.country && <p className="text-sm font-medium text-destructive">{errors.country.message}</p>}
            </FieldRow>

            <FieldRow label="Currency" required>
              <Select
                items={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
                value={currencyValue}
                onValueChange={(value) => value && setValue("currency", value, { shouldValidate: true })}
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && <p className="text-sm font-medium text-destructive">{errors.currency.message}</p>}
            </FieldRow>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <SheetClose render={<Button type="button" variant="outline" disabled={isPending} />}>
              Cancel
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Create Store
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
