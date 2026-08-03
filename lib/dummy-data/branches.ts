import type { Branch, BranchStock } from "@/lib/types"
import { products } from "./catalog"

const TENANT = "t1"

export const branches: Branch[] = [
  { id: "br1", tenantId: TENANT, name: "Downtown Branch", code: "BR-DT", location: "5th Avenue, New York", phone: "+1 202-555-0201", managerName: "James Carter", isMain: true, status: "active" },
  { id: "br2", tenantId: TENANT, name: "Mall Branch", code: "BR-ML", location: "Westfield Mall, Boston", phone: "+1 202-555-0212", managerName: "Emma Davis", isMain: false, status: "active" },
  { id: "br3", tenantId: TENANT, name: "Airport Branch", code: "BR-AP", location: "JFK Terminal 4, New York", phone: "+1 202-555-0223", managerName: "Liam Anderson", isMain: false, status: "active" },
  { id: "br4", tenantId: TENANT, name: "Riverside Branch", code: "BR-RV", location: "Riverside Plaza, Chicago", phone: "+1 202-555-0234", managerName: "Sophia Turner", isMain: false, status: "inactive" },
]

const splitRatios = [0.4, 0.28, 0.2, 0.12]

export const branchStock: BranchStock[] = products.flatMap((product) =>
  branches.map((branch, i) => ({
    branchId: branch.id,
    productId: product.id,
    quantity: Math.round(product.quantity * splitRatios[i]),
  }))
)

export function getBranches() {
  return branches
}

export function getBranchById(id: string) {
  return branches.find((b) => b.id === id)
}

export function getBranchStock(branchId?: string) {
  if (!branchId) return branchStock
  return branchStock.filter((s) => s.branchId === branchId)
}
