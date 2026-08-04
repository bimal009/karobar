"use client"

import { toast } from "@/components/ui/toast"
import type { ApiResponse } from "@/lib/common/response"
import type { Meta } from "@/lib/common/pagination"

export function unwrapQuery<T>(res: ApiResponse<T>, title: string): T {
  if (res.error || res.data === undefined) {
    toast.add({ title, description: res.message, type: "error" })
    throw new Error(res.message)
  }
  return res.data
}

/** Like unwrapQuery, but also returns the `meta` (page/limit/total/totalPages) a paginated action attaches alongside `data`. */
export function unwrapPaginatedQuery<T>(res: ApiResponse<T>, title: string): { rows: T; meta: Meta } {
  if (res.error || res.data === undefined || res.meta === undefined) {
    toast.add({ title, description: res.message, type: "error" })
    throw new Error(res.message)
  }
  return { rows: res.data, meta: res.meta }
}
