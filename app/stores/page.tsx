import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, Plus, Store } from "lucide-react"

import { auth } from "@/lib/auth"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { StoreFormSheet } from "@/features/store/components/store-form-sheet"
import { getMyStores } from "@/features/store/api/store.action"
import { headers } from "next/headers"

export default async function StoresPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect("/login")
  }

  const result = await getMyStores()
  const stores = result.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Stores"
        crumbs={[{ label: "My Stores" }]}
      />

      {stores.length === 0 ? (
        <Empty className="rounded-xl border bg-card">
          <EmptyMedia variant="icon">
            <Store />
          </EmptyMedia>
          <EmptyTitle>No stores yet</EmptyTitle>
          <EmptyDescription>Create your first store to start selling and tracking inventory.</EmptyDescription>
          <EmptyContent>
            <StoreFormSheet
              trigger={
                <Button>
                  <Plus /> Create your first store
                </Button>
              }
            />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {stores.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}/dashboard`}
              className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-xs transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base font-bold text-primary">
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{s.name}</span>
                <span className="truncate text-sm text-muted-foreground">/{s.slug}</span>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
