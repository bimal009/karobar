import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { SubCategoriesView } from "@/features/sub-category/components/sub-categories-view"
import { getSubCategoryPageData } from "@/features/sub-category/api/sub-category.action"

export default async function SubCategoriesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getSubCategoryPageData(tenant)

  if (result.error) {
    return (
      <PageShell pageName="Sub Categories">
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load sub categories</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      </PageShell>
    )
  }

  const { subCategories = [], categories = [] } = result.data ?? {}
  return (
    <PageShell pageName="Sub Categories">
      <SubCategoriesView tenant={tenant} initialData={subCategories} categories={categories} />
    </PageShell>
  )
}
