import Link from "next/link"
import { Store } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Store className="size-6" />
      </div>
      <h1 className="text-4xl font-bold">404</h1>
      <p className="max-w-sm text-muted-foreground">
        We couldn&apos;t find the workspace or page you&apos;re looking for. It may have been moved, or the store
        slug doesn&apos;t exist.
      </p>
      <Button render={<Link href="/" />}>Back to home</Button>
    </div>
  )
}
