import type { AppUser } from "@/lib/types"

export const users: AppUser[] = [
  { id: "u1", tenantId: "t1", branchId: null, name: "Sarah Johnson", email: "sarah@acmeretail.com", avatarInitial: "S", role: "admin", status: "active", phone: "+1 202-555-0176", joinedAt: "2024-01-12" },
  { id: "u2", tenantId: "t1", branchId: "br1", name: "James Carter", email: "james@acmeretail.com", avatarInitial: "J", role: "manager", status: "active", phone: "+1 202-555-0132", joinedAt: "2024-02-02" },
  { id: "u3", tenantId: "t1", branchId: "br1", name: "Olivia Brown", email: "olivia@acmeretail.com", avatarInitial: "O", role: "salesperson", status: "active", phone: "+1 202-555-0198", joinedAt: "2024-02-18" },
  { id: "u6", tenantId: "t1", branchId: "br1", name: "Ava Martinez", email: "ava@acmeretail.com", avatarInitial: "A", role: "salesperson", status: "active", phone: "+1 202-555-0177", joinedAt: "2024-03-12" },
  { id: "u5", tenantId: "t1", branchId: "br2", name: "Emma Davis", email: "emma@acmeretail.com", avatarInitial: "E", role: "manager", status: "active", phone: "+1 202-555-0144", joinedAt: "2024-04-10" },
  { id: "u4", tenantId: "t1", branchId: "br2", name: "Noah Wilson", email: "noah@acmeretail.com", avatarInitial: "N", role: "salesperson", status: "active", phone: "+1 202-555-0111", joinedAt: "2024-03-01" },
  { id: "u7", tenantId: "t1", branchId: "br3", name: "Liam Anderson", email: "liam@acmeretail.com", avatarInitial: "L", role: "manager", status: "active", phone: "+1 202-555-0163", joinedAt: "2024-05-05" },
  { id: "u8", tenantId: "t1", branchId: "br4", name: "Sophia Turner", email: "sophia@acmeretail.com", avatarInitial: "S", role: "manager", status: "inactive", phone: "+1 202-555-0189", joinedAt: "2024-06-20" },
]

export function getUsersByTenant(tenantId: string): AppUser[] {
  return users.filter((u) => u.tenantId === tenantId)
}

export function getUsersByBranch(branchId: string): AppUser[] {
  return users.filter((u) => u.branchId === branchId)
}

export function getCurrentUser(tenantId: string): AppUser {
  return users.find((u) => u.tenantId === tenantId && u.role === "admin") ?? users[0]
}
