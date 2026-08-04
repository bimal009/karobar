import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { CategoriesView } from "@/features/category/components/categories-view"
import { getCategories } from "@/features/category/api/category.action"

export default async function CategoriesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getCategories(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load categories</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <CategoriesView tenant={tenant} initialData={result.data ?? []} />
}
