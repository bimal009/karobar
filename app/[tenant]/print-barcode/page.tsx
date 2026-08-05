import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { PrintBarcodeView } from "@/features/product/components/print-barcode-view"
import { getAllProducts } from "@/features/product/api/product.action"

export default async function PrintBarcodePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getAllProducts(tenant)

  return (
    <PageShell pageName="Print Barcode">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load products</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <PrintBarcodeView tenant={tenant} initialData={result.data ?? []} />
      )}
    </PageShell>
  )
}
