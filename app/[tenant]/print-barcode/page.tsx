import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PrintBarcodeView } from "@/features/product/components/print-barcode-view"
import { getProducts } from "@/features/product/api/product.action"

export default async function PrintBarcodePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getProducts(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load products</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <PrintBarcodeView tenant={tenant} initialData={result.data ?? []} />
}
