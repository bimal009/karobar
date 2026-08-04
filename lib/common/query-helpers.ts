"use client"

import { toast } from "@/components/ui/toast"
import type { ApiResponse } from "@/lib/common/response"


export function unwrapQuery<T>(res: ApiResponse<T>, title: string): T {
  if (res.error || res.data === undefined) {
    toast.add({ title, description: res.message, type: "error" })
    throw new Error(res.message)
  }
  return res.data
}
