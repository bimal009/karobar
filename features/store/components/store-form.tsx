"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2, Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/toast" 
import { CountryDropdown } from "@/components/ui/country-dropdown" 

import { ImageUploader } from "@/components/image-uploader"
import { useCreateStore } from "../client/useStore"
import { StoreInsert, storeInsertSchema } from "@/lib/database/zod/stores"
import { cn } from "@/lib/utils"

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function StoreForm({ className }: { className?: string }) {
  const router = useRouter()
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
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form

  const nameValue = watch("name")
  const countryValue = watch("country")
  const logoValue = watch("logo") 

  React.useEffect(() => {
    if (!slugTouched && nameValue) {
      setValue("slug", slugify(nameValue), { shouldValidate: true })
    }
  }, [nameValue, slugTouched, setValue])

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
        router.push(`/${result.data.slug}/dashboard`)
        router.refresh()
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex w-full flex-col gap-8", className)}>
      
    

      <div className="flex w-full flex-col gap-3">
        <div>
          <Label className="text-lg font-semibold">Store Brand & Logo</Label>
          <p className="text-sm text-muted-foreground mt-1">
            This will be the main visual representation of your store. 
            Upload a high-resolution logo or brand image.
          </p>
        </div>
        <ImageUploader
          value={logoValue ?? null}
          onChange={handleLogoChange}
          folder="/stores/logos"
          maxSizeMb={5}
          disabled={isPending}
        />
        {errors.logo && <p className="text-sm font-medium text-destructive">{errors.logo.message}</p>}
      </div>

      <hr className="border-border" />

      {/* Grid Layout for Form Inputs */}
      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="name" className="text-sm font-medium">
            Store Name <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Store className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input 
              id="name" 
              placeholder="Acme Retail" 
              className="pl-9 h-10"
              disabled={isPending} 
              {...register("name")} 
            />
          </div>
          {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor="slug" className="text-sm font-medium">
            Store URL / Slug <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center">
            <span className="flex items-center h-10 px-3 border border-r-0 border-input bg-muted/50 text-muted-foreground text-sm rounded-l-md font-medium">
              /store/
            </span>
            <Input
              id="slug"
              placeholder="acme-retail"
              className="rounded-l-none h-10 focus-visible:z-10"
              disabled={isPending}
              {...register("slug", {
                onChange: () => setSlugTouched(true),
              })}
            />
          </div>
          {errors.slug && <p className="text-sm font-medium text-destructive">{errors.slug.message}</p>}
        </div>
      </div>

      <div className="flex w-full flex-col gap-2.5">
        <Label htmlFor="country" className="text-sm font-medium">
          Store Region <span className="text-destructive">*</span>
        </Label>
        <CountryDropdown
          disabled={isPending}
          defaultValue={countryValue}
          onChange={handleCountryChange}
        />
        {errors.country && <p className="text-sm font-medium text-destructive">{errors.country.message}</p>}
      </div>

      <Button type="submit" disabled={isPending} size="lg" className="w-full mt-4 text-base font-semibold">
        {isPending ? (
          <Loader2 className="mr-2 size-5 animate-spin" />
        ) : (
          <Store className="mr-2 size-5" />
        )}
        {isPending ? "Creating your store..." : "Create Store"}
      </Button>
    </form>
  )
}