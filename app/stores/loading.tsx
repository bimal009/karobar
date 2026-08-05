import { PageHeaderSkeleton, CardGridSkeleton } from "@/components/shared/loading-skeletons"

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <CardGridSkeleton items={4} />
    </div>
  )
}
