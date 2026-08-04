import Link from "next/link"
import { StoreForm } from "@/features/store/components/store-form"
import { getMyStores } from "@/features/store/api/store.action"

export default async function StoresPage() {
  const result = await getMyStores()
  const stores = result.data ?? []

  return (
    <div className="flex flex-col gap-6">
      {stores.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Your Stores</h2>
          <div className="flex flex-col gap-2">
            {stores.map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug}/dashboard`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{s.name}</span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            Create another store
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>
      )}
      <StoreForm />
    </div>
  )
}
