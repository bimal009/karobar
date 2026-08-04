import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { PrintQrCodeView } from "@/features/product/components/print-qrcode-view"
import { getProducts } from "@/features/product/api/product.action"

export default async function PrintQrCodePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getProducts(tenant)

  return (
    <PageShell pageName="Print QR Code">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load products</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <PrintQrCodeView tenant={tenant} initialData={result.data ?? []} />
      )}
    </PageShell>
  )
}
